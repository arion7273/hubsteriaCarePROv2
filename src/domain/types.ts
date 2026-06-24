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

export type CareTask = {
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
  id: UUID;
  organizationId: UUID;
  facilityId: UUID;
  residentId: UUID;
  service: string;
  schedule: string;
  assignedStaff: string;
  exceptions?: string;
  status: 'active' | 'inactive';
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
