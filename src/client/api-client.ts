import type { ApiResponse, HttpMethod } from '../api';

export type ClientRequest<TBody = unknown> = {
  method: HttpMethod;
  path: string;
  body?: TBody;
  query?: Record<string, string | undefined>;
  sessionId?: string;
};

export type ApiClientConfig = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

export class HubsteriaApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async health(): Promise<{ ok: boolean }> {
    const response = await this.fetchImpl(`${this.baseUrl}/healthz`);

    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }

    return response.json();
  }

  async request<TData = unknown, TBody = unknown>(request: ClientRequest<TBody>): Promise<ApiResponse<TData>> {
    const url = new URL(`${this.baseUrl}${request.path}`);

    for (const [key, value] of Object.entries(request.query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }

    const response = await this.fetchImpl(url, {
      method: request.method,
      headers: {
        'content-type': 'application/json',
        ...(request.sessionId ? { 'x-session-id': request.sessionId } : {})
      },
      body: request.body === undefined ? undefined : JSON.stringify(request.body)
    });

    return response.json();
  }

  login(email: string, password: string) {
    return this.request({
      method: 'POST',
      path: '/auth/login',
      body: { email, password }
    });
  }

  verifyMfa(sessionId: string, challengeId: string, code: string) {
    return this.request({
      method: 'POST',
      path: '/auth/mfa/verify',
      body: { sessionId, challengeId, code }
    });
  }

  createOrganization(sessionId: string, name: string) {
    return this.request({
      method: 'POST',
      path: '/organizations',
      sessionId,
      body: { name }
    });
  }

  listOrganizations(sessionId: string) {
    return this.request({
      method: 'GET',
      path: '/organizations',
      sessionId
    });
  }

  createFacility(sessionId: string, body: { organizationId: string; name: string }) {
    return this.request({
      method: 'POST',
      path: '/facilities',
      sessionId,
      body
    });
  }

  listFacilities(sessionId: string, organizationId: string) {
    return this.request({
      method: 'GET',
      path: '/facilities',
      sessionId,
      query: { organizationId }
    });
  }

  createResident(sessionId: string, body: {
    organizationId: string;
    facilityId: string;
    firstName: string;
    lastName: string;
    preferredName?: string;
    room?: string;
    levelOfCare?: string;
  }) {
    return this.request({
      method: 'POST',
      path: '/residents',
      sessionId,
      body
    });
  }

  listResidents(sessionId: string, organizationId: string, facilityId: string) {
    return this.request({
      method: 'GET',
      path: '/residents',
      sessionId,
      query: { organizationId, facilityId }
    });
  }

  listUsers(sessionId: string, organizationId: string) {
    return this.request({
      method: 'GET',
      path: '/users',
      sessionId,
      query: { organizationId }
    });
  }

  createUser(sessionId: string, body: {
    email: string;
    roleTier: string;
    organizationId?: string;
    facilityIds: string[];
    permissions: string[];
  }) {
    return this.request({
      method: 'POST',
      path: '/users',
      sessionId,
      body
    });
  }
}

export function getConfiguredApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
}

export function createConfiguredApiClient(fetchImpl?: typeof fetch): HubsteriaApiClient {
  return new HubsteriaApiClient({
    baseUrl: getConfiguredApiBaseUrl(),
    fetchImpl
  });
}
