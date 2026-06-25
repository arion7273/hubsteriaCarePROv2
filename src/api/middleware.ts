import type { ApiRequest, ApiRequestLog, ApiResponse } from './http';
import { fail } from './http';

export type ApiMiddleware = (
  request: ApiRequest,
  next: (request: ApiRequest) => Promise<ApiResponse>
) => Promise<ApiResponse>;

export type RateLimitStore = {
  get(key: string): number | undefined;
  set(key: string, value: number): void;
};

export function composeMiddleware(
  middlewares: ApiMiddleware[],
  handler: (request: ApiRequest) => Promise<ApiResponse>
): (request: ApiRequest) => Promise<ApiResponse> {
  return middlewares.reduceRight<(request: ApiRequest) => Promise<ApiResponse>>(
    (next, middleware) => (request) => middleware(request, next),
    handler
  );
}

export function createRequestIdMiddleware(createId: () => string): ApiMiddleware {
  return async (request, next) =>
    next({
      ...request,
      requestId: request.requestId ?? createId()
    });
}

export function createRateLimitMiddleware(options: {
  limit: number;
  keyForRequest?: (request: ApiRequest) => string;
  store?: RateLimitStore;
}): ApiMiddleware {
  const store = options.store ?? new Map<string, number>();
  const keyForRequest = options.keyForRequest ?? ((request) => request.ip ?? request.sessionId ?? 'anonymous');

  return async (request, next) => {
    const key = keyForRequest(request);
    const nextCount = (store.get(key) ?? 0) + 1;
    store.set(key, nextCount);

    if (nextCount > options.limit) {
      return fail('rate_limited', 'Too many requests', 429);
    }

    return next(request);
  };
}

export function createAuthRateLimitMiddleware(options: {
  limit: number;
  store?: RateLimitStore;
  keyForRequest?: (request: ApiRequest) => string;
}): ApiMiddleware {
  const keyForRequest = options.keyForRequest ?? ((request) => `${request.path}:${request.ip ?? 'anonymous'}`);
  return createRateLimitMiddleware({
    limit: options.limit,
    store: options.store,
    keyForRequest: (request) => (request.path.startsWith('/auth/') ? keyForRequest(request) : `bypass:${request.requestId ?? Math.random()}`)
  });
}

export function createCsrfMiddleware(options: {
  protectedMethods?: string[];
  tokenHeader?: string;
} = {}): ApiMiddleware {
  const protectedMethods = options.protectedMethods ?? ['POST', 'PATCH', 'DELETE'];
  const tokenHeader = options.tokenHeader ?? 'x-csrf-token';

  return async (request, next) => {
    if (!protectedMethods.includes(request.method)) {
      return next(request);
    }

    const usesCookieSession = Boolean(request.headers?.cookie);

    if (usesCookieSession && !request.headers?.[tokenHeader]) {
      return fail('csrf_token_required', 'CSRF token is required', 403);
    }

    return next(request);
  };
}

export function createRequestLoggingMiddleware(logs: ApiRequestLog[]): ApiMiddleware {
  return async (request, next) => {
    const response = await next(request);
    logs.push({
      requestId: request.requestId ?? 'missing-request-id',
      method: request.method,
      path: request.path,
      status: response.status,
      ip: request.ip,
      sessionPresent: Boolean(request.sessionId),
      body: redactBody(request.body)
    });
    return response;
  };
}

export function redactBody(body: unknown): unknown {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return body;
  }

  return Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([key, value]) => [
      key,
      ['password', 'code', 'token', 'apiKey', 'secret', 'firstName', 'lastName', 'preferredName', 'room', 'diagnosis', 'medication'].some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))
        ? '[REDACTED]'
        : value
    ])
  );
}
