import { describe, expect, it } from 'vitest';
import { BackendFoundationService, createInMemoryBackendRepositories, type User } from '.';

const t1User: User = {
  id: 'user-master',
  email: 'b094650@gmail.com',
  roleTier: 'T1',
  facilityIds: [],
  permissions: [],
  status: 'active'
};

const t2User: User = {
  id: 'user-org',
  email: 'org@example.com',
  roleTier: 'T2',
  organizationId: 'org-1',
  facilityIds: ['facility-1'],
  permissions: [],
  status: 'active'
};

function createTestService() {
  const ids = ['org-1', 'audit-1', 'facility-1', 'audit-2', 'feature-audit'];
  const repositories = createInMemoryBackendRepositories();
  const service = new BackendFoundationService(
    repositories,
    () => ids.shift() ?? `id-${Math.random()}`,
    () => new Date('2026-06-24T01:00:00.000Z')
  );

  return { repositories, service };
}

describe('BackendFoundationService', () => {
  it('creates organizations for T1 users and writes audit events', async () => {
    const { repositories, service } = createTestService();

    const organization = await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });

    expect(organization).toMatchObject({
      id: 'org-1',
      name: 'Northstar Senior Living',
      status: 'active'
    });

    await expect(repositories.organizations.getById('org-1')).resolves.toMatchObject({ name: 'Northstar Senior Living' });
    await expect(repositories.auditLogs.listByEntity('Organization', 'org-1')).resolves.toHaveLength(1);
  });

  it('denies organization creation for non-T1 users', async () => {
    const { service } = createTestService();

    await expect(service.createOrganization({ user: t2User }, { name: 'Blocked Org' })).rejects.toThrow(
      'Only T1 can access platform scope'
    );
  });

  it('creates facilities for organization administrators in their organization', async () => {
    const { repositories, service } = createTestService();
    await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });

    const facility = await service.createFacility({ user: t2User }, { organizationId: 'org-1', name: 'Cedar Grove' });

    expect(facility).toMatchObject({
      id: 'facility-1',
      organizationId: 'org-1',
      name: 'Cedar Grove'
    });
    await expect(repositories.facilities.listByOrganization('org-1')).resolves.toHaveLength(1);
    await expect(repositories.auditLogs.listByEntity('Facility', 'facility-1')).resolves.toHaveLength(1);
  });

  it('prevents organization administrators from creating facilities in another organization', async () => {
    const { service } = createTestService();

    await expect(service.createFacility({ user: t2User }, { organizationId: 'org-2', name: 'Blocked Facility' })).rejects.toThrow(
      'Cross-organization access denied'
    );
  });

  it('registers features only through platform administrators and writes audit events', async () => {
    const { repositories, service } = createTestService();
    await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });
    await service.createFacility({ user: t2User }, { organizationId: 'org-1', name: 'Cedar Grove' });

    const feature = await service.registerFeature(
      { user: t1User },
      {
        featureName: 'Tenant Isolation Guard',
        module: 'Security & Access',
        status: 'registered',
        dependencies: ['Organizations', 'Facilities'],
        version: '0.1.0'
      }
    );

    expect(feature.featureName).toBe('Tenant Isolation Guard');
    await expect(repositories.featureRegistry.list()).resolves.toHaveLength(1);
    await expect(repositories.auditLogs.listByEntity('Feature', 'Tenant Isolation Guard')).resolves.toHaveLength(1);
  });
});
