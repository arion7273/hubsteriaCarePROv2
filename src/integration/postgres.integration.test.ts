import { randomUUID } from 'node:crypto';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createApiRouter, type ApiServices } from '../api';
import { createPostgresBackendRepositories, PgPostgresClient } from '../adapters/postgres';
import type { RoleTier, User } from '../domain';
import { AuthService, BackendFoundationService } from '../domain';
import type { PostgresClient } from '../adapters/postgres/types';

const shouldRun = process.env.RUN_POSTGRES_INTEGRATION === 'true';
const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

const roleIds: Record<RoleTier, string> = {
  T1: '00000000-0000-0000-0000-000000000101',
  T2: '00000000-0000-0000-0000-000000000102',
  T2_5: '00000000-0000-0000-0000-000000000125',
  T3: '00000000-0000-0000-0000-000000000103',
  EMPLOYEE: '00000000-0000-0000-0000-000000000104',
  FAMILY: '00000000-0000-0000-0000-000000000105',
  RESIDENT: '00000000-0000-0000-0000-000000000106'
};

const describePostgres = shouldRun ? describe : describe.skip;

describePostgres('PostgreSQL integration', () => {
  let client: PgPostgresClient;

  beforeAll(async () => {
    if (!databaseUrl) {
      throw new Error('TEST_DATABASE_URL or DATABASE_URL is required for PostgreSQL integration tests');
    }

    client = new PgPostgresClient({ connectionString: databaseUrl });
    await assertMigrationsApplied(client);
    await seedRoles(client);
  });

  afterAll(async () => {
    await client?.close();
  });

  it('persists repositories through real PostgreSQL adapters', async () => {
    const services = createServices(client);
    const masterUser = await seedMasterUser(services);

    const organization = await services.backend.createOrganization(
      { user: masterUser },
      { name: `Northstar ${randomUUID()}` }
    );
    const facility = await services.backend.createFacility(
      { user: masterUser },
      { organizationId: organization.id, name: 'Cedar Grove' }
    );
    const resident = await services.backend.createResident(
      { user: { ...masterUser, permissions: ['resident:write'] } },
      {
        organizationId: organization.id,
        facilityId: facility.id,
        firstName: 'Maria',
        lastName: 'Alvarez',
        room: '214B'
      }
    );
    const job = await services.backend.enqueueNotificationJob(
      { user: masterUser },
      {
        organizationId: organization.id,
        facilityId: facility.id,
        residentId: resident.id,
        channel: 'sms',
        template: 'Medication Refused',
        recipient: 'nurse@example.com',
        payload: { residentId: resident.id }
      }
    );

    await expect(services.repositories.organizations.getById(organization.id)).resolves.toMatchObject({
      name: organization.name
    });
    await expect(services.repositories.facilities.listByOrganization(organization.id)).resolves.toEqual([
      expect.objectContaining({ id: facility.id })
    ]);
    await expect(services.repositories.residents.listByFacility(organization.id, facility.id)).resolves.toEqual([
      expect.objectContaining({ id: resident.id, firstName: 'Maria' })
    ]);
    await expect(services.repositories.backgroundJobs.getById(job.id)).resolves.toMatchObject({
      type: 'notification',
      status: 'queued'
    });
    await expect(services.repositories.auditLogs.listByEntity('Resident', resident.id)).resolves.toHaveLength(1);
  });

  it('dispatches protected API routes against real PostgreSQL', async () => {
    const services = createServices(client);
    const masterUser = await seedMasterUser(services);
    const session = await services.repositories.authSessions.save({
      id: randomUUID(),
      userId: masterUser.id,
      createdAt: '2026-06-24T01:00:00.000Z',
      expiresAt: '2999-01-01T00:00:00.000Z',
      mfaVerified: true
    });
    const router = createApiRouter(services);

    const organization = await router.handle({
      method: 'POST',
      path: '/organizations',
      sessionId: session.id,
      body: { name: `API Org ${randomUUID()}` }
    });
    expect(organization).toMatchObject({ ok: true, status: 201 });
    const organizationId = organization.ok ? (organization.data as { id: string }).id : '';

    const facility = await router.handle({
      method: 'POST',
      path: '/facilities',
      sessionId: session.id,
      body: { organizationId, name: 'API Facility' }
    });
    expect(facility).toMatchObject({ ok: true, status: 201 });
    const facilityId = facility.ok ? (facility.data as { id: string }).id : '';

    const resident = await router.handle({
      method: 'POST',
      path: '/residents',
      sessionId: session.id,
      body: {
        organizationId,
        facilityId,
        firstName: 'Eleanor',
        lastName: 'Rigby'
      }
    });
    expect(resident).toMatchObject({ ok: true, status: 201 });

    await expect(
      router.handle({
        method: 'GET',
        path: '/residents',
        sessionId: session.id,
        query: { organizationId, facilityId }
      })
    ).resolves.toMatchObject({
      ok: true,
      data: [expect.objectContaining({ firstName: 'Eleanor' })]
    });
  });
});

function createServices(client: PostgresClient): ApiServices {
  const repositories = createPostgresBackendRepositories(client, {
    createId: randomUUID,
    roleIdForTier: (roleTier) => roleIds[roleTier]
  });
  const auth = new AuthService(
    repositories,
    { async verify() { return true; } },
    { async verify() { return true; } },
    randomUUID
  );

  return {
    auth,
    backend: new BackendFoundationService(repositories, randomUUID),
    repositories,
    now: () => new Date('2026-06-24T01:00:00.000Z')
  };
}

async function seedMasterUser(services: ApiServices): Promise<User> {
  const user: User = {
    id: randomUUID(),
    email: `postgres-${randomUUID()}@example.com`,
    roleTier: 'T1',
    facilityIds: [],
    permissions: [],
    status: 'active'
  };

  return services.repositories.users.save(user);
}

async function assertMigrationsApplied(client: PostgresClient): Promise<void> {
  const result = await client.query<{ migration_count: string }>({
    text: 'SELECT count(*)::text AS migration_count FROM schema_migrations',
    values: []
  });

  expect(Number(result.rows[0]?.migration_count ?? 0)).toBeGreaterThanOrEqual(5);
}

async function seedRoles(client: PostgresClient): Promise<void> {
  for (const [tier, id] of Object.entries(roleIds)) {
    await client.query({
      text: `
        INSERT INTO roles (id, tier, name)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
      `,
      values: [id, tier, `${tier} integration role`]
    });
  }
}
