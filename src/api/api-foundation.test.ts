import { describe, expect, it } from 'vitest';
import {
  AuthService,
  BackendFoundationService,
  createInMemoryBackendRepositories,
  type MfaChallenge,
  type User
} from '../domain';
import {
  apiRoutes,
  createApiRouter,
  createCsrfMiddleware,
  createFacilityHandler,
  createOrganizationHandler,
  createRateLimitMiddleware,
  createRequestIdMiddleware,
  createRequestLoggingMiddleware,
  listFeaturesHandler,
  loginHandler,
  openApiDocument,
  type ApiRequestLog,
  registerFeatureHandler,
  redactBody,
  verifyMfaHandler,
  type ApiServices
} from '.';

const t1User: User = {
  id: 'user-master',
  email: 'b094650@gmail.com',
  roleTier: 'T1',
  facilityIds: [],
  permissions: [],
  status: 'active'
};

function createApiServices(): ApiServices {
  const ids = [
    'session-1',
    'mfa-1',
    'audit-login',
    'audit-mfa',
    'org-1',
    'audit-org',
    'facility-1',
    'audit-facility',
    'resident-1',
    'audit-resident',
    'audit-resident-update',
    'audit-feature'
  ];
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

  return {
    auth,
    backend,
    repositories
  };
}

async function createVerifiedSession(services: ApiServices): Promise<string> {
  await services.repositories.users.save(t1User);
  const login = await loginHandler(services, {
    method: 'POST',
    path: '/auth/login',
    body: { email: t1User.email, password: 'correct-password' }
  });

  if (!login.ok) {
    throw new Error(login.error.message);
  }

  const { session, mfaChallenge } = login.data as { session: { id: string }; mfaChallenge: MfaChallenge };

  const mfa = await verifyMfaHandler(services, {
    method: 'POST',
    path: '/auth/mfa/verify',
    body: {
      sessionId: session.id,
      challengeId: mfaChallenge.id,
      code: '123456'
    }
  });

  if (!mfa.ok) {
    throw new Error(mfa.error.message);
  }

  return session.id;
}

describe('API foundation handlers', () => {
  it('exposes route metadata for auth and tenant admin operations', () => {
    expect(apiRoutes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ method: 'POST', path: '/auth/login', authRequired: false }),
        expect.objectContaining({ method: 'POST', path: '/organizations', authRequired: true }),
        expect.objectContaining({ method: 'GET', path: '/feature-registry', authRequired: true }),
        expect.objectContaining({ method: 'POST', path: '/residents', authRequired: true }),
        expect.objectContaining({ method: 'PATCH', path: '/residents', authRequired: true })
      ])
    );
  });

  it('exposes OpenAPI metadata for current routes', () => {
    expect(openApiDocument.openapi).toBe('3.1.0');
    expect(openApiDocument.info.title).toBe('HubsteriaCarePRO API');
    expect(openApiDocument.paths).toHaveProperty('/auth/login');
    expect(openApiDocument.paths).toHaveProperty('/organizations');
    expect(openApiDocument.paths).toHaveProperty('/residents');
    expect(openApiDocument.components.securitySchemes.session.name).toBe('X-Session-Id');
  });

  it('returns API errors for invalid login without leaking account status', async () => {
    const services = createApiServices();
    await services.repositories.users.save(t1User);

    const response = await loginHandler(services, {
      method: 'POST',
      path: '/auth/login',
      body: { email: t1User.email, password: 'wrong-password' }
    });

    expect(response).toMatchObject({
      ok: false,
      status: 401,
      error: { code: 'invalid_credentials', message: 'Invalid credentials' }
    });
  });

  it('creates organizations and facilities through protected handlers', async () => {
    const services = createApiServices();
    const sessionId = await createVerifiedSession(services);

    const organization = await createOrganizationHandler(services, {
      method: 'POST',
      path: '/organizations',
      sessionId,
      body: { name: 'Northstar Senior Living' }
    });

    expect(organization).toMatchObject({ ok: true, status: 201 });

    const facility = await createFacilityHandler(services, {
      method: 'POST',
      path: '/facilities',
      sessionId,
      body: {
        organizationId: 'org-1',
        name: 'Cedar Grove'
      }
    });

    expect(facility).toMatchObject({ ok: true, status: 201 });
    await expect(services.repositories.auditLogs.listByEntity('Facility', 'facility-1')).resolves.toHaveLength(1);
  });

  it('blocks protected handlers when MFA is not verified', async () => {
    const services = createApiServices();
    await services.repositories.users.save(t1User);
    const login = await loginHandler(services, {
      method: 'POST',
      path: '/auth/login',
      body: { email: t1User.email, password: 'correct-password' }
    });

    if (!login.ok) {
      throw new Error(login.error.message);
    }

    const { session } = login.data as { session: { id: string } };
    const response = await createOrganizationHandler(services, {
      method: 'POST',
      path: '/organizations',
      sessionId: session.id,
      body: { name: 'Blocked Org' }
    });

    expect(response).toMatchObject({
      ok: false,
      status: 401,
      error: { message: 'MFA verification required' }
    });
  });

  it('registers and lists feature registry entries through API handlers', async () => {
    const services = createApiServices();
    const sessionId = await createVerifiedSession(services);
    await createOrganizationHandler(services, {
      method: 'POST',
      path: '/organizations',
      sessionId,
      body: { name: 'Northstar Senior Living' }
    });
    await createFacilityHandler(services, {
      method: 'POST',
      path: '/facilities',
      sessionId,
      body: { organizationId: 'org-1', name: 'Cedar Grove' }
    });

    const registered = await registerFeatureHandler(services, {
      method: 'POST',
      path: '/feature-registry',
      sessionId,
      body: {
        featureName: 'Resident Command Center',
        module: 'Resident Core',
        status: 'registered',
        dependencies: ['Tenant Isolation Guard'],
        version: '0.1.0'
      }
    });

    expect(registered).toMatchObject({ ok: true, status: 201 });

    const listed = await listFeaturesHandler(services, {
      method: 'GET',
      path: '/feature-registry',
      sessionId
    });

    expect(listed).toMatchObject({ ok: true });
    expect(listed.ok && listed.data).toHaveLength(1);
  });

  it('creates, lists, reads, and updates residents through the API router', async () => {
    const services = createApiServices();
    const router = createApiRouter(services);
    const sessionId = await createVerifiedSession(services);
    await router.handle({
      method: 'POST',
      path: '/organizations',
      sessionId,
      body: { name: 'Northstar Senior Living' }
    });
    await router.handle({
      method: 'POST',
      path: '/facilities',
      sessionId,
      body: { organizationId: 'org-1', name: 'Cedar Grove' }
    });

    const created = await router.handle({
      method: 'POST',
      path: '/residents',
      sessionId,
      body: {
        organizationId: 'org-1',
        facilityId: 'facility-1',
        firstName: 'Maria',
        lastName: 'Alvarez',
        room: '214B'
      }
    });

    expect(created).toMatchObject({ ok: true, status: 201 });

    const listed = await router.handle({
      method: 'GET',
      path: '/residents',
      sessionId,
      query: {
        organizationId: 'org-1',
        facilityId: 'facility-1'
      }
    });

    expect(listed.ok && listed.data).toHaveLength(1);

    const read = await router.handle({
      method: 'GET',
      path: '/residents/get',
      sessionId,
      query: { residentId: 'resident-1' }
    });

    expect(read).toMatchObject({ ok: true, data: expect.objectContaining({ firstName: 'Maria' }) });

    const updated = await router.handle({
      method: 'PATCH',
      path: '/residents',
      sessionId,
      body: {
        residentId: 'resident-1',
        updates: { room: '215A' }
      }
    });

    expect(updated).toMatchObject({ ok: true, data: expect.objectContaining({ room: '215A' }) });
  });

  it('dispatches requests through the API router', async () => {
    const services = createApiServices();
    const router = createApiRouter(services);
    await services.repositories.users.save(t1User);

    const login = await router.handle({
      method: 'POST',
      path: '/auth/login',
      body: { email: t1User.email, password: 'correct-password' }
    });

    expect(login).toMatchObject({ ok: true, status: 200 });
  });

  it('validates request bodies before handler execution', async () => {
    const services = createApiServices();
    const router = createApiRouter(services);

    const response = await router.handle({
      method: 'POST',
      path: '/auth/login',
      body: { email: t1User.email }
    });

    expect(response).toMatchObject({
      ok: false,
      status: 400,
      error: { code: 'invalid_request_body' }
    });
  });

  it('returns 404 for unknown routes and 405 for invalid methods', async () => {
    const services = createApiServices();
    const router = createApiRouter(services);

    await expect(router.handle({ method: 'GET', path: '/missing' })).resolves.toMatchObject({
      ok: false,
      status: 404
    });

    await expect(router.handle({ method: 'GET', path: '/auth/login' })).resolves.toMatchObject({
      ok: false,
      status: 405
    });
  });

  it('applies rate limits before dispatching handlers', async () => {
    const services = createApiServices();
    const router = createApiRouter(services, [
      createRateLimitMiddleware({
        limit: 1,
        keyForRequest: (request) => request.ip ?? 'anonymous'
      })
    ]);

    await router.handle({
      method: 'POST',
      path: '/auth/login',
      ip: '127.0.0.1',
      body: { email: t1User.email, password: 'wrong-password' }
    });

    await expect(
      router.handle({
        method: 'POST',
        path: '/auth/login',
        ip: '127.0.0.1',
        body: { email: t1User.email, password: 'wrong-password' }
      })
    ).resolves.toMatchObject({
      ok: false,
      status: 429,
      error: { code: 'rate_limited' }
    });
  });

  it('requires CSRF token for cookie-backed unsafe requests', async () => {
    const services = createApiServices();
    const router = createApiRouter(services, [createCsrfMiddleware()]);

    await expect(
      router.handle({
        method: 'POST',
        path: '/auth/login',
        headers: { cookie: 'session=abc' },
        body: { email: t1User.email, password: 'correct-password' }
      })
    ).resolves.toMatchObject({
      ok: false,
      status: 403,
      error: { code: 'csrf_token_required' }
    });
  });

  it('adds request IDs and logs redacted request bodies', async () => {
    const services = createApiServices();
    const logs: ApiRequestLog[] = [];
    const router = createApiRouter(services, [
      createRequestIdMiddleware(() => 'request-1'),
      createRequestLoggingMiddleware(logs)
    ]);

    await router.handle({
      method: 'POST',
      path: '/auth/login',
      body: { email: t1User.email, password: 'wrong-password' }
    });

    expect(logs).toEqual([
      expect.objectContaining({
        requestId: 'request-1',
        method: 'POST',
        path: '/auth/login',
        status: 401,
        body: {
          email: t1User.email,
          password: '[REDACTED]'
        }
      })
    ]);
    expect(redactBody({ code: '123456', safe: 'value' })).toEqual({ code: '[REDACTED]', safe: 'value' });
  });
});
