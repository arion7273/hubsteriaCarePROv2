import { createAuditEvent } from './audit';
import type { RegisteredFeature } from './feature-registry';
import type { BackendRepositories } from './repositories';
import { requirePermission } from './access-control';
import type {
  AccessContext,
  AiGenerationJobInput,
  Assessment,
  BackgroundJob,
  CarePlan,
  DigitalRxSyncJobInput,
  Facility,
  NotificationJobInput,
  Organization,
  PrintJobInput,
  Resident,
  User,
  UUID,
  WorkflowActionJobInput
} from './types';
import type { AccessContext, AdlEntry, CareTask, Facility, Organization, Resident, ServicePlanRecord, User, UUID } from './types';

export type IdFactory = () => UUID;
export type Clock = () => Date;

export class BackendFoundationService {
  constructor(
    private readonly repositories: BackendRepositories,
    private readonly createId: IdFactory,
    private readonly clock: Clock = () => new Date()
  ) {}

  async createOrganization(
    context: AccessContext,
    input: {
      name: string;
    }
  ): Promise<Organization> {
    const decision = requirePermission(context, { scope: 'platform' }, 'platform:manage');
    assertAllowed(decision);

    const organization: Organization = {
      id: this.createId(),
      name: input.name,
      status: 'active'
    };

    const saved = await this.repositories.organizations.save(organization);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'create',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'Organization',
        entityId: saved.id,
        scope: { scope: 'organization', organizationId: saved.id },
        beforeState: null,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  async listOrganizations(context: AccessContext): Promise<Organization[]> {
    const decision = requirePermission(context, { scope: 'platform' }, 'platform:manage');
    assertAllowed(decision);

    return this.repositories.organizations.list();
  }

  async getOrganization(context: AccessContext, organizationId: UUID): Promise<Organization> {
    const decision = requirePermission(context, { scope: 'organization', organizationId }, 'organization:manage');
    assertAllowed(decision);

    const organization = await this.repositories.organizations.getById(organizationId);

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  }

  async updateOrganization(
    context: AccessContext,
    organizationId: UUID,
    updates: Partial<Omit<Organization, 'id'>>
  ): Promise<Organization> {
    const decision = requirePermission(context, { scope: 'platform' }, 'platform:manage');
    assertAllowed(decision);

    const existing = await this.repositories.organizations.getById(organizationId);

    if (!existing) {
      throw new Error('Organization not found');
    }

    const saved = await this.repositories.organizations.save({
      ...existing,
      ...updates,
      id: existing.id
    });

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'update',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'Organization',
        entityId: saved.id,
        scope: { scope: 'organization', organizationId: saved.id },
        beforeState: existing,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  async createFacility(
    context: AccessContext,
    input: {
      organizationId: UUID;
      name: string;
    }
  ): Promise<Facility> {
    const decision = requirePermission(
      context,
      { scope: 'organization', organizationId: input.organizationId },
      'facility:manage'
    );
    assertAllowed(decision);

    const facility: Facility = {
      id: this.createId(),
      organizationId: input.organizationId,
      name: input.name,
      status: 'active'
    };

    const saved = await this.repositories.facilities.save(facility);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'create',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'Facility',
        entityId: saved.id,
        scope: {
          scope: 'facility',
          organizationId: saved.organizationId,
          facilityId: saved.id
        },
        beforeState: null,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  async getFacility(context: AccessContext, facilityId: UUID): Promise<Facility> {
    const facility = await this.repositories.facilities.getById(facilityId);

    if (!facility) {
      throw new Error('Facility not found');
    }

    const decision = requirePermission(
      context,
      { scope: 'facility', organizationId: facility.organizationId, facilityId: facility.id },
      'facility:manage'
    );
    assertAllowed(decision);

    return facility;
  }

  async listFacilitiesByOrganization(context: AccessContext, organizationId: UUID): Promise<Facility[]> {
    const decision = requirePermission(context, { scope: 'organization', organizationId }, 'facility:manage');
    assertAllowed(decision);

    return this.repositories.facilities.listByOrganization(organizationId);
  }

  async updateFacility(
    context: AccessContext,
    facilityId: UUID,
    updates: Partial<Omit<Facility, 'id' | 'organizationId'>>
  ): Promise<Facility> {
    const existing = await this.getFacility(context, facilityId);
    const decision = requirePermission(
      context,
      { scope: 'facility', organizationId: existing.organizationId, facilityId: existing.id },
      'facility:manage'
    );
    assertAllowed(decision);

    const saved = await this.repositories.facilities.save({
      ...existing,
      ...updates,
      id: existing.id,
      organizationId: existing.organizationId
    });

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'update',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'Facility',
        entityId: saved.id,
        scope: {
          scope: 'facility',
          organizationId: saved.organizationId,
          facilityId: saved.id
        },
        beforeState: existing,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  async registerFeature(context: AccessContext, feature: RegisteredFeature): Promise<RegisteredFeature> {
    const decision = requirePermission(context, { scope: 'platform' }, 'platform:manage');
    assertAllowed(decision);

    const registered = await this.repositories.featureRegistry.register(feature);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'create',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'Feature',
        entityId: registered.featureName,
        scope: { scope: 'platform' },
        beforeState: null,
        afterState: registered,
        now: this.clock()
      })
    );

    return registered;
  }

  async createResident(
    context: AccessContext,
    input: Omit<Resident, 'id' | 'status'>
  ): Promise<Resident> {
    const decision = requirePermission(
      context,
      {
        scope: 'facility',
        organizationId: input.organizationId,
        facilityId: input.facilityId
      },
      'resident:write'
    );
    assertAllowed(decision);

    const resident: Resident = {
      id: this.createId(),
      status: 'active',
      ...input
    };
    const saved = await this.repositories.residents.save(resident);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'create',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'Resident',
        entityId: saved.id,
        scope: {
          scope: 'resident',
          organizationId: saved.organizationId,
          facilityId: saved.facilityId,
          residentId: saved.id
        },
        beforeState: null,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  async getResident(context: AccessContext, residentId: UUID): Promise<Resident> {
    const resident = await this.repositories.residents.getById(residentId);

    if (!resident) {
      throw new Error('Resident not found');
    }

    const decision = requirePermission(
      context,
      {
        scope: 'resident',
        organizationId: resident.organizationId,
        facilityId: resident.facilityId,
        residentId: resident.id
      },
      'resident:read'
    );
    assertAllowed(decision);

    return resident;
  }

  async listResidentsByFacility(
    context: AccessContext,
    input: {
      organizationId: UUID;
      facilityId: UUID;
    }
  ): Promise<Resident[]> {
    const decision = requirePermission(
      context,
      {
        scope: 'facility',
        organizationId: input.organizationId,
        facilityId: input.facilityId
      },
      'resident:read'
    );
    assertAllowed(decision);

    return this.repositories.residents.listByFacility(input.organizationId, input.facilityId);
  }

  async updateResident(
    context: AccessContext,
    residentId: UUID,
    updates: Partial<Omit<Resident, 'id' | 'organizationId' | 'facilityId'>>
  ): Promise<Resident> {
    const existing = await this.getResident(context, residentId);
    const decision = requirePermission(
      context,
      {
        scope: 'resident',
        organizationId: existing.organizationId,
        facilityId: existing.facilityId,
        residentId: existing.id
      },
      'resident:write'
    );
    assertAllowed(decision);

    const updated: Resident = {
      ...existing,
      ...updates
    };
    const saved = await this.repositories.residents.save(updated);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'update',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'Resident',
        entityId: saved.id,
        scope: {
          scope: 'resident',
          organizationId: saved.organizationId,
          facilityId: saved.facilityId,
          residentId: saved.id
        },
        beforeState: existing,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  async enqueueBackgroundJob(
    context: AccessContext,
    input: Omit<BackgroundJob, 'id' | 'status' | 'attempts' | 'createdAt' | 'updatedAt'>
  ): Promise<BackgroundJob> {
    if (input.residentId) {
      await this.getResident(context, input.residentId);
    } else if (input.facilityId && input.organizationId) {
      assertAllowed(requirePermission(context, { scope: 'facility', organizationId: input.organizationId, facilityId: input.facilityId }, 'facility:manage'));
    } else if (input.organizationId) {
      assertAllowed(requirePermission(context, { scope: 'organization', organizationId: input.organizationId }, 'organization:manage'));
    } else {
      assertAllowed(requirePermission(context, { scope: 'platform' }, 'platform:manage'));
    }

    const now = this.clock().toISOString();
    const job = await this.repositories.backgroundJobs.save({
      id: this.createId(),
      status: 'queued',
      attempts: 0,
      createdAt: now,
      updatedAt: now,
      ...input
    });

    await this.auditJob(context, job, null);
    return job;
  }

  async leaseQueuedJobs(context: AccessContext, limit: number): Promise<BackgroundJob[]> {
    assertAllowed(requirePermission(context, { scope: 'platform' }, 'platform:manage'));
    const jobs = await this.repositories.backgroundJobs.listQueued(limit);
    const now = this.clock().toISOString();
    return Promise.all(
      jobs.map((job) =>
        this.repositories.backgroundJobs.save({
          ...job,
          status: 'processing',
          attempts: job.attempts + 1,
          updatedAt: now
        })
      )
    );
  }

  async completeBackgroundJob(context: AccessContext, jobId: UUID): Promise<BackgroundJob> {
    return this.transitionBackgroundJob(context, jobId, { status: 'succeeded', lastError: undefined });
  }

  async failBackgroundJob(context: AccessContext, jobId: UUID, error: string): Promise<BackgroundJob> {
    const existing = await this.repositories.backgroundJobs.getById(jobId);
    if (!existing) throw new Error('Background job not found');
    const status = existing.attempts >= existing.maxAttempts ? 'dead_letter' : 'failed';
    return this.transitionBackgroundJob(context, jobId, { status, lastError: error });
  }

  async listBackgroundJobsByScope(
    context: AccessContext,
    scope: { organizationId?: UUID; facilityId?: UUID; residentId?: UUID }
  ): Promise<BackgroundJob[]> {
    if (scope.residentId) {
      await this.getResident(context, scope.residentId);
    } else if (scope.facilityId && scope.organizationId) {
      assertAllowed(requirePermission(context, { scope: 'facility', organizationId: scope.organizationId, facilityId: scope.facilityId }, 'report:read'));
    } else if (scope.organizationId) {
      assertAllowed(requirePermission(context, { scope: 'organization', organizationId: scope.organizationId }, 'report:read'));
    } else {
      assertAllowed(requirePermission(context, { scope: 'platform' }, 'platform:manage'));
    }
    return this.repositories.backgroundJobs.listByScope(scope);
  }

  enqueueNotificationJob(context: AccessContext, input: NotificationJobInput): Promise<BackgroundJob> {
    return this.enqueueBackgroundJob(context, {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      residentId: input.residentId,
      type: 'notification',
      priority: input.priority ?? 'normal',
      maxAttempts: 3,
      availableAt: this.clock().toISOString(),
      payload: {
        channel: input.channel,
        template: input.template,
        recipient: input.recipient,
        ...input.payload
      }
    });
  }

  enqueuePrintJob(context: AccessContext, input: PrintJobInput): Promise<BackgroundJob> {
    return this.enqueueBackgroundJob(context, {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      residentId: input.residentId,
      type: 'print',
      priority: input.priority ?? 'normal',
      maxAttempts: 3,
      availableAt: this.clock().toISOString(),
      payload: {
        template: input.template,
        format: input.format,
        recordIds: input.recordIds
      }
    });
  }

  enqueueDigitalRxSyncJob(context: AccessContext, input: DigitalRxSyncJobInput): Promise<BackgroundJob> {
    return this.enqueueBackgroundJob(context, {
      organizationId: input.organizationId,
      type: 'digitalrx_sync',
      priority: input.priority ?? 'high',
      maxAttempts: 5,
      availableAt: this.clock().toISOString(),
      payload: {
        event: input.event,
        ...input.payload
      }
    });
  }

  enqueueAiGenerationJob(context: AccessContext, input: AiGenerationJobInput): Promise<BackgroundJob> {
    return this.enqueueBackgroundJob(context, {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      residentId: input.residentId,
      type: 'ai_generation',
      priority: input.priority ?? 'low',
      maxAttempts: 2,
      availableAt: this.clock().toISOString(),
      payload: {
        task: input.task,
        ...input.payload
      }
    });
  }

  enqueueWorkflowActionJob(context: AccessContext, input: WorkflowActionJobInput): Promise<BackgroundJob> {
    return this.enqueueBackgroundJob(context, {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      residentId: input.residentId,
      type: 'workflow_action',
      priority: input.priority ?? 'normal',
      maxAttempts: 3,
      availableAt: this.clock().toISOString(),
      payload: {
        trigger: input.trigger,
        action: input.action,
        ...input.payload
      }
    });
  }

  async createAssessment(context: AccessContext, input: Omit<Assessment, 'id'>): Promise<Assessment> {
    const resident = await this.getResident(context, input.residentId);
    const decision = requirePermission(
      context,
      { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id },
      'assessment:manage'
    );
    assertAllowed(decision);

    const assessment: Assessment = { id: this.createId(), ...input };
    const saved = await this.repositories.assessments.save(assessment);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'create',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'Assessment',
        entityId: saved.id,
        scope: { scope: 'resident', organizationId: saved.organizationId, facilityId: saved.facilityId, residentId: saved.residentId },
        beforeState: null,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  async listAssessmentsByResident(context: AccessContext, residentId: UUID): Promise<Assessment[]> {
    await this.getResident(context, residentId);
    return this.repositories.assessments.listByResident(residentId);
  }

  async createCarePlan(context: AccessContext, input: Omit<CarePlan, 'id'>): Promise<CarePlan> {
    const resident = await this.getResident(context, input.residentId);
    const decision = requirePermission(
      context,
      { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id },
      'assessment:manage'
    );
    assertAllowed(decision);

    const carePlan: CarePlan = { id: this.createId(), ...input };
    const saved = await this.repositories.carePlans.save(carePlan);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'create',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'CarePlan',
        entityId: saved.id,
        scope: { scope: 'resident', organizationId: saved.organizationId, facilityId: saved.facilityId, residentId: saved.residentId },
        beforeState: null,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  async listCarePlansByResident(context: AccessContext, residentId: UUID): Promise<CarePlan[]> {
    await this.getResident(context, residentId);
    return this.repositories.carePlans.listByResident(residentId);
  async createCareTask(context: AccessContext, input: Omit<CareTask, 'id'>): Promise<CareTask> {
    const resident = await this.getResident(context, input.residentId);
    const decision = requirePermission(context, { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id }, 'resident:write');
    assertAllowed(decision);
    const task = await this.repositories.careTasks.save({ id: this.createId(), ...input });
    await this.auditEntity(context, 'CareTask', task.id, task, { scope: 'resident', organizationId: task.organizationId, facilityId: task.facilityId, residentId: task.residentId });
    return task;
  }

  async listCareTasksByResident(context: AccessContext, residentId: UUID): Promise<CareTask[]> {
    await this.getResident(context, residentId);
    return this.repositories.careTasks.listByResident(residentId);
  }

  async completeCareTask(context: AccessContext, taskId: UUID): Promise<CareTask> {
    const existing = await this.repositories.careTasks.getById(taskId);
    if (!existing) throw new Error('Task not found');
    const decision = requirePermission(context, { scope: 'resident', organizationId: existing.organizationId, facilityId: existing.facilityId, residentId: existing.residentId }, 'resident:write');
    assertAllowed(decision);
    const saved = await this.repositories.careTasks.save({ ...existing, status: 'complete' });
    await this.auditEntity(context, 'CareTask', saved.id, saved, { scope: 'resident', organizationId: saved.organizationId, facilityId: saved.facilityId, residentId: saved.residentId }, existing);
    return saved;
  }

  async logAdl(context: AccessContext, input: Omit<AdlEntry, 'id' | 'recordedAt' | 'recordedBy'>): Promise<AdlEntry> {
    const resident = await this.getResident(context, input.residentId);
    const decision = requirePermission(context, { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id }, 'resident:write');
    assertAllowed(decision);
    const entry = await this.repositories.adlEntries.save({ id: this.createId(), recordedAt: this.clock().toISOString(), recordedBy: context.user.id, ...input });
    await this.auditEntity(context, 'AdlEntry', entry.id, entry, { scope: 'resident', organizationId: entry.organizationId, facilityId: entry.facilityId, residentId: entry.residentId });
    return entry;
  }

  async listAdlsByResident(context: AccessContext, residentId: UUID): Promise<AdlEntry[]> {
    await this.getResident(context, residentId);
    return this.repositories.adlEntries.listByResident(residentId);
  }

  async createServicePlan(context: AccessContext, input: Omit<ServicePlanRecord, 'id'>): Promise<ServicePlanRecord> {
    const resident = await this.getResident(context, input.residentId);
    const decision = requirePermission(context, { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id }, 'resident:write');
    assertAllowed(decision);
    const plan = await this.repositories.servicePlans.save({ id: this.createId(), ...input });
    await this.auditEntity(context, 'ServicePlan', plan.id, plan, { scope: 'resident', organizationId: plan.organizationId, facilityId: plan.facilityId, residentId: plan.residentId });
    return plan;
  }

  async listServicePlansByResident(context: AccessContext, residentId: UUID): Promise<ServicePlanRecord[]> {
    await this.getResident(context, residentId);
    return this.repositories.servicePlans.listByResident(residentId);
  }

  async createUser(
    context: AccessContext,
    input: Omit<User, 'id' | 'status'>
  ): Promise<User> {
    const decision = requirePermission(context, userManagementScope(input.organizationId), userManagementPermission(input.organizationId));
    assertAllowed(decision);

    const user: User = {
      id: this.createId(),
      status: 'active',
      ...input
    };
    const saved = await this.repositories.users.save(user);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'create',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'User',
        entityId: saved.id,
        scope: userManagementScope(saved.organizationId),
        beforeState: null,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  async listUsersByOrganization(context: AccessContext, organizationId: UUID): Promise<User[]> {
    const decision = requirePermission(context, { scope: 'organization', organizationId }, 'organization:manage');
    assertAllowed(decision);

    return this.repositories.users.listByOrganization(organizationId);
  }

  async updateUser(
    context: AccessContext,
    userId: UUID,
    updates: Partial<Omit<User, 'id'>>
  ): Promise<User> {
    const existing = await this.repositories.users.getById(userId);

    if (!existing) {
      throw new Error('User not found');
    }

    const decision = requirePermission(context, userManagementScope(existing.organizationId), userManagementPermission(existing.organizationId));
    assertAllowed(decision);

    const saved = await this.repositories.users.save({
      ...existing,
      ...updates,
      id: existing.id
    });

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'update',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'User',
        entityId: saved.id,
        scope: userManagementScope(saved.organizationId),
        beforeState: existing,
        afterState: saved,
        now: this.clock()
      })
    );

    return saved;
  }

  private async transitionBackgroundJob(
    context: AccessContext,
    jobId: UUID,
    updates: Pick<Partial<BackgroundJob>, 'status' | 'lastError'>
  ): Promise<BackgroundJob> {
    assertAllowed(requirePermission(context, { scope: 'platform' }, 'platform:manage'));
    const existing = await this.repositories.backgroundJobs.getById(jobId);
    if (!existing) throw new Error('Background job not found');
    const updated = await this.repositories.backgroundJobs.save({ ...existing, ...updates, updatedAt: this.clock().toISOString() });
    await this.auditJob(context, updated, existing);
    return updated;
  }

  private async auditJob(context: AccessContext, job: BackgroundJob, beforeState: BackgroundJob | null): Promise<void> {
  private async auditEntity(
    context: AccessContext,
    entityType: string,
    entityId: UUID,
    afterState: unknown,
    scope: { scope: 'resident'; organizationId: UUID; facilityId: UUID; residentId: UUID },
    beforeState: unknown = null
  ) {
    await this.repositories.auditLogs.append(createAuditEvent({
      id: this.createId(),
      action: beforeState ? 'update' : 'create',
      actorUserId: context.user.id,
      actorRole: context.user.roleTier,
      entityType: 'BackgroundJob',
      entityId: job.id,
      scope: { scope: job.residentId ? 'resident' : job.facilityId ? 'facility' : job.organizationId ? 'organization' : 'platform', organizationId: job.organizationId, facilityId: job.facilityId, residentId: job.residentId },
      beforeState,
      afterState: job,
      entityType,
      entityId,
      scope,
      beforeState,
      afterState,
      now: this.clock()
    }));
  }
}

function assertAllowed(decision: { allowed: boolean; reason: string }): void {
  if (!decision.allowed) {
    throw new Error(decision.reason);
  }
}

function userManagementScope(organizationId: UUID | undefined) {
  return organizationId ? { scope: 'organization' as const, organizationId } : { scope: 'platform' as const };
}

function userManagementPermission(organizationId: UUID | undefined) {
  return organizationId ? 'organization:manage' : 'platform:manage';
}
