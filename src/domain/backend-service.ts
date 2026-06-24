import { createAuditEvent } from './audit';
import type { RegisteredFeature } from './feature-registry';
import type { BackendRepositories } from './repositories';
import { requirePermission } from './access-control';
import type { AccessContext, Facility, Organization, Resident, UUID } from './types';

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
}

function assertAllowed(decision: { allowed: boolean; reason: string }): void {
  if (!decision.allowed) {
    throw new Error(decision.reason);
  }
}
