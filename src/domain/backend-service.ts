import { createAuditEvent } from './audit';
import type { RegisteredFeature } from './feature-registry';
import type { BackendRepositories } from './repositories';
import { hasPermission, requirePermission, rolePermissions } from './access-control';
import type {
  AccessContext,
  AdlEntry,
  AiGenerationJobInput,
  Assessment,
  BackgroundJob,
  BillingCharge,
  CarePlan,
  CareTask,
  ComplianceIssue,
  DigitalRxSyncJobInput,
  Facility,
  Incident,
  Invoice,
  MedicationAdministration,
  MedicationOrder,
  NotificationJobInput,
  OperationalRecord,
  Organization,
  PaymentTransaction,
  PrintJobInput,
  Resident,
  ServicePlanRecord,
  User,
  UUID,
  WorkflowActionJobInput
} from './types';

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

  async getResident(context: AccessContext, residentId: UUID, auditRead = true): Promise<Resident> {
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

    if (auditRead) {
      await this.auditPhiAccess(context, 'Resident', resident.id, {
        scope: 'resident',
        organizationId: resident.organizationId,
        facilityId: resident.facilityId,
        residentId: resident.id
      }, 'read');
    }

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
    const existing = await this.getResident(context, residentId, false);
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
      await this.getResident(context, input.residentId, false);
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
      await this.getResident(context, scope.residentId, false);
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
    const resident = await this.getResident(context, input.residentId, false);
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
    await this.getResident(context, residentId, false);
    return this.repositories.assessments.listByResident(residentId);
  }

  async createCarePlan(context: AccessContext, input: Omit<CarePlan, 'id'>): Promise<CarePlan> {
    const resident = await this.getResident(context, input.residentId, false);
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
    await this.getResident(context, residentId, false);
    return this.repositories.carePlans.listByResident(residentId);
  }

  async createCareTask(context: AccessContext, input: Omit<CareTask, 'id'>): Promise<CareTask> {
    const resident = await this.getResident(context, input.residentId, false);
    const decision = requirePermission(context, { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id }, 'resident:write');
    assertAllowed(decision);
    const task = await this.repositories.careTasks.save({ id: this.createId(), ...input });
    await this.auditEntity(context, 'CareTask', task.id, task, { scope: 'resident', organizationId: task.organizationId, facilityId: task.facilityId, residentId: task.residentId });
    return task;
  }

  async listCareTasksByResident(context: AccessContext, residentId: UUID): Promise<CareTask[]> {
    await this.getResident(context, residentId, false);
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
    const resident = await this.getResident(context, input.residentId, false);
    const decision = requirePermission(context, { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id }, 'resident:write');
    assertAllowed(decision);
    const entry = await this.repositories.adlEntries.save({ id: this.createId(), recordedAt: this.clock().toISOString(), recordedBy: context.user.id, ...input });
    await this.auditEntity(context, 'AdlEntry', entry.id, entry, { scope: 'resident', organizationId: entry.organizationId, facilityId: entry.facilityId, residentId: entry.residentId });
    return entry;
  }

  async listAdlsByResident(context: AccessContext, residentId: UUID): Promise<AdlEntry[]> {
    await this.getResident(context, residentId, false);
    return this.repositories.adlEntries.listByResident(residentId);
  }

  async createServicePlan(context: AccessContext, input: Omit<ServicePlanRecord, 'id'>): Promise<ServicePlanRecord> {
    const resident = await this.getResident(context, input.residentId, false);
    const decision = requirePermission(context, { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id }, 'resident:write');
    assertAllowed(decision);
    const plan = await this.repositories.servicePlans.save({ id: this.createId(), ...input });
    await this.auditEntity(context, 'ServicePlan', plan.id, plan, { scope: 'resident', organizationId: plan.organizationId, facilityId: plan.facilityId, residentId: plan.residentId });
    return plan;
  }

  async listServicePlansByResident(context: AccessContext, residentId: UUID): Promise<ServicePlanRecord[]> {
    await this.getResident(context, residentId, false);
    return this.repositories.servicePlans.listByResident(residentId);
  }

  async createMedicationOrder(context: AccessContext, input: Omit<MedicationOrder, 'id'>): Promise<MedicationOrder> {
    const resident = await this.getResident(context, input.residentId, false);
    const decision = requirePermission(
      context,
      { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id },
      'medication:manage'
    );
    assertAllowed(decision);
    const order = await this.repositories.medicationOrders.save({ id: this.createId(), ...input });
    await this.auditEntity(context, 'MedicationOrder', order.id, order, {
      scope: 'resident',
      organizationId: order.organizationId,
      facilityId: order.facilityId,
      residentId: order.residentId
    });
    return order;
  }

  async listMedicationOrdersByResident(context: AccessContext, residentId: UUID): Promise<MedicationOrder[]> {
    const resident = await this.getResident(context, residentId, false);
    await this.auditPhiAccess(context, 'MedicationOrder', residentId, {
      scope: 'resident',
      organizationId: resident.organizationId,
      facilityId: resident.facilityId,
      residentId
    }, 'medication_access');
    return this.repositories.medicationOrders.listByResident(residentId);
  }

  async recordMedicationAdministration(
    context: AccessContext,
    input: Omit<MedicationAdministration, 'id' | 'administeredAt' | 'administeredBy'>
  ): Promise<MedicationAdministration> {
    const order = await this.repositories.medicationOrders.getById(input.medicationOrderId);
    if (!order) throw new Error('Medication order not found');
    validateMedicationAdministrationInput(order, input);
    const decision = requirePermission(
      context,
      { scope: 'resident', organizationId: order.organizationId, facilityId: order.facilityId, residentId: order.residentId },
      'medication:manage'
    );
    assertAllowed(decision);
    const administration = await this.repositories.medicationAdministrations.save({
      id: this.createId(),
      administeredAt: this.clock().toISOString(),
      administeredBy: context.user.id,
      ...input
    });
    await this.auditEntity(context, 'MedicationAdministration', administration.id, administration, {
      scope: 'resident',
      organizationId: administration.organizationId,
      facilityId: administration.facilityId,
      residentId: administration.residentId
    });
    return administration;
  }

  async listMedicationAdministrationsByResident(context: AccessContext, residentId: UUID): Promise<MedicationAdministration[]> {
    await this.getResident(context, residentId, false);
    return this.repositories.medicationAdministrations.listByResident(residentId);
  }

  async createIncident(context: AccessContext, input: Omit<Incident, 'id'>): Promise<Incident> {
    const resident = await this.getResident(context, input.residentId, false);
    const decision = requirePermission(
      context,
      { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id },
      'resident:write'
    );
    assertAllowed(decision);
    const incident = await this.repositories.incidents.save({ id: this.createId(), ...input });
    await this.auditEntity(context, 'Incident', incident.id, incident, {
      scope: 'resident',
      organizationId: incident.organizationId,
      facilityId: incident.facilityId,
      residentId: incident.residentId
    });
    return incident;
  }

  async listIncidentsByResident(context: AccessContext, residentId: UUID): Promise<Incident[]> {
    await this.getResident(context, residentId, false);
    return this.repositories.incidents.listByResident(residentId);
  }

  async listIncidentsByFacility(context: AccessContext, organizationId: UUID, facilityId: UUID): Promise<Incident[]> {
    const decision = requirePermission(context, { scope: 'facility', organizationId, facilityId }, 'resident:read');
    assertAllowed(decision);
    return this.repositories.incidents.listByFacility(organizationId, facilityId);
  }

  async updateIncident(context: AccessContext, incidentId: UUID, updates: Partial<Omit<Incident, 'id' | 'organizationId' | 'facilityId' | 'residentId'>>): Promise<Incident> {
    const existing = await this.repositories.incidents.getById(incidentId);
    if (!existing) throw new Error('Incident not found');
    const decision = requirePermission(
      context,
      { scope: 'resident', organizationId: existing.organizationId, facilityId: existing.facilityId, residentId: existing.residentId },
      'resident:write'
    );
    assertAllowed(decision);
    const saved = await this.repositories.incidents.save({ ...existing, ...updates, id: existing.id });
    await this.auditEntity(context, 'Incident', saved.id, saved, {
      scope: 'resident',
      organizationId: saved.organizationId,
      facilityId: saved.facilityId,
      residentId: saved.residentId
    }, existing);
    return saved;
  }

  async createComplianceIssue(context: AccessContext, input: Omit<ComplianceIssue, 'id'>): Promise<ComplianceIssue> {
    const decision = requirePermission(context, { scope: 'facility', organizationId: input.organizationId, facilityId: input.facilityId }, 'facility:manage');
    assertAllowed(decision);
    const issue = await this.repositories.complianceIssues.save({ id: this.createId(), ...input });
    await this.auditEntity(context, 'ComplianceIssue', issue.id, issue, {
      scope: issue.residentId ? 'resident' : 'facility',
      organizationId: issue.organizationId,
      facilityId: issue.facilityId,
      residentId: issue.residentId
    });
    return issue;
  }

  async listComplianceIssuesByFacility(context: AccessContext, organizationId: UUID, facilityId: UUID): Promise<ComplianceIssue[]> {
    const decision = requirePermission(context, { scope: 'facility', organizationId, facilityId }, 'facility:manage');
    assertAllowed(decision);
    return this.repositories.complianceIssues.listByFacility(organizationId, facilityId);
  }

  async createBillingCharge(context: AccessContext, input: Omit<BillingCharge, 'id'>): Promise<BillingCharge> {
    const resident = await this.getResident(context, input.residentId, false);
    const decision = requirePermission(context, { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id }, 'billing:manage');
    assertAllowed(decision);
    const charge = await this.repositories.billingCharges.save({ id: this.createId(), ...input });
    await this.auditEntity(context, 'BillingCharge', charge.id, charge, { scope: 'resident', organizationId: charge.organizationId, facilityId: charge.facilityId, residentId: charge.residentId });
    return charge;
  }

  async listBillingChargesByResident(context: AccessContext, residentId: UUID): Promise<BillingCharge[]> {
    await this.getResident(context, residentId, false);
    return this.repositories.billingCharges.listByResident(residentId);
  }

  async createInvoice(context: AccessContext, input: Omit<Invoice, 'id'>): Promise<Invoice> {
    const resident = await this.getResident(context, input.residentId, false);
    const decision = requirePermission(context, { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id }, 'billing:manage');
    assertAllowed(decision);
    const invoice = await this.repositories.invoices.save({ id: this.createId(), ...input });
    await this.auditEntity(context, 'Invoice', invoice.id, invoice, { scope: 'resident', organizationId: invoice.organizationId, facilityId: invoice.facilityId, residentId: invoice.residentId });
    return invoice;
  }

  async listInvoicesByResident(context: AccessContext, residentId: UUID): Promise<Invoice[]> {
    await this.getResident(context, residentId, false);
    return this.repositories.invoices.listByResident(residentId);
  }

  async recordPaymentTransaction(context: AccessContext, input: Omit<PaymentTransaction, 'id' | 'postedAt' | 'postedBy'>): Promise<PaymentTransaction> {
    const resident = await this.getResident(context, input.residentId, false);
    const decision = requirePermission(context, { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id }, 'billing:manage');
    assertAllowed(decision);
    const transaction = await this.repositories.paymentTransactions.save({ id: this.createId(), postedAt: this.clock().toISOString(), postedBy: context.user.id, ...input });
    await this.auditEntity(context, 'PaymentTransaction', transaction.id, transaction, { scope: 'resident', organizationId: transaction.organizationId, facilityId: transaction.facilityId, residentId: transaction.residentId });
    return transaction;
  }

  async listPaymentTransactionsByResident(context: AccessContext, residentId: UUID): Promise<PaymentTransaction[]> {
    await this.getResident(context, residentId, false);
    return this.repositories.paymentTransactions.listByResident(residentId);
  }

  async createOperationalRecord(
    context: AccessContext,
    input: Omit<OperationalRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<OperationalRecord> {
    await this.assertOperationalRecordAccess(context, input, 'write');

    const now = this.clock().toISOString();
    const record = await this.repositories.operationalRecords.save({
      id: this.createId(),
      createdAt: now,
      updatedAt: now,
      ...input
    });

    await this.auditOperationalRecord(context, record, null);
    return record;
  }

  async getOperationalRecord(context: AccessContext, recordId: UUID): Promise<OperationalRecord> {
    const record = await this.repositories.operationalRecords.getById(recordId);
    if (!record) throw new Error('Operational record not found');
    await this.assertOperationalRecordAccess(context, record, 'read');
    return record;
  }

  async listOperationalRecordsByScope(
    context: AccessContext,
    scope: { organizationId: UUID; facilityId?: UUID; residentId?: UUID; module?: OperationalRecord['module'] }
  ): Promise<OperationalRecord[]> {
    await this.assertOperationalRecordAccess(context, scope, 'read');
    return this.repositories.operationalRecords.listByScope(scope);
  }

  async updateOperationalRecord(
    context: AccessContext,
    recordId: UUID,
    updates: Partial<Omit<OperationalRecord, 'id' | 'organizationId' | 'facilityId' | 'residentId' | 'createdAt' | 'updatedAt'>>
  ): Promise<OperationalRecord> {
    const existing = await this.getOperationalRecord(context, recordId);
    await this.assertOperationalRecordAccess(context, existing, 'write');

    const updated = await this.repositories.operationalRecords.save({
      ...existing,
      ...updates,
      id: existing.id,
      organizationId: existing.organizationId,
      facilityId: existing.facilityId,
      residentId: existing.residentId,
      createdAt: existing.createdAt,
      updatedAt: this.clock().toISOString()
    });

    await this.auditOperationalRecord(context, updated, existing);
    return updated;
  }

  async createUser(
    context: AccessContext,
    input: Omit<User, 'id' | 'status'>
  ): Promise<User> {
    const decision = requirePermission(context, userManagementScope(input.organizationId), userManagementPermission(input.organizationId));
    assertAllowed(decision);
    assertUserAssignmentAllowed(context, input);

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
    assertUserUpdateAllowed(context, existing, updates);

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

  private async auditEntity(
    context: AccessContext,
    entityType: string,
    entityId: UUID,
    afterState: unknown,
    scope: { scope: 'resident' | 'facility'; organizationId: UUID; facilityId: UUID; residentId?: UUID },
    beforeState: unknown = null
  ) {
    await this.repositories.auditLogs.append(createAuditEvent({
      id: this.createId(),
      action: beforeState ? 'update' : 'create',
      actorUserId: context.user.id,
      actorRole: context.user.roleTier,
      entityType,
      entityId,
      scope,
      beforeState,
      afterState,
      now: this.clock()
    }));
  }

  private async auditJob(context: AccessContext, job: BackgroundJob, beforeState: BackgroundJob | null): Promise<void> {
    await this.repositories.auditLogs.append(createAuditEvent({
      id: this.createId(),
      action: beforeState ? 'update' : 'create',
      actorUserId: context.user.id,
      actorRole: context.user.roleTier,
      entityType: 'BackgroundJob',
      entityId: job.id,
      scope: {
        scope: job.residentId ? 'resident' : job.facilityId ? 'facility' : job.organizationId ? 'organization' : 'platform',
        organizationId: job.organizationId,
        facilityId: job.facilityId,
        residentId: job.residentId
      },
      beforeState,
      afterState: job,
      now: this.clock()
    }));
  }

  private async assertOperationalRecordAccess(
    context: AccessContext,
    scope: { organizationId: UUID; facilityId?: UUID; residentId?: UUID },
    mode: 'read' | 'write'
  ): Promise<void> {
    if (scope.residentId) {
      const resident = await this.getResident(context, scope.residentId, false);
      if (mode === 'write') {
        assertAllowed(
          requirePermission(
            context,
            { scope: 'resident', organizationId: resident.organizationId, facilityId: resident.facilityId, residentId: resident.id },
            'resident:write'
          )
        );
      }
      return;
    }

    if (scope.facilityId) {
      assertAllowed(
        requirePermission(
          context,
          { scope: 'facility', organizationId: scope.organizationId, facilityId: scope.facilityId },
          mode === 'read' ? 'report:read' : 'facility:manage'
        )
      );
      return;
    }

    assertAllowed(
      requirePermission(
        context,
        { scope: 'organization', organizationId: scope.organizationId },
        mode === 'read' ? 'report:read' : 'organization:manage'
      )
    );
  }

  private async auditOperationalRecord(
    context: AccessContext,
    record: OperationalRecord,
    beforeState: OperationalRecord | null
  ): Promise<void> {
    await this.repositories.auditLogs.append(createAuditEvent({
      id: this.createId(),
      action: beforeState ? 'update' : 'create',
      actorUserId: context.user.id,
      actorRole: context.user.roleTier,
      entityType: 'OperationalRecord',
      entityId: record.id,
      scope: {
        scope: record.residentId ? 'resident' : record.facilityId ? 'facility' : 'organization',
        organizationId: record.organizationId,
        facilityId: record.facilityId,
        residentId: record.residentId
      },
      beforeState,
      afterState: record,
      now: this.clock()
    }));
  }

  async auditPhiExport(context: AccessContext, input: { residentId: UUID; entityType: string; entityId: UUID }): Promise<void> {
    const resident = await this.getResident(context, input.residentId, false);
    await this.auditPhiAccess(context, input.entityType, input.entityId, {
      scope: 'resident',
      organizationId: resident.organizationId,
      facilityId: resident.facilityId,
      residentId: resident.id
    }, 'export');
  }

  async auditPhiPrint(context: AccessContext, input: { residentId: UUID; entityType: string; entityId: UUID }): Promise<void> {
    const resident = await this.getResident(context, input.residentId, false);
    await this.auditPhiAccess(context, input.entityType, input.entityId, {
      scope: 'resident',
      organizationId: resident.organizationId,
      facilityId: resident.facilityId,
      residentId: resident.id
    }, 'print');
  }

  private async auditPhiAccess(
    context: AccessContext,
    entityType: string,
    entityId: UUID,
    scope: { scope: 'resident'; organizationId: UUID; facilityId: UUID; residentId: UUID },
    accessType: 'read' | 'export' | 'print' | 'medication_access'
  ): Promise<void> {
    await this.repositories.auditLogs.append(createAuditEvent({
      id: this.createId(),
      action: accessType === 'export' ? 'export' : 'read',
      actorUserId: context.user.id,
      actorRole: context.user.roleTier,
      entityType,
      entityId,
      scope,
      beforeState: null,
      afterState: { accessType, phi: true },
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

function assertUserAssignmentAllowed(context: AccessContext, input: Pick<User, 'roleTier' | 'permissions' | 'organizationId'>): void {
  if (context.user.roleTier === 'T1') return;

  if (['T1', 'T2', 'T2_5'].includes(input.roleTier)) {
    throw new Error('Only T1 can assign administrator role tiers');
  }

  for (const permission of input.permissions) {
    if (!hasPermission(context, permission)) {
      throw new Error(`Cannot grant permission not held by actor: ${permission}`);
    }
  }
}

function assertUserUpdateAllowed(
  context: AccessContext,
  existing: User,
  updates: Partial<Omit<User, 'id'>>
): void {
  if (context.user.roleTier === 'T1') return;

  if (updates.organizationId !== undefined && updates.organizationId !== existing.organizationId) {
    throw new Error('Only T1 can move users across organizations');
  }

  if (updates.roleTier !== undefined && updates.roleTier !== existing.roleTier) {
    throw new Error('Only T1 can change role tiers');
  }

  if (updates.permissions !== undefined) {
    const actorPermissions = new Set([...rolePermissions(context.user.roleTier), ...context.user.permissions]);
    for (const permission of updates.permissions) {
      if (!actorPermissions.has(permission)) {
        throw new Error(`Cannot grant permission not held by actor: ${permission}`);
      }
    }
function validateMedicationAdministrationInput(
  order: MedicationOrder,
  input: Omit<MedicationAdministration, 'id' | 'administeredAt' | 'administeredBy'>
): void {
  if (input.residentId !== order.residentId || input.facilityId !== order.facilityId || input.organizationId !== order.organizationId) {
    throw new Error('Medication administration scope does not match medication order');
  }

  if (['refused', 'held', 'not_available'].includes(input.action) && !input.reason) {
    throw new Error('Medication administration reason is required');
  }

  if (order.status === 'prn' && input.action === 'given' && !input.prnEffectiveness) {
    throw new Error('PRN effectiveness is required');
  }

  if (input.barcodeScanned && !input.barcodeVerified) {
    throw new Error('Barcode verification is required');
  }

  if ((input.controlledSubstanceCount !== undefined || input.controlledSubstanceWitness) &&
    (input.controlledSubstanceCount === undefined || !input.controlledSubstanceWitness)) {
    throw new Error('Controlled substance witness and count are required');
  }
}
