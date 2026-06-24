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

const t3User: User = {
  id: 'user-facility',
  email: 'facility@example.com',
  roleTier: 'T3',
  organizationId: 'org-1',
  facilityIds: ['facility-1'],
  permissions: [],
  status: 'active'
};

function createTestService() {
  const ids = [
    'org-1',
    'audit-1',
    'facility-1',
    'audit-2',
    'resident-1',
    'audit-3',
    'task-1',
    'audit-task',
    'audit-task-complete',
    'adl-1',
    'audit-adl',
    'service-plan-1',
    'audit-service-plan',
    'audit-4',
    'user-1',
    'audit-user',
    'audit-user-update',
    'org-1', 'audit-1',
    'facility-1', 'audit-2',
    'resident-1', 'audit-3',
    'med-order-1', 'audit-med-order',
    'med-admin-1', 'audit-med-admin',
    'audit-4',
    'user-1', 'audit-user', 'audit-user-update',
    'feature-audit'
  ];
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

  it('lists, reads, and updates organizations with audit logs', async () => {
    const { repositories, service } = createTestService();
    await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });

    await expect(service.listOrganizations({ user: t1User })).resolves.toHaveLength(1);
    await expect(service.getOrganization({ user: t2User }, 'org-1')).resolves.toMatchObject({
      name: 'Northstar Senior Living'
    });
    await expect(service.updateOrganization({ user: t1User }, 'org-1', { status: 'suspended' })).resolves.toMatchObject({
      status: 'suspended'
    });
    await expect(repositories.auditLogs.listByEntity('Organization', 'org-1')).resolves.toHaveLength(2);
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

  it('lists, reads, and updates facilities with audit logs', async () => {
    const { repositories, service } = createTestService();
    await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });
    await service.createFacility({ user: t2User }, { organizationId: 'org-1', name: 'Cedar Grove' });

    await expect(service.listFacilitiesByOrganization({ user: t2User }, 'org-1')).resolves.toHaveLength(1);
    await expect(service.getFacility({ user: t3User }, 'facility-1')).resolves.toMatchObject({ name: 'Cedar Grove' });
    await expect(service.updateFacility({ user: t3User }, 'facility-1', { name: 'Cedar Grove East' })).resolves.toMatchObject({
      name: 'Cedar Grove East'
    });
    await expect(repositories.auditLogs.listByEntity('Facility', 'facility-1')).resolves.toHaveLength(2);
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

  it('creates, lists, reads, and updates residents with audit logs', async () => {
    const { repositories, service } = createTestService();
    await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });
    await service.createFacility({ user: t2User }, { organizationId: 'org-1', name: 'Cedar Grove' });

    const resident = await service.createResident(
      {
        user: {
          ...t3User,
          permissions: ['resident:write']
        }
      },
      {
        organizationId: 'org-1',
        facilityId: 'facility-1',
        firstName: 'Maria',
        lastName: 'Alvarez',
        preferredName: 'Maria',
        room: '214B',
        levelOfCare: 'Memory Care'
      }
    );

    expect(resident).toMatchObject({
      id: 'resident-1',
      firstName: 'Maria',
      status: 'active'
    });

    await expect(service.listResidentsByFacility({ user: t3User }, { organizationId: 'org-1', facilityId: 'facility-1' })).resolves.toHaveLength(1);
    await expect(service.getResident({ user: t3User }, 'resident-1')).resolves.toMatchObject({ lastName: 'Alvarez' });

    await expect(
      service.updateResident(
        {
          user: {
            ...t3User,
            permissions: ['resident:write']
          }
        },
        'resident-1',
        { room: '215A' }
      )
    ).resolves.toMatchObject({ room: '215A' });

    await expect(repositories.auditLogs.listByEntity('Resident', 'resident-1')).resolves.toHaveLength(2);
  });

  it('enqueues leases completes and fails background jobs with audit logs', async () => {
    const { repositories, service } = createTestService();
    const job = await service.enqueueBackgroundJob(
      { user: t1User },
      {
        type: 'notification',
        priority: 'critical',
        payload: { channel: 'sms' },
        maxAttempts: 1,
        availableAt: '2026-06-24T01:00:00.000Z'
      }
    );
    expect(job.status).toBe('queued');

    await expect(service.leaseQueuedJobs({ user: t1User }, 1)).resolves.toEqual([
      expect.objectContaining({ status: 'processing', attempts: 1 })
    ]);
    await expect(service.failBackgroundJob({ user: t1User }, job.id, 'provider unavailable')).resolves.toMatchObject({
      status: 'dead_letter',
      lastError: 'provider unavailable'
    });

    const second = await service.enqueueBackgroundJob(
      { user: t1User },
      {
        type: 'print',
        priority: 'normal',
        payload: { template: 'Resident Packet' },
        maxAttempts: 3,
        availableAt: '2026-06-24T01:00:00.000Z'
      }
    );
    await expect(service.completeBackgroundJob({ user: t1User }, second.id)).resolves.toMatchObject({ status: 'succeeded' });
    await expect(repositories.auditLogs.listByEntity('BackgroundJob', job.id)).resolves.toHaveLength(2);
  });

  it('enqueues typed notification print digitalrx ai and workflow jobs', async () => {
    const { service } = createTestService();
    await expect(service.enqueueNotificationJob({ user: t1User }, { channel: 'sms', template: 'Medication Refused', recipient: 'admin@example.com', payload: { residentId: 'resident-1' } })).resolves.toMatchObject({ type: 'notification' });
    await expect(service.enqueuePrintJob({ user: t1User }, { template: 'Resident Packet', format: 'pdf', recordIds: ['resident-1'] })).resolves.toMatchObject({ type: 'print' });
    await expect(service.enqueueDigitalRxSyncJob({ user: t1User }, { organizationId: 'org-1', event: 'refill_updated', payload: { refillId: 'refill-1' } })).resolves.toMatchObject({ type: 'digitalrx_sync' });
    await expect(service.enqueueAiGenerationJob({ user: t1User }, { task: 'resident_summary', payload: { residentId: 'resident-1' } })).resolves.toMatchObject({ type: 'ai_generation' });
    await expect(service.enqueueWorkflowActionJob({ user: t1User }, { trigger: 'Assessment Due', action: 'Create Task', payload: { residentId: 'resident-1' } })).resolves.toMatchObject({ type: 'workflow_action' });
  });

  it('creates and lists assessments and care plans with audit logs', async () => {
    const { repositories, service } = createTestService();
    await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });
    await service.createFacility({ user: t2User }, { organizationId: 'org-1', name: 'Cedar Grove' });
    await service.createResident(
      { user: { ...t3User, permissions: ['resident:write', 'assessment:manage'] } },
      { organizationId: 'org-1', facilityId: 'facility-1', firstName: 'Maria', lastName: 'Alvarez' }
    );

    const assessment = await service.createAssessment(
      { user: { ...t3User, permissions: ['assessment:manage'] } },
      {
        organizationId: 'org-1',
        facilityId: 'facility-1',
        residentId: 'resident-1',
        type: 'Fall Risk Assessment',
        status: 'review',
        score: 8,
        answers: { mobility: 'walker' }
      }
    );

    expect(assessment).toMatchObject({ type: 'Fall Risk Assessment', score: 8 });
    await expect(service.listAssessmentsByResident({ user: t3User }, 'resident-1')).resolves.toHaveLength(1);

    const carePlan = await service.createCarePlan(
      { user: { ...t3User, permissions: ['assessment:manage'] } },
      {
        organizationId: 'org-1',
        facilityId: 'facility-1',
        residentId: 'resident-1',
        goal: 'Reduce fall risk',
        interventions: ['Escort to dining room'],
        outcome: 'No falls',
        reviewDate: '2026-07-24',
        assignedStaff: 'Wellness Director',
        status: 'active'
      }
    );

    expect(carePlan).toMatchObject({ goal: 'Reduce fall risk' });
    await expect(service.listCarePlansByResident({ user: t3User }, 'resident-1')).resolves.toHaveLength(1);
    await expect(repositories.auditLogs.listByEntity('Assessment', assessment.id)).resolves.toHaveLength(1);
    await expect(repositories.auditLogs.listByEntity('CarePlan', carePlan.id)).resolves.toHaveLength(1);
  });

  it('creates medication orders and records med pass actions with audit logs', async () => {
    const { repositories, service } = createTestService();
    await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });
    await service.createFacility({ user: t2User }, { organizationId: 'org-1', name: 'Cedar Grove' });
    await service.createResident(
      { user: { ...t3User, permissions: ['resident:write', 'medication:manage'] } },
      { organizationId: 'org-1', facilityId: 'facility-1', firstName: 'Maria', lastName: 'Alvarez' }
    );

    const order = await service.createMedicationOrder(
      { user: { ...t3User, permissions: ['medication:manage'] } },
      {
        organizationId: 'org-1',
        facilityId: 'facility-1',
        residentId: 'resident-1',
        medication: 'Lisinopril',
        dosage: '10mg',
        route: 'PO',
        schedule: 'Daily 8 AM',
        status: 'active',
        instructions: 'Check BP first'
      }
    );

    expect(order).toMatchObject({ medication: 'Lisinopril', status: 'active' });
    await expect(service.listMedicationOrdersByResident({ user: t3User }, 'resident-1')).resolves.toHaveLength(1);

    const administration = await service.recordMedicationAdministration(
      { user: { ...t3User, permissions: ['medication:manage'] } },
      {
        organizationId: 'org-1',
        facilityId: 'facility-1',
        residentId: 'resident-1',
        medicationOrderId: order.id,
        action: 'given',
        outcome: 'No adverse reaction'
      }
    );

    expect(administration).toMatchObject({ action: 'given', administeredBy: t3User.id });
    await expect(service.listMedicationAdministrationsByResident({ user: t3User }, 'resident-1')).resolves.toHaveLength(1);
    await expect(repositories.auditLogs.listByEntity('MedicationOrder', order.id)).resolves.toHaveLength(1);
    await expect(repositories.auditLogs.listByEntity('MedicationAdministration', administration.id)).resolves.toHaveLength(1);
  });

  it('creates tasks, completes tasks, logs ADLs, and creates service plans with audit logs', async () => {
    const { repositories, service } = createTestService();
    await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });
    await service.createFacility({ user: t2User }, { organizationId: 'org-1', name: 'Cedar Grove' });
    await service.createResident(
      { user: { ...t3User, permissions: ['resident:write'] } },
      { organizationId: 'org-1', facilityId: 'facility-1', firstName: 'Maria', lastName: 'Alvarez' }
    );

    const task = await service.createCareTask(
      { user: { ...t3User, permissions: ['resident:write'] } },
      {
        organizationId: 'org-1',
        facilityId: 'facility-1',
        residentId: 'resident-1',
        title: 'Breakfast ADL documentation',
        taskType: 'daily',
        dueAt: '2026-06-24T09:30:00.000Z',
        assignedStaff: 'Caregiver Lead',
        status: 'due'
      }
    );

    await expect(service.completeCareTask({ user: { ...t3User, permissions: ['resident:write'] } }, task.id)).resolves.toMatchObject({
      status: 'complete'
    });
    await expect(service.listCareTasksByResident({ user: t3User }, 'resident-1')).resolves.toHaveLength(1);

    const adl = await service.logAdl(
      { user: { ...t3User, permissions: ['resident:write'] } },
      {
        organizationId: 'org-1',
        facilityId: 'facility-1',
        residentId: 'resident-1',
        category: 'Feeding',
        outcome: '75% breakfast intake'
      }
    );
    expect(adl.recordedBy).toBe(t3User.id);
    await expect(service.listAdlsByResident({ user: t3User }, 'resident-1')).resolves.toHaveLength(1);

    const servicePlan = await service.createServicePlan(
      { user: { ...t3User, permissions: ['resident:write'] } },
      {
        organizationId: 'org-1',
        facilityId: 'facility-1',
        residentId: 'resident-1',
        service: 'Memory care evening support',
        schedule: 'Daily',
        assignedStaff: 'Evening Caregiver',
        status: 'active'
      }
    );
    expect(servicePlan.service).toBe('Memory care evening support');
    await expect(service.listServicePlansByResident({ user: t3User }, 'resident-1')).resolves.toHaveLength(1);
    await expect(repositories.auditLogs.listByEntity('CareTask', task.id)).resolves.toHaveLength(2);
  });

  it('denies resident creation across facility boundaries', async () => {
    const { service } = createTestService();

    await expect(
      service.createResident({ user: t3User }, {
        organizationId: 'org-1',
        facilityId: 'facility-2',
        firstName: 'Blocked',
        lastName: 'Resident'
      })
    ).rejects.toThrow('Cross-facility access denied');
  });

  it('creates, lists, and updates organization users with audit logs', async () => {
    const { repositories, service } = createTestService();
    await service.createOrganization({ user: t1User }, { name: 'Northstar Senior Living' });

    const user = await service.createUser({ user: t2User }, {
      email: 'caregiver@example.com',
      roleTier: 'EMPLOYEE',
      organizationId: 'org-1',
      facilityIds: ['facility-1'],
      permissions: ['resident:read']
    });

    expect(user).toMatchObject({
      email: 'caregiver@example.com'
    });
    await expect(service.listUsersByOrganization({ user: t2User }, 'org-1')).resolves.toHaveLength(1);

    await expect(service.updateUser({ user: t2User }, user.id, { status: 'inactive' })).resolves.toMatchObject({
      status: 'inactive'
    });
    await expect(repositories.auditLogs.listByEntity('User', user.id)).resolves.toHaveLength(2);
  });
});
