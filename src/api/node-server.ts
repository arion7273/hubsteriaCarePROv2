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
};

export function createNodeApiServer(services: ApiServices, options: NodeApiServerOptions = {}): Server {
  const router = createApiRouter(services, [createRequestIdMiddleware(randomUUID), ...(options.middlewares ?? [])]);

  return createServer(async (request, response) => {
    if (request.url === '/healthz') {
      writeJson(response, 200, { ok: true });
      return;
    }

    if (request.url === '/openapi.json') {
      writeJson(response, 200, openApiDocument);
      return;
    }

    const apiRequest = await toApiRequest(request);

    if (!apiRequest.ok) {
      writeApiResponse(response, apiRequest.response);
      return;
    }

    writeApiResponse(response, await router.handle(apiRequest.request));
  });
}

async function toApiRequest(request: IncomingMessage): Promise<
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
      ip: request.socket.remoteAddress
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
