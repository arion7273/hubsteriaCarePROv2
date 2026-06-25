import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { ApiServices } from './handlers';
import type { ApiMiddleware } from './middleware';
import { createRequestIdMiddleware } from './middleware';
import { fail, type ApiRequest, type ApiResponse, type HttpMethod } from './http';
import {
  createConsoleStructuredLogger,
  createInMemoryMetricsRecorder,
  createPlaceholderErrorTracker,
  type ApiMetricsRecorder,
  type ErrorTracker,
  type StructuredApiLog
} from './observability';
import { openApiDocument } from './openapi';
import { createApiRouter } from './router';

export type NodeApiServerOptions = {
  middlewares?: ApiMiddleware[];
  metrics?: ApiMetricsRecorder;
  errorTracker?: ErrorTracker;
  structuredLogger?: (entry: StructuredApiLog) => void;
  readiness?: () => Promise<{ ok: boolean; checks: Record<string, boolean | string> }>;
  corsAllowedOrigins?: string[];
  maxBodyBytes?: number;
  secureCookies?: boolean;
};

const DEFAULT_MAX_BODY_BYTES = 1_000_000;
const SESSION_COOKIE_NAME = 'hubsteria_session';

export function createNodeApiServer(services: ApiServices, options: NodeApiServerOptions = {}): Server {
  const router = createApiRouter(services, [createRequestIdMiddleware(randomUUID), ...(options.middlewares ?? [])]);
  const metrics = options.metrics ?? createInMemoryMetricsRecorder();
  const structuredLogger = options.structuredLogger ?? createConsoleStructuredLogger();
  const errorTracker = options.errorTracker ?? createPlaceholderErrorTracker(false);

  return createServer(async (request, response) => {
    const startedAt = Date.now();
    const requestId = String(request.headers['x-request-id'] ?? randomUUID());
    response.setHeader('x-request-id', requestId);
    applySecurityHeaders(response);

    if (!applyCors(request, response, options.corsAllowedOrigins)) {
      writeJson(response, 403, fail('cors_origin_denied', 'Origin is not allowed', 403));
      recordTelemetry({ request, response, requestId, startedAt, metrics, structuredLogger });
      return;
    }

    if (request.method === 'OPTIONS') {
      response.statusCode = 204;
      response.end();
      recordTelemetry({ request, response, requestId, startedAt, metrics, structuredLogger });
      return;
    }

    if (request.url === '/healthz') {
      writeJson(response, 200, { ok: true, requestId });
      recordTelemetry({ request, response, requestId, startedAt, metrics, structuredLogger });
      return;
    }

    if (request.url === '/readyz') {
      const readiness = options.readiness
        ? await options.readiness()
        : { ok: true, checks: { api: true, repositories: true } };
      writeJson(response, readiness.ok ? 200 : 503, { ...readiness, requestId });
      recordTelemetry({ request, response, requestId, startedAt, metrics, structuredLogger });
      return;
    }

    if (request.url === '/metrics') {
      writeJson(response, 200, { ok: true, requestId, metrics: metrics.snapshot() });
      recordTelemetry({ request, response, requestId, startedAt, metrics, structuredLogger });
      return;
    }

    if (request.url === '/openapi.json') {
      writeJson(response, 200, openApiDocument);
      recordTelemetry({ request, response, requestId, startedAt, metrics, structuredLogger });
      return;
    }

    const apiRequest = await toApiRequest(request, requestId, options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES).catch((error) => {
      if (error instanceof RequestBodyTooLargeError) {
        return {
          ok: false as const,
          response: fail('payload_too_large', 'Request body is too large', 413)
        };
      }
      errorTracker.captureException(error, { requestId, path: request.url ?? '/', method: request.method ?? 'UNKNOWN' });
      return {
        ok: false as const,
        response: fail('internal_server_error', 'Internal server error', 500)
      };
    });

    if (!apiRequest.ok) {
      writeApiResponse(response, apiRequest.response);
      recordTelemetry({ request, response, requestId, startedAt, metrics, structuredLogger });
      return;
    }

    const apiResponse = await router.handle(apiRequest.request);
    applySessionCookies(request, response, apiResponse, Boolean(options.secureCookies));
    writeApiResponse(response, apiResponse);
    recordTelemetry({ request, response, requestId, startedAt, metrics, structuredLogger });
  });
}

async function toApiRequest(request: IncomingMessage, requestId: string, maxBodyBytes: number): Promise<
  | {
      ok: true;
      request: ApiRequest;
    }
  | {
      ok: false;
      response: ApiResponse;
    }
> {
  const method = request.method as HttpMethod | undefined;

  if (!method || !['GET', 'POST', 'PATCH', 'DELETE'].includes(method)) {
    return {
      ok: false,
      response: fail('method_not_allowed', `Method ${request.method ?? 'UNKNOWN'} is not allowed`, 405)
    };
  }

  const url = new URL(request.url ?? '/', 'http://localhost');
  const rawBody = await readBody(request, maxBodyBytes);
  const headers = normalizeHeaders(request);

  if (rawBody.length > 0 && !headers['content-type']?.includes('application/json')) {
    return {
      ok: false,
      response: fail('unsupported_media_type', 'Content-Type must be application/json', 415)
    };
  }

  const parsedBody = rawBody.length > 0 ? parseJson(rawBody) : undefined;

  if (parsedBody instanceof Error) {
    return {
      ok: false,
      response: fail('invalid_json', 'Request body must be valid JSON', 400)
    };
  }

  return {
    ok: true,
    request: {
      method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      body: parsedBody,
      sessionId: headers['x-session-id'] ?? readSessionCookie(headers.cookie),
      headers,
      ip: request.socket.remoteAddress,
      requestId
    }
  };
}

function normalizeHeaders(request: IncomingMessage): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(request.headers).map(([key, value]) => [key.toLowerCase(), Array.isArray(value) ? value.join(',') : value])
  );
}

function readBody(request: IncomingMessage, maxBodyBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    let tooLarge = false;
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      if (tooLarge) return;
      body += chunk;
      if (Buffer.byteLength(body, 'utf8') > maxBodyBytes) {
        tooLarge = true;
      }
    });
    request.on('end', () => {
      if (tooLarge) {
        reject(new RequestBodyTooLargeError());
        return;
      }
      resolve(body);
    });
    request.on('error', reject);
  });
}

function parseJson(body: string): unknown | Error {
  try {
    return JSON.parse(body);
  } catch (error) {
    return error instanceof Error ? error : new Error('Invalid JSON');
  }
}

function writeApiResponse(response: ServerResponse, apiResponse: ApiResponse): void {
  writeJson(response, apiResponse.status, apiResponse);
}

function writeJson(response: ServerResponse, status: number, payload: unknown): void {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function applySecurityHeaders(response: ServerResponse): void {
  response.setHeader('x-content-type-options', 'nosniff');
  response.setHeader('x-frame-options', 'DENY');
  response.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  response.setHeader('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('cross-origin-resource-policy', 'same-site');
  response.setHeader('content-security-policy', "default-src 'none'; frame-ancestors 'none'");
}

function applyCors(request: IncomingMessage, response: ServerResponse, allowedOrigins: string[] | undefined): boolean {
  const origin = request.headers.origin;
  if (!origin) return true;
  if (!allowedOrigins?.length || !allowedOrigins.includes(origin)) return false;

  response.setHeader('access-control-allow-origin', origin);
  response.setHeader('access-control-allow-credentials', 'true');
  response.setHeader('vary', 'Origin');
  response.setHeader('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  response.setHeader('access-control-allow-headers', 'content-type,x-session-id,x-csrf-token,x-request-id');
  return true;
}

function applySessionCookies(request: IncomingMessage, response: ServerResponse, apiResponse: ApiResponse, secure: boolean): void {
  const path = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (path === '/auth/login' && apiResponse.ok) {
    const sessionId = (apiResponse.data as { session?: { id?: string } }).session?.id;
    if (sessionId) {
      response.setHeader('set-cookie', serializeSessionCookie(sessionId, secure));
    }
  }
  if (path === '/auth/logout') {
    response.setHeader('set-cookie', `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure ? '; Secure' : ''}`);
  }
}

function serializeSessionCookie(sessionId: string, secure: boolean): string {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure ? '; Secure' : ''}`;
}

function readSessionCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  const cookies = Object.fromEntries(cookieHeader.split(';').map((cookie) => {
    const [key, ...value] = cookie.trim().split('=');
    return [key, value.join('=')];
  }));
  return cookies[SESSION_COOKIE_NAME] ? decodeURIComponent(cookies[SESSION_COOKIE_NAME]) : undefined;
}

class RequestBodyTooLargeError extends Error {}

function recordTelemetry(input: {
  request: IncomingMessage;
  response: ServerResponse;
  requestId: string;
  startedAt: number;
  metrics: ApiMetricsRecorder;
  structuredLogger: (entry: StructuredApiLog) => void;
}): void {
  const durationMs = Date.now() - input.startedAt;
  input.metrics.recordRequest({ status: input.response.statusCode, durationMs });
  input.structuredLogger({
    timestamp: new Date().toISOString(),
    level: input.response.statusCode >= 500 ? 'error' : 'info',
    requestId: input.requestId,
    method: input.request.method ?? 'UNKNOWN',
    path: new URL(input.request.url ?? '/', 'http://localhost').pathname,
    status: input.response.statusCode,
    durationMs,
    sessionPresent: Boolean(input.request.headers['x-session-id'])
  });
}
