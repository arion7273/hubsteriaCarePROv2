import type { RegisteredFeature } from '../../domain';
import type { AuditEvent } from '../../domain/audit';
import type { AuthSession, BackgroundJob, Facility, MfaChallenge, Organization, PasswordResetRequest, Permission, Resident, RoleTier, User } from '../../domain/types';
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

export function mapResidentRow(row: PostgresRow): Resident {
  const status = ['discharged', 'inactive'].includes(String(row.status)) ? String(row.status) : 'active';
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    preferredName: row.preferred_name ? String(row.preferred_name) : undefined,
    room: row.room ? String(row.room) : undefined,
    levelOfCare: row.level_of_care ? String(row.level_of_care) : undefined,
    status: status as Resident['status']
  };
}

export function mapBackgroundJobRow(row: PostgresRow): BackgroundJob {
  return {
    id: String(row.id),
    organizationId: row.organization_id ? String(row.organization_id) : undefined,
    facilityId: row.facility_id ? String(row.facility_id) : undefined,
    residentId: row.resident_id ? String(row.resident_id) : undefined,
    type: String(row.type) as BackgroundJob['type'],
    status: String(row.status) as BackgroundJob['status'],
    priority: String(row.priority) as BackgroundJob['priority'],
    payload: typeof row.payload === 'object' && row.payload !== null ? (row.payload as Record<string, unknown>) : {},
    attempts: Number(row.attempts),
    maxAttempts: Number(row.max_attempts),
    availableAt: String(row.available_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    lastError: row.last_error ? String(row.last_error) : undefined
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

export function mapAuthSessionRow(row: PostgresRow): AuthSession {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    createdAt: toIsoString(row.created_at),
    expiresAt: toIsoString(row.expires_at),
    mfaVerified: Boolean(row.mfa_verified),
    revokedAt: row.revoked_at ? toIsoString(row.revoked_at) : undefined
  };
}

export function mapMfaChallengeRow(row: PostgresRow): MfaChallenge {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    createdAt: toIsoString(row.created_at),
    expiresAt: toIsoString(row.expires_at),
    verifiedAt: row.verified_at ? toIsoString(row.verified_at) : undefined
  };
}

export function mapPasswordResetRequestRow(row: PostgresRow): PasswordResetRequest {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    createdAt: toIsoString(row.created_at),
    expiresAt: toIsoString(row.expires_at),
    usedAt: row.used_at ? toIsoString(row.used_at) : undefined
  };
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
