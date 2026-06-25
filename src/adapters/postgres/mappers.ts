import type { RegisteredFeature } from '../../domain';
import type { AuditEvent } from '../../domain/audit';
import type {
  Assessment,
  AuthSession,
  BackgroundJob,
  BillingCharge,
  CarePlan,
  CareTask,
  ComplianceIssue,
  Facility,
  Incident,
  Invoice,
  MedicationAdministration,
  MedicationOrder,
  MfaChallenge,
  OperationalRecord,
  Organization,
  PaymentTransaction,
  PasswordResetRequest,
  Permission,
  Resident,
  RoleTier,
  ServicePlanRecord,
  User,
  UserCredential
} from '../../domain/types';
import type { AdlEntry } from '../../domain/types';
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

export function mapAssessmentRow(row: PostgresRow): Assessment {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    residentId: String(row.resident_id),
    type: String(row.type),
    status: String(row.status) as Assessment['status'],
    score: row.score === null || row.score === undefined ? undefined : Number(row.score),
    answers: isRecord(row.answers) ? row.answers : {}
  };
}

export function mapCarePlanRow(row: PostgresRow): CarePlan {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    residentId: String(row.resident_id),
    goal: String(row.goal),
    interventions: toStringArray(row.interventions),
    outcome: String(row.outcome),
    reviewDate: String(row.review_date),
    assignedStaff: String(row.assigned_staff),
    status: String(row.status) as CarePlan['status']
  };
}

export function mapCareTaskRow(row: PostgresRow): CareTask {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    residentId: String(row.resident_id),
    title: String(row.title),
    taskType: String(row.task_type) as CareTask['taskType'],
    dueAt: String(row.due_at),
    assignedStaff: String(row.assigned_staff),
    status: String(row.status) as CareTask['status']
  };
}

export function mapAdlEntryRow(row: PostgresRow): AdlEntry {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    residentId: String(row.resident_id),
    category: String(row.category),
    outcome: String(row.outcome),
    note: row.note ? String(row.note) : undefined,
    recordedAt: String(row.recorded_at),
    recordedBy: String(row.recorded_by)
  };
}

export function mapServicePlanRow(row: PostgresRow): ServicePlanRecord {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    residentId: String(row.resident_id),
    service: String(row.service),
    schedule: String(row.schedule),
    assignedStaff: String(row.assigned_staff),
    exceptions: row.exceptions ? String(row.exceptions) : undefined,
    status: String(row.status) as ServicePlanRecord['status']
  };
}

export function mapMedicationOrderRow(row: PostgresRow): MedicationOrder {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    residentId: String(row.resident_id),
    medication: String(row.medication),
    dosage: String(row.dosage),
    route: String(row.route),
    schedule: String(row.schedule),
    status: String(row.status) as MedicationOrder['status'],
    instructions: row.instructions ? String(row.instructions) : undefined
  };
}

export function mapMedicationAdministrationRow(row: PostgresRow): MedicationAdministration {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    residentId: String(row.resident_id),
    medicationOrderId: String(row.medication_order_id),
    action: String(row.action) as MedicationAdministration['action'],
    reason: row.reason ? String(row.reason) : undefined,
    outcome: row.outcome ? String(row.outcome) : undefined,
    prnEffectiveness: row.prn_effectiveness ? String(row.prn_effectiveness) : undefined,
    barcodeScanned: row.barcode_scanned ? String(row.barcode_scanned) : undefined,
    barcodeVerified: Boolean(row.barcode_verified),
    controlledSubstanceWitness: row.controlled_substance_witness ? String(row.controlled_substance_witness) : undefined,
    controlledSubstanceCount: row.controlled_substance_count === null || row.controlled_substance_count === undefined ? undefined : Number(row.controlled_substance_count),
    administeredAt: String(row.administered_at),
    administeredBy: String(row.administered_by)
  };
}

export function mapIncidentRow(row: PostgresRow): Incident {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    residentId: String(row.resident_id),
    type: String(row.type) as Incident['type'],
    severity: String(row.severity) as Incident['severity'],
    status: String(row.status) as Incident['status'],
    summary: String(row.summary),
    investigation: row.investigation ? String(row.investigation) : undefined,
    rootCause: row.root_cause ? String(row.root_cause) : undefined,
    correctiveAction: row.corrective_action ? String(row.corrective_action) : undefined,
    resolution: row.resolution ? String(row.resolution) : undefined,
    occurredAt: String(row.occurred_at)
  };
}

export function mapComplianceIssueRow(row: PostgresRow): ComplianceIssue {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: String(row.facility_id),
    residentId: row.resident_id ? String(row.resident_id) : undefined,
    issue: String(row.issue),
    severity: String(row.severity) as ComplianceIssue['severity'],
    status: String(row.status) as ComplianceIssue['status'],
    resolutionLink: String(row.resolution_link)
  };
}

export function mapBillingChargeRow(row: PostgresRow): BillingCharge {
  return {
    id: String(row.id), organizationId: String(row.organization_id), facilityId: String(row.facility_id), residentId: String(row.resident_id),
    type: String(row.type) as BillingCharge['type'], description: String(row.description), amountCents: Number(row.amount_cents),
    status: String(row.status) as BillingCharge['status']
  };
}

export function mapInvoiceRow(row: PostgresRow): Invoice {
  return {
    id: String(row.id), organizationId: String(row.organization_id), facilityId: String(row.facility_id), residentId: String(row.resident_id),
    invoiceNumber: String(row.invoice_number), balanceCents: Number(row.balance_cents), dueDate: String(row.due_date),
    status: String(row.status) as Invoice['status']
  };
}

export function mapPaymentTransactionRow(row: PostgresRow): PaymentTransaction {
  return {
    id: String(row.id), organizationId: String(row.organization_id), facilityId: String(row.facility_id), residentId: String(row.resident_id),
    invoiceId: row.invoice_id ? String(row.invoice_id) : undefined, type: String(row.type) as PaymentTransaction['type'],
    amountCents: Number(row.amount_cents), method: String(row.method), postedAt: String(row.posted_at), postedBy: String(row.posted_by)
  };
}

export function mapOperationalRecordRow(row: PostgresRow): OperationalRecord {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    facilityId: row.facility_id ? String(row.facility_id) : undefined,
    residentId: row.resident_id ? String(row.resident_id) : undefined,
    module: String(row.module) as OperationalRecord['module'],
    recordType: String(row.record_type),
    status: String(row.status) as OperationalRecord['status'],
    title: String(row.title),
    payload: typeof row.payload === 'object' && row.payload !== null ? (row.payload as Record<string, unknown>) : {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
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

export function mapUserCredentialRow(row: PostgresRow): UserCredential {
  return {
    userId: String(row.user_id),
    passwordHash: String(row.password_hash),
    updatedAt: toIsoString(row.updated_at)
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
