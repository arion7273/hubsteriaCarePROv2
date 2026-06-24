import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { applyPendingMigrations, createPostgresBackendRepositories, PgPostgresClient } from '../adapters/postgres';
import { BackendFoundationService, CredentialService, RepositoryPasswordVerifier, type User } from '../domain';

const shouldRun = process.env.RUN_POSTGRES_INTEGRATION === 'true' && Boolean(process.env.TEST_DATABASE_URL);
const describeIntegration = shouldRun ? describe : describe.skip;

describeIntegration('PostgreSQL integration', () => {
  it('applies migrations and persists tenant/auth foundation records', async () => {
    const client = new PgPostgresClient({
      connectionString: process.env.TEST_DATABASE_URL as string,
      ssl: process.env.TEST_DATABASE_SSL === 'true'
    });

    try {
      await applyPendingMigrations(client);
      const repositories = createPostgresBackendRepositories(client, {
        createId: randomUUID,
        roleIdForTier: (tier) => roleIdForTier(tier)
      });
      const service = new BackendFoundationService(repositories, randomUUID, () => new Date('2026-06-24T01:00:00.000Z'));
      const masterUser: User = {
        id: randomUUID(),
        email: `master-${randomUUID()}@example.com`,
        roleTier: 'T1',
        facilityIds: [],
        permissions: [],
        status: 'active'
      };

      await repositories.users.save(masterUser);

      const organization = await service.createOrganization({ user: masterUser }, { name: `Org ${randomUUID()}` });
      const credentialService = new CredentialService(repositories, randomUUID, () => new Date('2026-06-24T01:00:00.000Z'));
      await credentialService.setPassword({ user: masterUser }, masterUser.id, 'correct-horse-password');
      const verifier = new RepositoryPasswordVerifier(repositories);

      await expect(repositories.organizations.getById(organization.id)).resolves.toMatchObject({ id: organization.id });
      await expect(verifier.verify({ user: masterUser, password: 'correct-horse-password' })).resolves.toBe(true);
      await expect(repositories.auditLogs.listByEntity('Organization', organization.id)).resolves.toHaveLength(1);
    } finally {
      await client.close();
    }
  });
});

function roleIdForTier(tier: User['roleTier']) {
  const envKey = `TEST_ROLE_ID_${tier}`;
  const roleId = process.env[envKey];

  if (!roleId) {
    throw new Error(`${envKey} is required for PostgreSQL integration tests`);
  }

  return roleId;
}
