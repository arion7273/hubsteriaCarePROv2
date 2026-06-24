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
};

export function createNodeApiServer(services: ApiServices, options: NodeApiServerOptions = {}): Server {
  const router = createApiRouter(services, [createRequestIdMiddleware(randomUUID), ...(options.middlewares ?? [])]);
  const metrics = options.metrics ?? createInMemoryMetricsRecorder();
  const structuredLogger = options.structuredLogger ?? createConsoleStructuredLogger();
  const errorTracker = options.errorTracker ?? createPlaceholderErrorTracker(false);

  return createServer(async (request, response) => {
    const startedAt = Date.now();
    const requestId = String(request.headers['x-request-id'] ?? randomUUID());
    response.setHeader('x-request-id', requestId);

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

    const apiRequest = await toApiRequest(request, requestId).catch((error) => {
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
    writeApiResponse(response, apiResponse);
    recordTelemetry({ request, response, requestId, startedAt, metrics, structuredLogger });
  });
}

async function toApiRequest(request: IncomingMessage, requestId: string): Promise<
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
  const rawBody = await readBody(request);
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
      sessionId: headers['x-session-id'],
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

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
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
