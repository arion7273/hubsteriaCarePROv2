import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { ApiServices } from './handlers';
import type { ApiMiddleware } from './middleware';
import { createRequestIdMiddleware } from './middleware';
import { fail, type ApiRequest, type ApiResponse, type HttpMethod } from './http';
import { openApiDocument } from './openapi';
import { createApiRouter } from './router';

export type NodeApiServerOptions = {
  middlewares?: ApiMiddleware[];
  corsAllowedOrigins?: string[];
  maxBodyBytes?: number;
};

const DEFAULT_MAX_BODY_BYTES = 1_000_000;

export function createNodeApiServer(services: ApiServices, options: NodeApiServerOptions = {}): Server {
  const router = createApiRouter(services, [createRequestIdMiddleware(randomUUID), ...(options.middlewares ?? [])]);

  return createServer(async (request, response) => {
    applySecurityHeaders(response);

    if (!applyCors(request, response, options.corsAllowedOrigins)) {
      writeJson(response, 403, fail('cors_origin_denied', 'Origin is not allowed', 403));
      return;
    }

    if (request.method === 'OPTIONS') {
      response.statusCode = 204;
      response.end();
      return;
    }

    if (request.url === '/healthz') {
      writeJson(response, 200, { ok: true });
      return;
    }

    if (request.url === '/openapi.json') {
      writeJson(response, 200, openApiDocument);
      return;
    }

    const apiRequest = await toApiRequest(request, options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES).catch((error) => {
      if (error instanceof RequestBodyTooLargeError) {
        return {
          ok: false as const,
          response: fail('payload_too_large', 'Request body is too large', 413)
        };
      }

      throw error;
    });

    if (!apiRequest.ok) {
      writeApiResponse(response, apiRequest.response);
      return;
    }

    writeApiResponse(response, await router.handle(apiRequest.request));
  });
}

async function toApiRequest(request: IncomingMessage, maxBodyBytes: number): Promise<
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
      sessionId: headers['x-session-id'],
      headers,
      ip: request.socket.remoteAddress
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
      if (tooLarge) {
        return;
      }
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

  if (!allowedOrigins?.length || !allowedOrigins.includes(origin)) {
    return false;
  }

  response.setHeader('access-control-allow-origin', origin);
  response.setHeader('vary', 'Origin');
  response.setHeader('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  response.setHeader('access-control-allow-headers', 'content-type,x-session-id,x-csrf-token');
  return true;
}

class RequestBodyTooLargeError extends Error {}
