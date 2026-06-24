import type { AuditEvent } from './audit';
import type { RegisteredFeature } from './feature-registry';
import type {
  AdlEntry,
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
  Organization,
  PaymentTransaction,
  PasswordResetRequest,
  Resident,
  ServicePlanRecord,
  User,
  UserCredential,
  UUID
} from './types';
import type { AuthSession, BackgroundJob, Facility, MfaChallenge, OperationalRecord, Organization, PasswordResetRequest, Resident, User, UserCredential, UUID } from './types';

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

export interface UserCredentialRepository {
  getByUserId(userId: UUID): Promise<UserCredential | null>;
  save(credential: UserCredential): Promise<UserCredential>;
}

export interface ResidentRepository {
  getById(id: UUID): Promise<Resident | null>;
  listByFacility(organizationId: UUID, facilityId: UUID): Promise<Resident[]>;
  save(resident: Resident): Promise<Resident>;
}

export interface BackgroundJobRepository {
  getById(id: UUID): Promise<BackgroundJob | null>;
  listQueued(limit: number): Promise<BackgroundJob[]>;
  listByScope(scope: { organizationId?: UUID; facilityId?: UUID; residentId?: UUID }): Promise<BackgroundJob[]>;
  save(job: BackgroundJob): Promise<BackgroundJob>;
}

export interface AssessmentRepository {
  getById(id: UUID): Promise<Assessment | null>;
  listByResident(residentId: UUID): Promise<Assessment[]>;
  save(assessment: Assessment): Promise<Assessment>;
}

export interface CarePlanRepository {
  getById(id: UUID): Promise<CarePlan | null>;
  listByResident(residentId: UUID): Promise<CarePlan[]>;
  save(carePlan: CarePlan): Promise<CarePlan>;
}

export interface CareTaskRepository {
  getById(id: UUID): Promise<CareTask | null>;
  listByResident(residentId: UUID): Promise<CareTask[]>;
  save(task: CareTask): Promise<CareTask>;
}

export interface AdlEntryRepository {
  listByResident(residentId: UUID): Promise<AdlEntry[]>;
  save(entry: AdlEntry): Promise<AdlEntry>;
}

export interface ServicePlanRepository {
  listByResident(residentId: UUID): Promise<ServicePlanRecord[]>;
  save(plan: ServicePlanRecord): Promise<ServicePlanRecord>;
}

export interface MedicationOrderRepository {
  getById(id: UUID): Promise<MedicationOrder | null>;
  listByResident(residentId: UUID): Promise<MedicationOrder[]>;
  save(order: MedicationOrder): Promise<MedicationOrder>;
}

export interface MedicationAdministrationRepository {
  listByResident(residentId: UUID): Promise<MedicationAdministration[]>;
  save(administration: MedicationAdministration): Promise<MedicationAdministration>;
}

export interface IncidentRepository {
  getById(id: UUID): Promise<Incident | null>;
  listByResident(residentId: UUID): Promise<Incident[]>;
  listByFacility(organizationId: UUID, facilityId: UUID): Promise<Incident[]>;
  save(incident: Incident): Promise<Incident>;
}

export interface ComplianceIssueRepository {
  listByFacility(organizationId: UUID, facilityId: UUID): Promise<ComplianceIssue[]>;
  save(issue: ComplianceIssue): Promise<ComplianceIssue>;
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
export interface OperationalRecordRepository {
  getById(id: UUID): Promise<OperationalRecord | null>;
  listByScope(scope: { organizationId: UUID; facilityId?: UUID; residentId?: UUID; module?: OperationalRecord['module'] }): Promise<OperationalRecord[]>;
  save(record: OperationalRecord): Promise<OperationalRecord>;
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
  userCredentials: UserCredentialRepository;
  residents: ResidentRepository;
  backgroundJobs: BackgroundJobRepository;
  assessments: AssessmentRepository;
  carePlans: CarePlanRepository;
  careTasks: CareTaskRepository;
  adlEntries: AdlEntryRepository;
  servicePlans: ServicePlanRepository;
  medicationOrders: MedicationOrderRepository;
  medicationAdministrations: MedicationAdministrationRepository;
  incidents: IncidentRepository;
  complianceIssues: ComplianceIssueRepository;
  billingCharges: BillingChargeRepository;
  invoices: InvoiceRepository;
  paymentTransactions: PaymentTransactionRepository;
  operationalRecords: OperationalRecordRepository;
  auditLogs: AuditLogRepository;
  featureRegistry: FeatureRegistryRepository;
  authSessions: AuthSessionRepository;
  mfaChallenges: MfaChallengeRepository;
  passwordResets: PasswordResetRepository;
};
