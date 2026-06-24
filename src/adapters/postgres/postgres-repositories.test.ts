import { describe, expect, it } from 'vitest';
import { createAuditEvent } from '../../domain';
import {
  PostgresAuditLogRepository,
  PostgresAuthSessionRepository,
  PostgresFacilityRepository,
  PostgresFeatureRegistryRepository,
  PostgresOrganizationRepository,
  PostgresPasswordResetRepository,
  PostgresUserRepository,
  type PostgresClient,
  type PostgresRow,
  type SqlStatement
} from '.';

class FakePostgresClient implements PostgresClient {
  statements: SqlStatement[] = [];

  constructor(private readonly rows: PostgresRow[] = []) {}

  async query<TRow extends PostgresRow = PostgresRow>(statement: SqlStatement) {
    this.statements.push(statement);
    return { rows: this.rows as TRow[] };
  }
}

describe('Postgres repository classes', () => {
  it('maps organization repository results and records statements', async () => {
    const client = new FakePostgresClient([{ id: 'org-1', name: 'Northstar', status: 'active' }]);
    const repository = new PostgresOrganizationRepository(client);

    await expect(repository.getById('org-1')).resolves.toEqual({
      id: 'org-1',
      name: 'Northstar',
      status: 'active'
    });
    expect(client.statements[0]).toMatchObject({
      text: 'SELECT id, name, status FROM organizations WHERE id = $1',
      values: ['org-1']
    });
  });

  it('uses tenant-scoped facility list statements', async () => {
    const client = new FakePostgresClient([{ id: 'facility-1', organization_id: 'org-1', name: 'Cedar Grove', status: 'active' }]);
    const repository = new PostgresFacilityRepository(client);

    await expect(repository.listByOrganization('org-1')).resolves.toEqual([
      {
        id: 'facility-1',
        organizationId: 'org-1',
        name: 'Cedar Grove',
        status: 'active'
      }
    ]);
    expect(client.statements[0].text).toContain('WHERE organization_id = $1');
  });

  it('uses role resolver when saving users', async () => {
    const client = new FakePostgresClient([
      {
        id: 'user-1',
        email: 'admin@example.com',
        role_tier: 'T3',
        organization_id: 'org-1',
        facility_ids: ['facility-1'],
        permissions: ['resident:read'],
        status: 'active'
      }
    ]);
    const repository = new PostgresUserRepository(client, (roleTier) => `role-${roleTier}`);

    await expect(
      repository.save({
        id: 'user-1',
        email: 'admin@example.com',
        roleTier: 'T3',
        organizationId: 'org-1',
        facilityIds: ['facility-1'],
        permissions: ['resident:read'],
        status: 'active'
      })
    ).resolves.toMatchObject({ id: 'user-1', roleTier: 'T3' });
    expect(client.statements[0].values).toContain('role-T3');
  });

  it('appends audit logs without update/delete statements', async () => {
    const client = new FakePostgresClient();
    const repository = new PostgresAuditLogRepository(client);

    await repository.append(
      createAuditEvent({
        id: 'audit-1',
        action: 'create',
        actorUserId: 'user-1',
        actorRole: 'T1',
        entityType: 'Organization',
        entityId: 'org-1',
        scope: { scope: 'organization', organizationId: 'org-1' },
        beforeState: null,
        afterState: { id: 'org-1' },
        now: new Date('2026-06-24T01:00:00.000Z')
      })
    );

    expect(client.statements[0].text).toContain('INSERT INTO audit_logs');
    expect(client.statements[0].text).not.toMatch(/\bUPDATE\b|\bDELETE\b/i);
  });

  it('validates and maps feature registry repository operations', async () => {
    const client = new FakePostgresClient([
      {
        feature_name: 'Resident Command Center',
        module: 'Resident Core',
        status: 'registered',
        dependencies: ['Tenant Isolation Guard'],
        version: '0.1.0'
      }
    ]);
    const repository = new PostgresFeatureRegistryRepository(client, () => 'feature-1');

    await expect(
      repository.register({
        featureName: 'Resident Command Center',
        module: 'Resident Core',
        status: 'registered',
        dependencies: ['Tenant Isolation Guard'],
        version: '0.1.0'
      })
    ).resolves.toMatchObject({ featureName: 'Resident Command Center' });
    expect(client.statements[0].text).toContain('INSERT INTO feature_registry');
  });

  it('maps auth session and password reset repositories', async () => {
    const sessionClient = new FakePostgresClient([
      {
        id: 'session-1',
        user_id: 'user-1',
        created_at: '2026-06-24T01:00:00.000Z',
        expires_at: '2026-06-24T09:00:00.000Z',
        mfa_verified: true,
        revoked_at: null
      }
    ]);
    const sessionRepository = new PostgresAuthSessionRepository(sessionClient);

    await expect(sessionRepository.getById('session-1')).resolves.toMatchObject({ id: 'session-1', mfaVerified: true });

    const resetClient = new FakePostgresClient([
      {
        id: 'reset-1',
        user_id: 'user-1',
        created_at: '2026-06-24T01:00:00.000Z',
        expires_at: '2026-06-24T02:00:00.000Z',
        used_at: null
      }
    ]);
    const resetRepository = new PostgresPasswordResetRepository(resetClient);

    await expect(resetRepository.getById('reset-1')).resolves.toMatchObject({ id: 'reset-1', userId: 'user-1' });
  });
});
