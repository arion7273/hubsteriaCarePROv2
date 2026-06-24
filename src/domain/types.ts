export type UUID = string;

export type TenantScope = 'platform' | 'organization' | 'facility' | 'resident';

export type RoleTier = 'T1' | 'T2' | 'T2_5' | 'T3' | 'EMPLOYEE' | 'FAMILY' | 'RESIDENT';

export type Permission =
  | 'platform:manage'
  | 'organization:manage'
  | 'facility:manage'
  | 'resident:read'
  | 'resident:write'
  | 'medication:manage'
  | 'assessment:manage'
  | 'billing:manage'
  | 'communication:manage'
  | 'support:manage'
  | 'report:read';

export type Organization = {
  id: UUID;
  name: string;
  status: 'active' | 'suspended';
};

export type Facility = {
  id: UUID;
  organizationId: UUID;
  name: string;
  status: 'active' | 'suspended';
};

export type Resident = {
  id: UUID;
  organizationId: UUID;
  facilityId: UUID;
  firstName: string;
  lastName: string;
  preferredName?: string;
  room?: string;
  levelOfCare?: string;
  status: 'active' | 'discharged' | 'inactive';
};

export type BackgroundJob = {
  id: UUID;
  organizationId?: UUID;
  facilityId?: UUID;
  residentId?: UUID;
  type: 'notification' | 'print' | 'digitalrx_sync' | 'ai_generation' | 'workflow_action' | 'audit_export';
  status: 'queued' | 'processing' | 'succeeded' | 'failed' | 'dead_letter';
  priority: 'low' | 'normal' | 'high' | 'critical';
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  availableAt: string;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
};

export type NotificationJobInput = {
  organizationId?: UUID;
  facilityId?: UUID;
  residentId?: UUID;
  channel: 'in_app' | 'email' | 'sms' | 'push';
  template: string;
  recipient: string;
  payload: Record<string, unknown>;
  priority?: BackgroundJob['priority'];
};

export type PrintJobInput = {
  organizationId?: UUID;
  facilityId?: UUID;
  residentId?: UUID;
  template: string;
  format: 'pdf' | 'csv' | 'excel';
  recordIds: UUID[];
  priority?: BackgroundJob['priority'];
};

export type DigitalRxSyncJobInput = {
  organizationId: UUID;
  event: 'order_created' | 'order_updated' | 'order_discontinued' | 'refill_updated';
  payload: Record<string, unknown>;
  priority?: BackgroundJob['priority'];
};

export type AiGenerationJobInput = {
  organizationId?: UUID;
  facilityId?: UUID;
  residentId?: UUID;
  task: 'resident_summary' | 'compliance_insight' | 'family_update_draft' | 'knowledge_answer';
  payload: Record<string, unknown>;
  priority?: BackgroundJob['priority'];
};

export type WorkflowActionJobInput = {
  organizationId?: UUID;
  facilityId?: UUID;
  residentId?: UUID;
  trigger: string;
  action: string;
  payload: Record<string, unknown>;
  priority?: BackgroundJob['priority'];
};

export type Assessment = {
  id: UUID;
  organizationId: UUID;
  facilityId: UUID;
  residentId: UUID;
  type: string;
  status: 'due' | 'in_progress' | 'review' | 'complete';
  score?: number;
  answers: Record<string, unknown>;
};

export type CarePlan = {
  id: UUID;
  organizationId: UUID;
  facilityId: UUID;
  residentId: UUID;
  goal: string;
  interventions: string[];
  outcome: string;
  reviewDate: string;
  assignedStaff: string;
  status: 'active' | 'resolved' | 'inactive';
};

export type CareTask = {
export type MedicationOrder = {
  id: UUID;
  organizationId: UUID;
  facilityId: UUID;
  residentId: UUID;
  title: string;
  taskType: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'custom_recurring';
  dueAt: string;
  assignedStaff: string;
  status: 'due' | 'overdue' | 'complete' | 'missed' | 'unassigned';
};

export type AdlEntry = {
  id: UUID;
  organizationId: UUID;
  facilityId: UUID;
  residentId: UUID;
  category: string;
  outcome: string;
  note?: string;
  recordedAt: string;
  recordedBy: UUID;
};

export type ServicePlanRecord = {
  medication: string;
  dosage: string;
  route: string;
  schedule: string;
  status: 'active' | 'future' | 'prn' | 'discontinued' | 'hold';
  instructions?: string;
};

export type MedicationAdministration = {
  id: UUID;
  organizationId: UUID;
  facilityId: UUID;
  residentId: UUID;
  service: string;
  schedule: string;
  assignedStaff: string;
  exceptions?: string;
  status: 'active' | 'inactive';
  medicationOrderId: UUID;
  action: 'given' | 'refused' | 'held' | 'resident_absent' | 'not_available';
  reason?: string;
  outcome?: string;
  administeredAt: string;
  administeredBy: UUID;
};

export type User = {
  id: UUID;
  email: string;
  roleTier: RoleTier;
  organizationId?: UUID;
  facilityIds: UUID[];
  permissions: Permission[];
  status: 'active' | 'inactive';
};

export type UserCredential = {
  userId: UUID;
  passwordHash: string;
  updatedAt: string;
};

export type AccessContext = {
  user: User;
  activeOrganizationId?: UUID;
  activeFacilityId?: UUID;
};

export type ResourceScope = {
  scope: TenantScope;
  organizationId?: UUID;
  facilityId?: UUID;
  residentId?: UUID;
};

export type AccessDecision = {
  allowed: boolean;
  reason: string;
};

export type AuthSession = {
  id: UUID;
  userId: UUID;
  createdAt: string;
  expiresAt: string;
  mfaVerified: boolean;
  revokedAt?: string;
};

export type MfaChallenge = {
  id: UUID;
  userId: UUID;
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
};

export type PasswordResetRequest = {
  id: UUID;
  userId: UUID;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
};

export const masterAdminBootstrap = {
  email: 'b094650@gmail.com',
  credentialStorage: 'managed-secret',
  plainTextPasswordStored: false
} as const;
