import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { applyPendingMigrations, createPostgresBackendRepositories, PgPostgresClient } from '../adapters/postgres';
import { BackendFoundationService, CredentialService, type RoleTier, type User } from '../domain';
import type { PostgresClient } from '../adapters/postgres/types';

const shouldRun = process.env.RUN_STAGING_SMOKE === 'true';
const apiBaseUrl = process.env.STAGING_API_BASE_URL ?? 'http://localhost:3000';
const frontendBaseUrl = process.env.STAGING_FRONTEND_BASE_URL ?? 'http://localhost:8080';
const databaseUrl = process.env.STAGING_DATABASE_URL ?? process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const smokePassword = process.env.STAGING_SMOKE_PASSWORD ?? 'staging-smoke-password';

const roleIds: Record<RoleTier, string> = {
  T1: '00000000-0000-0000-0000-000000000101',
  T2: '00000000-0000-0000-0000-000000000102',
  T2_5: '00000000-0000-0000-0000-000000000125',
  T3: '00000000-0000-0000-0000-000000000103',
  EMPLOYEE: '00000000-0000-0000-0000-000000000104',
  FAMILY: '00000000-0000-0000-0000-000000000105',
  RESIDENT: '00000000-0000-0000-0000-000000000106'
};

const describeSmoke = shouldRun ? describe : describe.skip;

describeSmoke('staging compose smoke test', () => {
  let client: PgPostgresClient;
  let smokeUser: User;

  beforeAll(async () => {
    if (!databaseUrl) throw new Error('STAGING_DATABASE_URL, TEST_DATABASE_URL, or DATABASE_URL is required');

    client = new PgPostgresClient({ connectionString: databaseUrl });
    await applyPendingMigrations(client);
    await seedRoles(client);
    smokeUser = await seedSmokeAdmin(client);
  });

  afterAll(async () => {
    await client?.close();
  });

  it('verifies frontend and API health checks', async () => {
    await expect(fetch(`${frontendBaseUrl}/healthz`).then((response) => response.text())).resolves.toBe('ok');
    await expect(fetch(`${apiBaseUrl}/healthz`).then((response) => response.json())).resolves.toEqual({ ok: true });
  });

  it('runs login MFA logout admin clinical jobs and operational records against staging API', async () => {
    const login = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: smokeUser.email, password: smokePassword }
    });
    expect(login).toMatchObject({ ok: true });
    const loginData = login.data as { session: { id: string }; mfaChallenge: { id: string } };

    const mfa = await apiRequest('/auth/mfa/verify', {
      method: 'POST',
      body: {
        sessionId: loginData.session.id,
        challengeId: loginData.mfaChallenge.id,
        code: '123456'
      }
    });
    expect(mfa).toMatchObject({ ok: true });

    const organization = await apiRequest('/organizations', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { name: `Smoke Org ${randomUUID()}` }
    });
    expect(organization).toMatchObject({ ok: true, status: 201 });
    const organizationId = (organization.data as { id: string }).id;

    const facility = await apiRequest('/facilities', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { organizationId, name: 'Smoke Facility' }
    });
    expect(facility).toMatchObject({ ok: true, status: 201 });
    const facilityId = (facility.data as { id: string }).id;

    const resident = await apiRequest('/residents', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { organizationId, facilityId, firstName: 'Staging', lastName: 'Resident' }
    });
    expect(resident).toMatchObject({ ok: true, status: 201 });
    const residentId = (resident.data as { id: string }).id;

    await expect(apiRequest(`/residents?organizationId=${organizationId}&facilityId=${facilityId}`, {
      method: 'GET',
      sessionId: loginData.session.id
    })).resolves.toMatchObject({ ok: true, data: [expect.objectContaining({ id: residentId })] });

    await expect(apiRequest('/assessments', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { organizationId, facilityId, residentId, type: 'Smoke Assessment', status: 'review', score: 7, answers: { source: 'staging-smoke' } }
    })).resolves.toMatchObject({ ok: true, status: 201 });

    await expect(apiRequest('/tasks', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { organizationId, facilityId, residentId, title: 'Smoke task', taskType: 'one_time', dueAt: '2026-06-24T09:30:00.000Z', assignedStaff: 'Smoke Nurse', status: 'due' }
    })).resolves.toMatchObject({ ok: true, status: 201 });

    await expect(apiRequest('/medication-orders', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { organizationId, facilityId, residentId, medication: 'SmokeMed', dosage: '5mg', route: 'PO', schedule: 'Daily', status: 'active' }
    })).resolves.toMatchObject({ ok: true, status: 201 });

    await expect(apiRequest('/incidents', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { organizationId, facilityId, residentId, type: 'fall', severity: 'warning', status: 'open', summary: 'Smoke incident', occurredAt: '2026-06-24T10:00:00.000Z' }
    })).resolves.toMatchObject({ ok: true, status: 201 });

    await expect(apiRequest('/billing/charges', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { organizationId, facilityId, residentId, type: 'ancillary', description: 'Smoke charge', amountCents: 1000, status: 'posted' }
    })).resolves.toMatchObject({ ok: true, status: 201 });

    await expect(apiRequest('/jobs/notifications', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { organizationId, facilityId, residentId, channel: 'email', template: 'Smoke Alert', recipient: 'smoke@example.com', payload: { residentId } }
    })).resolves.toMatchObject({ ok: true, status: 201, data: expect.objectContaining({ type: 'notification' }) });

    await expect(apiRequest('/operational-records', {
      method: 'POST',
      sessionId: loginData.session.id,
      body: { organizationId, facilityId, residentId, module: 'integrations', recordType: 'smoke_test', status: 'completed', title: 'Staging smoke record', payload: { ok: true } }
    })).resolves.toMatchObject({ ok: true, status: 201 });

    await expect(apiRequest('/auth/logout', {
      method: 'POST',
      sessionId: loginData.session.id
    })).resolves.toMatchObject({ ok: true });
  });
});

async function apiRequest(path: string, input: { method: string; sessionId?: string; body?: unknown }) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: input.method,
    headers: {
      'content-type': 'application/json',
      ...(input.sessionId ? { 'x-session-id': input.sessionId } : {})
    },
    body: input.body === undefined ? undefined : JSON.stringify(input.body)
  });

  return response.json();
}

async function seedSmokeAdmin(client: PostgresClient): Promise<User> {
  const repositories = createPostgresBackendRepositories(client, {
    createId: randomUUID,
    roleIdForTier: (roleTier) => roleIds[roleTier]
  });
  const backend = new BackendFoundationService(repositories, randomUUID);
  const credentials = new CredentialService(repositories, randomUUID);
  const user = await repositories.users.save({
    id: randomUUID(),
    email: `staging-smoke-${randomUUID()}@example.com`,
    roleTier: 'T1',
    facilityIds: [],
    permissions: ['resident:write', 'assessment:manage', 'medication:manage', 'billing:manage'],
    status: 'active'
  });

  await credentials.setPassword({ user }, user.id, smokePassword);
  await backend.registerFeature(
    { user },
    {
      featureName: `Staging Smoke ${randomUUID()}`,
      module: 'Staging',
      status: 'registered',
      dependencies: ['PostgreSQL', 'API', 'Frontend'],
      version: '0.1.0'
    }
  );
  return user;
}

async function seedRoles(client: PostgresClient): Promise<void> {
  for (const [tier, id] of Object.entries(roleIds)) {
    await client.query({
      text: `
        INSERT INTO roles (id, tier, name)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
      `,
      values: [id, tier, `${tier} staging smoke role`]
    });
  }
}
