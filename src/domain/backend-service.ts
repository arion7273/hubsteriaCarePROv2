import { createAuditEvent } from './audit';
import type { RegisteredFeature } from './feature-registry';
import type { BackendRepositories } from './repositories';
import { requirePermission } from './access-control';
import type { AccessContext, Facility, Organization, UUID } from './types';

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
}

function assertAllowed(decision: { allowed: boolean; reason: string }): void {
  if (!decision.allowed) {
    throw new Error(decision.reason);
  }
}
