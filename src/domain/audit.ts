import type { ResourceScope, UUID } from './types';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'suspend'
  | 'activate'
  | 'invite'
  | 'transfer'
  | 'read'
  | 'export'
  | 'login'
  | 'logout';

export type AuditEvent<TBefore = unknown, TAfter = unknown> = Readonly<{
  id: UUID;
  action: AuditAction;
  actorUserId: UUID;
  actorRole: string;
  timestamp: string;
  entityType: string;
  entityId: UUID;
  organizationId?: UUID;
  facilityId?: UUID;
  residentId?: UUID;
  beforeState: TBefore;
  afterState: TAfter;
}>;

export function createAuditEvent<TBefore, TAfter>(input: {
  id: UUID;
  action: AuditAction;
  actorUserId: UUID;
  actorRole: string;
  entityType: string;
  entityId: UUID;
  scope: ResourceScope;
  beforeState: TBefore;
  afterState: TAfter;
  now?: Date;
}): AuditEvent<TBefore, TAfter> {
  return Object.freeze({
    id: input.id,
    action: input.action,
    actorUserId: input.actorUserId,
    actorRole: input.actorRole,
    timestamp: (input.now ?? new Date()).toISOString(),
    entityType: input.entityType,
    entityId: input.entityId,
    organizationId: input.scope.organizationId,
    facilityId: input.scope.facilityId,
    residentId: input.scope.residentId,
    beforeState: input.beforeState,
    afterState: input.afterState
  });
}
