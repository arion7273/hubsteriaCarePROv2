import { describe, expect, it } from 'vitest';
import { createAuditEvent } from '../../domain';
import {
  auditLogStatements,
  facilityStatements,
  featureRegistryStatements,
  mapAuditRow,
  mapFacilityRow,
  mapFeatureRow,
  mapOrganizationRow,
  mapResidentRow,
  mapUserCredentialRow,
  mapUserRow,
  organizationStatements,
  residentStatements,
  userCredentialStatements,
  userStatements
} from '.';

describe('Postgres statement builders', () => {
  it('uses parameterized statements for organization and facility persistence', () => {
    const organization = organizationStatements.upsert({
      id: 'org-1',
      name: 'Northstar Senior Living',
      status: 'active'
    });

    expect(organization.text).toContain('VALUES ($1, $2, $3)');
    expect(organization.values).toEqual(['org-1', 'Northstar Senior Living', 'active']);

    const facilities = facilityStatements.listByOrganization('org-1');
    expect(facilities.text).toContain('WHERE organization_id = $1');
    expect(facilities.values).toEqual(['org-1']);
  });

  it('queries users with role, facility, and permission joins', () => {
    const byEmail = userStatements.selectByEmail('admin@example.com');

    expect(byEmail.text).toContain('JOIN roles r ON r.id = u.role_id');
    expect(byEmail.text).toContain('LEFT JOIN user_facilities uf ON uf.user_id = u.id');
    expect(byEmail.text).toContain('LEFT JOIN permissions p ON p.id = rp.permission_id');
    expect(byEmail.text).toContain('u.email = $1');
    expect(byEmail.values).toEqual(['admin@example.com']);

    expect(userStatements.deleteFacilities('user-1')).toMatchObject({
      text: 'DELETE FROM user_facilities WHERE user_id = $1',
      values: ['user-1']
    });
    expect(userStatements.insertFacility('user-1', 'facility-1').text).toContain('INSERT INTO user_facilities');
    expect(userCredentialStatements.selectByUserId('user-1')).toMatchObject({
      text: 'SELECT user_id, password_hash, updated_at FROM user_credentials WHERE user_id = $1',
      values: ['user-1']
    });
  });

  it('uses tenant-scoped resident statements', () => {
    const list = residentStatements.listByFacility('org-1', 'facility-1');

    expect(list.text).toContain('WHERE organization_id = $1');
    expect(list.text).toContain('AND facility_id = $2');
    expect(list.values).toEqual(['org-1', 'facility-1']);
  });

  it('serializes feature dependencies and audit states as JSON', () => {
    const feature = featureRegistryStatements.insert(
      {
        featureName: 'Resident Command Center',
        module: 'Resident Core',
        status: 'registered',
        dependencies: ['Tenant Isolation Guard'],
        version: '0.1.0'
      },
      'feature-1'
    );

    expect(feature.text).toContain('$5::jsonb');
    expect(feature.values[4]).toBe(JSON.stringify(['Tenant Isolation Guard']));

    const audit = auditLogStatements.append(
      createAuditEvent({
        id: 'audit-1',
        action: 'update',
        actorUserId: 'user-1',
        actorRole: 'T3',
        entityType: 'Resident',
        entityId: 'resident-1',
        scope: {
          scope: 'resident',
          organizationId: 'org-1',
          facilityId: 'facility-1',
          residentId: 'resident-1'
        },
        beforeState: { room: '214A' },
        afterState: { room: '214B' },
        now: new Date('2026-06-24T01:00:00.000Z')
      })
    );

    expect(audit.text).toContain('INSERT INTO audit_logs');
    expect(audit.text).not.toMatch(/\bUPDATE\b|\bDELETE\b/i);
    expect(audit.values[9]).toBe(JSON.stringify({ room: '214A' }));
    expect(audit.values[10]).toBe(JSON.stringify({ room: '214B' }));
  });
});

describe('Postgres row mappers', () => {
  it('maps organization, facility, user, feature, and audit rows', () => {
    expect(mapOrganizationRow({ id: 'org-1', name: 'Northstar', status: 'active' })).toEqual({
      id: 'org-1',
      name: 'Northstar',
      status: 'active'
    });

    expect(mapFacilityRow({ id: 'facility-1', organization_id: 'org-1', name: 'Cedar Grove', status: 'active' })).toEqual({
      id: 'facility-1',
      organizationId: 'org-1',
      name: 'Cedar Grove',
      status: 'active'
    });

    expect(
      mapUserRow({
        id: 'user-1',
        email: 'admin@example.com',
        role_tier: 'T3',
        organization_id: 'org-1',
        facility_ids: ['facility-1'],
        permissions: ['resident:read'],
        status: 'active'
      })
    ).toEqual({
      id: 'user-1',
      email: 'admin@example.com',
      roleTier: 'T3',
      organizationId: 'org-1',
      facilityIds: ['facility-1'],
      permissions: ['resident:read'],
      status: 'active'
    });

    expect(
      mapUserCredentialRow({
        user_id: 'user-1',
        password_hash: 'pbkdf2-sha512$1000$salt$hash',
        updated_at: '2026-06-24T01:00:00.000Z'
      })
    ).toEqual({
      userId: 'user-1',
      passwordHash: 'pbkdf2-sha512$1000$salt$hash',
      updatedAt: '2026-06-24T01:00:00.000Z'
    });

    expect(
      mapResidentRow({
        id: 'resident-1',
        organization_id: 'org-1',
        facility_id: 'facility-1',
        first_name: 'Maria',
        last_name: 'Alvarez',
        preferred_name: 'Maria',
        room: '214B',
        level_of_care: 'Memory Care',
        status: 'active'
      })
    ).toEqual({
      id: 'resident-1',
      organizationId: 'org-1',
      facilityId: 'facility-1',
      firstName: 'Maria',
      lastName: 'Alvarez',
      preferredName: 'Maria',
      room: '214B',
      levelOfCare: 'Memory Care',
      status: 'active'
    });

    expect(
      mapFeatureRow({
        feature_name: 'Resident Command Center',
        module: 'Resident Core',
        status: 'registered',
        dependencies: ['Tenant Isolation Guard'],
        version: '0.1.0'
      })
    ).toEqual({
      featureName: 'Resident Command Center',
      module: 'Resident Core',
      status: 'registered',
      dependencies: ['Tenant Isolation Guard'],
      version: '0.1.0'
    });

    const audit = mapAuditRow({
      id: 'audit-1',
      action: 'update',
      actor_user_id: 'user-1',
      actor_role: 'T3',
      entity_type: 'Resident',
      entity_id: 'resident-1',
      organization_id: 'org-1',
      facility_id: 'facility-1',
      resident_id: 'resident-1',
      before_state: { room: '214A' },
      after_state: { room: '214B' },
      created_at: new Date('2026-06-24T01:00:00.000Z')
    });

    expect(audit).toMatchObject({
      id: 'audit-1',
      timestamp: '2026-06-24T01:00:00.000Z',
      beforeState: { room: '214A' },
      afterState: { room: '214B' }
    });
    expect(Object.isFrozen(audit)).toBe(true);
  });
});
