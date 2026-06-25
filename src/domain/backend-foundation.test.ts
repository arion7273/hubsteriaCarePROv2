import { describe, expect, it } from 'vitest';
import {
  assertFeatureRegistration,
  canAccessScope,
  createAuditEvent,
  masterAdminBootstrap,
  requirePermission,
  type AccessContext,
  type User
} from '.';

const t2User: User = {
  id: 'user-org-admin',
  email: 'org@example.com',
  roleTier: 'T2',
  organizationId: 'org-1',
  facilityIds: ['facility-1', 'facility-2'],
  permissions: [],
  status: 'active'
};

const t3User: User = {
  id: 'user-facility-admin',
  email: 'facility@example.com',
  roleTier: 'T3',
  organizationId: 'org-1',
  facilityIds: ['facility-1'],
  permissions: [],
  status: 'active'
};

describe('backend foundation access control', () => {
  it('allows T1 platform access and denies non-T1 platform scope', () => {
    const t1Context: AccessContext = {
      user: {
        id: 'user-master',
        email: masterAdminBootstrap.email,
        roleTier: 'T1',
        facilityIds: [],
        permissions: [],
        status: 'active'
      }
    };

    expect(canAccessScope(t1Context, { scope: 'platform' })).toMatchObject({ allowed: true });
    expect(canAccessScope({ user: t2User }, { scope: 'platform' })).toMatchObject({ allowed: false });
  });

  it('denies cross-organization and cross-facility access', () => {
    expect(
      canAccessScope(
        { user: t2User },
        {
          scope: 'facility',
          organizationId: 'org-2',
          facilityId: 'facility-1'
        }
      )
    ).toMatchObject({ allowed: false, reason: 'Cross-organization access denied' });

    expect(
      canAccessScope(
        { user: t3User },
        {
          scope: 'facility',
          organizationId: 'org-1',
          facilityId: 'facility-2'
        }
      )
    ).toMatchObject({ allowed: false, reason: 'Cross-facility access denied' });
  });

  it('requires permissions inside valid tenant scope', () => {
    expect(
      requirePermission(
        { user: t3User },
        {
          scope: 'facility',
          organizationId: 'org-1',
          facilityId: 'facility-1'
        },
        'billing:manage'
      )
    ).toMatchObject({ allowed: false, reason: 'Missing permission: billing:manage' });

    expect(
      requirePermission(
        { user: t3User },
        {
          scope: 'facility',
          organizationId: 'org-1',
          facilityId: 'facility-1'
        },
        'resident:read'
      )
    ).toMatchObject({ allowed: true });
  });

  it('restricts family and resident users to assigned residents only', () => {
    const familyUser: User = {
      id: 'family-1',
      email: 'family@example.com',
      roleTier: 'FAMILY',
      organizationId: 'org-1',
      facilityIds: ['facility-1'],
      residentIds: ['resident-1'],
      permissions: [],
      status: 'active'
    };

    expect(
      canAccessScope(
        { user: familyUser },
        { scope: 'resident', organizationId: 'org-1', facilityId: 'facility-1', residentId: 'resident-1' }
      )
    ).toMatchObject({ allowed: true });
    expect(
      canAccessScope(
        { user: familyUser },
        { scope: 'resident', organizationId: 'org-1', facilityId: 'facility-1', residentId: 'resident-2' }
      )
    ).toMatchObject({ allowed: false, reason: 'Cross-resident access denied' });
    expect(
      canAccessScope({ user: familyUser }, { scope: 'facility', organizationId: 'org-1', facilityId: 'facility-1' })
    ).toMatchObject({ allowed: false, reason: 'Resident-specific access required' });
  });
});

describe('backend foundation audit and registry', () => {
  it('creates immutable audit events with before and after state', () => {
    const event = createAuditEvent({
      id: 'audit-1',
      action: 'update',
      actorUserId: 'user-facility-admin',
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
    });

    expect(event).toMatchObject({
      timestamp: '2026-06-24T01:00:00.000Z',
      organizationId: 'org-1',
      facilityId: 'facility-1',
      residentId: 'resident-1',
      beforeState: { room: '214A' },
      afterState: { room: '214B' }
    });
    expect(Object.isFrozen(event)).toBe(true);
  });

  it('validates feature registry required fields', () => {
    expect(() =>
      assertFeatureRegistration({
        featureName: '',
        module: 'eMAR',
        status: 'registered',
        dependencies: [],
        version: '0.1.0'
      })
    ).toThrow(/Feature Name is required/);

    expect(
      assertFeatureRegistration({
        featureName: 'Medication Orders',
        module: 'eMAR',
        status: 'registered',
        dependencies: ['Resident Command Center'],
        version: '0.1.0'
      })
    ).toMatchObject({ featureName: 'Medication Orders' });
  });

  it('does not store the bootstrap master admin password in source', () => {
    expect(masterAdminBootstrap.email).toBe('b094650@gmail.com');
    expect(masterAdminBootstrap.credentialStorage).toBe('managed-secret');
    expect(masterAdminBootstrap.plainTextPasswordStored).toBe(false);
  });
});
