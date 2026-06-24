import type { AccessContext, UUID } from '../domain';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type ApiRequest<TBody = unknown> = {
  method: HttpMethod;
  path: string;
  body?: TBody;
  query?: Record<string, string | undefined>;
  sessionId?: UUID;
  headers?: Record<string, string | undefined>;
  ip?: string;
  requestId?: string;
};

export type ApiResponse<TData = unknown> =
  | {
      ok: true;
      status: number;
      data: TData;
    }
  | {
      ok: false;
      status: number;
      error: {
        code: string;
        message: string;
      };
    };

export type AuthenticatedApiRequest<TBody = unknown> = ApiRequest<TBody> & {
  context: AccessContext;
};

export type ApiRequestLog = {
  requestId: string;
  method: HttpMethod;
  path: string;
  status: number;
  ip?: string;
  sessionPresent: boolean;
  body: unknown;
};

export function ok<TData>(data: TData, status = 200): ApiResponse<TData> {
  return {
    ok: true,
    status,
    data
  };
}

export function fail(code: string, message: string, status = 400): ApiResponse<never> {
  return {
    ok: false,
    status,
    error: {
      code,
      message
    }
  };
}

export async function toApiResponse<TData>(handler: () => Promise<TData>, successStatus = 200): Promise<ApiResponse<TData>> {
  try {
    return ok(await handler(), successStatus);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';
    return fail(errorCodeForMessage(message), message, statusForMessage(message));
  }
}

function statusForMessage(message: string): number {
  if (message.includes('Invalid credentials')) {
    return 401;
  }

  if (message.includes('Session') || message.includes('MFA')) {
    return 401;
  }

  if (message.includes('denied') || message.includes('Only T1') || message.includes('Missing permission')) {
    return 403;
  }

  if (message.includes('not found')) {
    return 404;
  }

  return 400;
}

function errorCodeForMessage(message: string): string {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
}
