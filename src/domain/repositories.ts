import type { AuditEvent } from './audit';
import type { RegisteredFeature } from './feature-registry';
import type { AuthSession, BillingCharge, Facility, Invoice, MfaChallenge, Organization, PaymentTransaction, PasswordResetRequest, Resident, User, UUID } from './types';

export interface OrganizationRepository {
  getById(id: UUID): Promise<Organization | null>;
  list(): Promise<Organization[]>;
  save(organization: Organization): Promise<Organization>;
}

export interface FacilityRepository {
  getById(id: UUID): Promise<Facility | null>;
  listByOrganization(organizationId: UUID): Promise<Facility[]>;
  save(facility: Facility): Promise<Facility>;
}

export interface UserRepository {
  getById(id: UUID): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  listByOrganization(organizationId: UUID): Promise<User[]>;
  save(user: User): Promise<User>;
}

export interface ResidentRepository {
  getById(id: UUID): Promise<Resident | null>;
  listByFacility(organizationId: UUID, facilityId: UUID): Promise<Resident[]>;
  save(resident: Resident): Promise<Resident>;
}

export interface BillingChargeRepository {
  listByResident(residentId: UUID): Promise<BillingCharge[]>;
  save(charge: BillingCharge): Promise<BillingCharge>;
}

export interface InvoiceRepository {
  getById(id: UUID): Promise<Invoice | null>;
  listByResident(residentId: UUID): Promise<Invoice[]>;
  save(invoice: Invoice): Promise<Invoice>;
}

export interface PaymentTransactionRepository {
  listByResident(residentId: UUID): Promise<PaymentTransaction[]>;
  save(transaction: PaymentTransaction): Promise<PaymentTransaction>;
}

export interface AuditLogRepository {
  append(event: AuditEvent): Promise<void>;
  listByEntity(entityType: string, entityId: UUID): Promise<AuditEvent[]>;
}

export interface FeatureRegistryRepository {
  register(feature: RegisteredFeature): Promise<RegisteredFeature>;
  list(): Promise<RegisteredFeature[]>;
}

export interface AuthSessionRepository {
  getById(id: UUID): Promise<AuthSession | null>;
  save(session: AuthSession): Promise<AuthSession>;
  revoke(id: UUID, revokedAt: string): Promise<AuthSession | null>;
}

export interface MfaChallengeRepository {
  getById(id: UUID): Promise<MfaChallenge | null>;
  save(challenge: MfaChallenge): Promise<MfaChallenge>;
}

export interface PasswordResetRepository {
  getById(id: UUID): Promise<PasswordResetRequest | null>;
  save(request: PasswordResetRequest): Promise<PasswordResetRequest>;
}

export type BackendRepositories = {
  organizations: OrganizationRepository;
  facilities: FacilityRepository;
  users: UserRepository;
  residents: ResidentRepository;
  billingCharges: BillingChargeRepository;
  invoices: InvoiceRepository;
  paymentTransactions: PaymentTransactionRepository;
  auditLogs: AuditLogRepository;
  featureRegistry: FeatureRegistryRepository;
  authSessions: AuthSessionRepository;
  mfaChallenges: MfaChallengeRepository;
  passwordResets: PasswordResetRepository;
};
