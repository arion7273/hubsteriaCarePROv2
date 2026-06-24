import { describe, expect, it, vi } from 'vitest';
import { HubsteriaApiClient } from './api-client';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init
  });
}

describe('HubsteriaApiClient', () => {
  it('checks backend health', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com/', fetchImpl: fetchMock as unknown as typeof fetch });

    await expect(client.health()).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('http://api.example.com/healthz');
  });

  it('sends session headers, JSON bodies, and query params', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true, status: 200, data: [] }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com', fetchImpl: fetchMock as unknown as typeof fetch });

    await client.listResidents('session-1', 'org-1', 'facility-1');

    const [url, init] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];
    expect(url.toString()).toBe('http://api.example.com/residents?organizationId=org-1&facilityId=facility-1');
    expect(init).toMatchObject({
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'x-session-id': 'session-1'
      }
    });
  });

  it('posts login and create resident requests', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true, status: 200, data: {} }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com', fetchImpl: fetchMock as unknown as typeof fetch });

    await client.login('admin@example.com', 'password');
    await client.createResident('session-1', {
      organizationId: 'org-1',
      facilityId: 'facility-1',
      firstName: 'Maria',
      lastName: 'Alvarez'
    });

    const [, loginInit] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];
    expect(loginInit.body).toBe(JSON.stringify({ email: 'admin@example.com', password: 'password' }));

    const [, residentInit] = fetchMock.mock.calls[1] as unknown as [URL, RequestInit];
    expect(residentInit).toMatchObject({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-session-id': 'session-1'
      },
      body: JSON.stringify({
        organizationId: 'org-1',
        facilityId: 'facility-1',
        firstName: 'Maria',
        lastName: 'Alvarez'
      })
    });
  });
});
