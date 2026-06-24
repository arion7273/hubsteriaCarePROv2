import type { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import { AuthService, BackendFoundationService, createInMemoryBackendRepositories, type User } from '../domain';
import { createNodeApiServer, type ApiServices } from '.';

const t1User: User = {
  id: 'user-master',
  email: 'b094650@gmail.com',
  roleTier: 'T1',
  facilityIds: [],
  permissions: [],
  status: 'active'
};

function createApiServices(): ApiServices {
  const ids = ['session-1', 'mfa-1', 'audit-login', 'audit-mfa', 'org-1', 'audit-org'];
  const repositories = createInMemoryBackendRepositories();
  const auth = new AuthService(
    repositories,
    {
      async verify({ password }) {
        return password === 'correct-password';
      }
    },
    {
      async verify({ code }) {
        return code === '123456';
      }
    },
    () => ids.shift() ?? 'fallback-id',
    () => new Date('2026-06-24T01:00:00.000Z')
  );
  const backend = new BackendFoundationService(
    repositories,
    () => ids.shift() ?? 'fallback-id',
    () => new Date('2026-06-24T01:00:00.000Z')
  );

  return { auth, backend, repositories };
}

async function withServer<T>(services: ApiServices, test: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = createNodeApiServer(services);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;

  try {
    return await test(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      })
    );
  }
}

describe('Node API server adapter', () => {
  it('serves health and OpenAPI metadata', async () => {
    const services = createApiServices();

    await withServer(services, async (baseUrl) => {
      await expect(fetch(`${baseUrl}/healthz`).then((response) => response.json())).resolves.toEqual({ ok: true });
      await expect(fetch(`${baseUrl}/openapi.json`).then((response) => response.json())).resolves.toMatchObject({
        openapi: '3.1.0',
        info: { title: 'HubsteriaCarePRO API' }
      });
    });
  });

  it('handles login and protected organization creation over HTTP', async () => {
    const services = createApiServices();
    await services.repositories.users.save(t1User);

    await withServer(services, async (baseUrl) => {
      const login = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: t1User.email, password: 'correct-password' })
      }).then((response) => response.json());

      expect(login).toMatchObject({ ok: true });

      const mfa = await fetch(`${baseUrl}/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sessionId: login.data.session.id,
          challengeId: login.data.mfaChallenge.id,
          code: '123456'
        })
      }).then((response) => response.json());

      expect(mfa).toMatchObject({ ok: true });

      const organization = await fetch(`${baseUrl}/organizations`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-session-id': login.data.session.id
        },
        body: JSON.stringify({ name: 'Northstar Senior Living' })
      }).then((response) => response.json());

      expect(organization).toMatchObject({
        ok: true,
        status: 201,
        data: {
          id: 'org-1',
          name: 'Northstar Senior Living'
        }
      });
    });
  });

  it('returns JSON errors for invalid JSON and unsupported media type', async () => {
    const services = createApiServices();

    await withServer(services, async (baseUrl) => {
      const invalidJson = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{'
      }).then((response) => response.json());

      expect(invalidJson).toMatchObject({
        ok: false,
        status: 400,
        error: { code: 'invalid_json' }
      });

      const unsupported = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'not json'
      }).then((response) => response.json());

      expect(unsupported).toMatchObject({
        ok: false,
        status: 415,
        error: { code: 'unsupported_media_type' }
      });
    });
  });
});
