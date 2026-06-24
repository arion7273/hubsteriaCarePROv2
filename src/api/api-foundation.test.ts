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
  createFacilityHandler,
  createOrganizationHandler,
  listFeaturesHandler,
  loginHandler,
  registerFeatureHandler,
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
  const ids = ['session-1', 'mfa-1', 'audit-login', 'audit-mfa', 'org-1', 'audit-org', 'facility-1', 'audit-facility', 'audit-feature'];
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
        expect.objectContaining({ method: 'GET', path: '/feature-registry', authRequired: true })
      ])
    );
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
});
