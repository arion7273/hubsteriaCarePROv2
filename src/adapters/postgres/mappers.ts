import type { RegisteredFeature } from '../../domain';
import type { AuditEvent } from '../../domain/audit';
import type { Facility, Organization, Permission, RoleTier, User } from '../../domain/types';
import type { PostgresRow } from './types';

export function mapOrganizationRow(row: PostgresRow): Organization {
  return {
    id: String(row.id),
    name: String(row.name),
    status: row.status === 'suspended' ? 'suspended' : 'active'
  };
}

export function mapFacilityRow(row: PostgresRow): Facility {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    name: String(row.name),
    status: row.status === 'suspended' ? 'suspended' : 'active'
  };
}

export function mapUserRow(row: PostgresRow): User {
  return {
    id: String(row.id),
    email: String(row.email),
    roleTier: String(row.role_tier) as RoleTier,
    organizationId: row.organization_id ? String(row.organization_id) : undefined,
    facilityIds: toStringArray(row.facility_ids),
    permissions: toStringArray(row.permissions) as Permission[],
    status: row.status === 'inactive' ? 'inactive' : 'active'
  };
}

export function mapFeatureRow(row: PostgresRow): RegisteredFeature {
  return {
    featureName: String(row.feature_name),
    module: String(row.module),
    status: row.status === 'planned' || row.status === 'gated' ? row.status : 'registered',
    dependencies: toStringArray(row.dependencies),
    version: String(row.version)
  };
}

export function mapAuditRow(row: PostgresRow): AuditEvent {
  return Object.freeze({
    id: String(row.id),
    action: String(row.action) as AuditEvent['action'],
    actorUserId: String(row.actor_user_id),
    actorRole: String(row.actor_role),
    timestamp: toIsoString(row.created_at),
    entityType: String(row.entity_type),
    entityId: String(row.entity_id),
    organizationId: row.organization_id ? String(row.organization_id) : undefined,
    facilityId: row.facility_id ? String(row.facility_id) : undefined,
    residentId: row.resident_id ? String(row.resident_id) : undefined,
    beforeState: row.before_state,
    afterState: row.after_state
  });
}

function toStringArray(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(String);
  }

  return [String(value)];
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}
