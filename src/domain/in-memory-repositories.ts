import type { AuditEvent } from './audit';
import { assertFeatureRegistration, type RegisteredFeature } from './feature-registry';
import type {
  AdlEntryRepository,
  AuditLogRepository,
  AssessmentRepository,
  BackgroundJobRepository,
  BillingChargeRepository,
  AuthSessionRepository,
  BackendRepositories,
  CarePlanRepository,
  CareTaskRepository,
  MedicationAdministrationRepository,
  MedicationOrderRepository,
  ComplianceIssueRepository,
  FacilityRepository,
  FeatureRegistryRepository,
  IncidentRepository,
  InvoiceRepository,
  MfaChallengeRepository,
  OperationalRecordRepository,
  OrganizationRepository,
  PasswordResetRepository,
  PaymentTransactionRepository,
  ResidentRepository,
  ServicePlanRepository,
  UserCredentialRepository,
  UserRepository
} from './repositories';
import type {
  Assessment,
  AdlEntry,
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

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly organizations = new Map<UUID, Organization>();

  async getById(id: UUID): Promise<Organization | null> {
    return this.organizations.get(id) ?? null;
  }

  async list(): Promise<Organization[]> {
    return [...this.organizations.values()];
  }

  async save(organization: Organization): Promise<Organization> {
    this.organizations.set(organization.id, organization);
    return organization;
  }
}

export class InMemoryFacilityRepository implements FacilityRepository {
  private readonly facilities = new Map<UUID, Facility>();

  async getById(id: UUID): Promise<Facility | null> {
    return this.facilities.get(id) ?? null;
  }

  async listByOrganization(organizationId: UUID): Promise<Facility[]> {
    return [...this.facilities.values()].filter((facility) => facility.organizationId === organizationId);
  }

  async save(facility: Facility): Promise<Facility> {
    this.facilities.set(facility.id, facility);
    return facility;
  }
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<UUID, User>();

  async getById(id: UUID): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async getByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async listByOrganization(organizationId: UUID): Promise<User[]> {
    return [...this.users.values()].filter((user) => user.organizationId === organizationId);
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}

export class InMemoryUserCredentialRepository implements UserCredentialRepository {
  private readonly credentials = new Map<UUID, UserCredential>();

  async getByUserId(userId: UUID): Promise<UserCredential | null> {
    return this.credentials.get(userId) ?? null;
  }

  async save(credential: UserCredential): Promise<UserCredential> {
    this.credentials.set(credential.userId, credential);
    return credential;
  }
}

export class InMemoryResidentRepository implements ResidentRepository {
  private readonly residents = new Map<UUID, Resident>();

  async getById(id: UUID): Promise<Resident | null> {
    return this.residents.get(id) ?? null;
  }

  async listByFacility(organizationId: UUID, facilityId: UUID): Promise<Resident[]> {
    return [...this.residents.values()].filter(
      (resident) => resident.organizationId === organizationId && resident.facilityId === facilityId
    );
  }

  async save(resident: Resident): Promise<Resident> {
    this.residents.set(resident.id, resident);
    return resident;
  }
}

export class InMemoryBackgroundJobRepository implements BackgroundJobRepository {
  private readonly jobs = new Map<UUID, BackgroundJob>();

  async getById(id: UUID): Promise<BackgroundJob | null> {
    return this.jobs.get(id) ?? null;
  }

  async listQueued(limit: number): Promise<BackgroundJob[]> {
    return [...this.jobs.values()]
      .filter((job) => job.status === 'queued')
      .sort((a, b) => priorityValue(b.priority) - priorityValue(a.priority) || a.availableAt.localeCompare(b.availableAt))
      .slice(0, limit);
  }

  async listByScope(scope: { organizationId?: UUID; facilityId?: UUID; residentId?: UUID }): Promise<BackgroundJob[]> {
    return [...this.jobs.values()].filter(
      (job) =>
        (!scope.organizationId || job.organizationId === scope.organizationId) &&
        (!scope.facilityId || job.facilityId === scope.facilityId) &&
        (!scope.residentId || job.residentId === scope.residentId)
    );
  }

  async save(job: BackgroundJob): Promise<BackgroundJob> {
    this.jobs.set(job.id, job);
    return job;
  }
}

function priorityValue(priority: BackgroundJob['priority']): number {
  return { low: 0, normal: 1, high: 2, critical: 3 }[priority];
}

export class InMemoryAssessmentRepository implements AssessmentRepository {
  private readonly assessments = new Map<UUID, Assessment>();

  async getById(id: UUID): Promise<Assessment | null> {
    return this.assessments.get(id) ?? null;
  }

  async listByResident(residentId: UUID): Promise<Assessment[]> {
    return [...this.assessments.values()].filter((assessment) => assessment.residentId === residentId);
  }

  async save(assessment: Assessment): Promise<Assessment> {
    this.assessments.set(assessment.id, assessment);
    return assessment;
  }
}

export class InMemoryCarePlanRepository implements CarePlanRepository {
  private readonly carePlans = new Map<UUID, CarePlan>();

  async getById(id: UUID): Promise<CarePlan | null> {
    return this.carePlans.get(id) ?? null;
  }

  async listByResident(residentId: UUID): Promise<CarePlan[]> {
    return [...this.carePlans.values()].filter((carePlan) => carePlan.residentId === residentId);
  }

  async save(carePlan: CarePlan): Promise<CarePlan> {
    this.carePlans.set(carePlan.id, carePlan);
    return carePlan;
  }
}

export class InMemoryCareTaskRepository implements CareTaskRepository {
  private readonly tasks = new Map<UUID, CareTask>();
  async getById(id: UUID): Promise<CareTask | null> { return this.tasks.get(id) ?? null; }
  async listByResident(residentId: UUID): Promise<CareTask[]> {
    return [...this.tasks.values()].filter((task) => task.residentId === residentId);
  }
  async save(task: CareTask): Promise<CareTask> {
    this.tasks.set(task.id, task);
    return task;
  }
}

export class InMemoryAdlEntryRepository implements AdlEntryRepository {
  private readonly entries = new Map<UUID, AdlEntry>();
  async listByResident(residentId: UUID): Promise<AdlEntry[]> {
    return [...this.entries.values()].filter((entry) => entry.residentId === residentId);
  }
  async save(entry: AdlEntry): Promise<AdlEntry> {
    this.entries.set(entry.id, entry);
    return entry;
  }
}

export class InMemoryServicePlanRepository implements ServicePlanRepository {
  private readonly plans = new Map<UUID, ServicePlanRecord>();
  async listByResident(residentId: UUID): Promise<ServicePlanRecord[]> {
    return [...this.plans.values()].filter((plan) => plan.residentId === residentId);
  }
  async save(plan: ServicePlanRecord): Promise<ServicePlanRecord> {
    this.plans.set(plan.id, plan);
    return plan;
  }
}

export class InMemoryMedicationOrderRepository implements MedicationOrderRepository {
  private readonly orders = new Map<UUID, MedicationOrder>();
  async getById(id: UUID): Promise<MedicationOrder | null> { return this.orders.get(id) ?? null; }
  async listByResident(residentId: UUID): Promise<MedicationOrder[]> {
    return [...this.orders.values()].filter((order) => order.residentId === residentId);
  }
  async save(order: MedicationOrder): Promise<MedicationOrder> {
    this.orders.set(order.id, order);
    return order;
  }
}

export class InMemoryMedicationAdministrationRepository implements MedicationAdministrationRepository {
  private readonly administrations = new Map<UUID, MedicationAdministration>();
  async listByResident(residentId: UUID): Promise<MedicationAdministration[]> {
    return [...this.administrations.values()].filter((administration) => administration.residentId === residentId);
  }
  async save(administration: MedicationAdministration): Promise<MedicationAdministration> {
    this.administrations.set(administration.id, administration);
    return administration;
  }
}

export class InMemoryIncidentRepository implements IncidentRepository {
  private readonly incidents = new Map<UUID, Incident>();
  async getById(id: UUID): Promise<Incident | null> { return this.incidents.get(id) ?? null; }
  async listByResident(residentId: UUID): Promise<Incident[]> {
    return [...this.incidents.values()].filter((incident) => incident.residentId === residentId);
  }
  async listByFacility(organizationId: UUID, facilityId: UUID): Promise<Incident[]> {
    return [...this.incidents.values()].filter((incident) => incident.organizationId === organizationId && incident.facilityId === facilityId);
  }
  async save(incident: Incident): Promise<Incident> {
    this.incidents.set(incident.id, incident);
    return incident;
  }
}

export class InMemoryComplianceIssueRepository implements ComplianceIssueRepository {
  private readonly issues = new Map<UUID, ComplianceIssue>();
  async listByFacility(organizationId: UUID, facilityId: UUID): Promise<ComplianceIssue[]> {
    return [...this.issues.values()].filter((issue) => issue.organizationId === organizationId && issue.facilityId === facilityId);
  }
  async save(issue: ComplianceIssue): Promise<ComplianceIssue> {
    this.issues.set(issue.id, issue);
    return issue;
  }
}

export class InMemoryBillingChargeRepository implements BillingChargeRepository {
  private readonly charges = new Map<UUID, BillingCharge>();
  async listByResident(residentId: UUID): Promise<BillingCharge[]> {
    return [...this.charges.values()].filter((charge) => charge.residentId === residentId);
  }
  async save(charge: BillingCharge): Promise<BillingCharge> {
    this.charges.set(charge.id, charge);
    return charge;
  }
}

export class InMemoryInvoiceRepository implements InvoiceRepository {
  private readonly invoices = new Map<UUID, Invoice>();
  async getById(id: UUID): Promise<Invoice | null> { return this.invoices.get(id) ?? null; }
  async listByResident(residentId: UUID): Promise<Invoice[]> {
    return [...this.invoices.values()].filter((invoice) => invoice.residentId === residentId);
  }
  async save(invoice: Invoice): Promise<Invoice> {
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }
}

export class InMemoryPaymentTransactionRepository implements PaymentTransactionRepository {
  private readonly transactions = new Map<UUID, PaymentTransaction>();
  async listByResident(residentId: UUID): Promise<PaymentTransaction[]> {
    return [...this.transactions.values()].filter((transaction) => transaction.residentId === residentId);
  }
  async save(transaction: PaymentTransaction): Promise<PaymentTransaction> {
    this.transactions.set(transaction.id, transaction);
    return transaction;
export class InMemoryOperationalRecordRepository implements OperationalRecordRepository {
  private readonly records = new Map<UUID, OperationalRecord>();

  async getById(id: UUID): Promise<OperationalRecord | null> {
    return this.records.get(id) ?? null;
  }

  async listByScope(scope: { organizationId: UUID; facilityId?: UUID; residentId?: UUID; module?: OperationalRecord['module'] }): Promise<OperationalRecord[]> {
    return [...this.records.values()]
      .filter(
        (record) =>
          record.organizationId === scope.organizationId &&
          (!scope.facilityId || record.facilityId === scope.facilityId) &&
          (!scope.residentId || record.residentId === scope.residentId) &&
          (!scope.module || record.module === scope.module)
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async save(record: OperationalRecord): Promise<OperationalRecord> {
    this.records.set(record.id, record);
    return record;
  }
}

export class InMemoryAuditLogRepository implements AuditLogRepository {
  private readonly events: AuditEvent[] = [];

  async append(event: AuditEvent): Promise<void> {
    this.events.push(event);
  }

  async listByEntity(entityType: string, entityId: UUID): Promise<AuditEvent[]> {
    return this.events.filter((event) => event.entityType === entityType && event.entityId === entityId);
  }

  async listAll(): Promise<AuditEvent[]> {
    return [...this.events];
  }
}

export class InMemoryFeatureRegistryRepository implements FeatureRegistryRepository {
  private readonly features = new Map<string, RegisteredFeature>();

  async register(feature: RegisteredFeature): Promise<RegisteredFeature> {
    const validFeature = assertFeatureRegistration(feature);
    this.features.set(validFeature.featureName, validFeature);
    return validFeature;
  }

  async list(): Promise<RegisteredFeature[]> {
    return [...this.features.values()];
  }
}

export class InMemoryAuthSessionRepository implements AuthSessionRepository {
  private readonly sessions = new Map<UUID, AuthSession>();

  async getById(id: UUID): Promise<AuthSession | null> {
    return this.sessions.get(id) ?? null;
  }

  async save(session: AuthSession): Promise<AuthSession> {
    this.sessions.set(session.id, session);
    return session;
  }

  async revoke(id: UUID, revokedAt: string): Promise<AuthSession | null> {
    const session = this.sessions.get(id);

    if (!session) {
      return null;
    }

    const revokedSession = { ...session, revokedAt };
    this.sessions.set(id, revokedSession);
    return revokedSession;
  }
}

export class InMemoryMfaChallengeRepository implements MfaChallengeRepository {
  private readonly challenges = new Map<UUID, MfaChallenge>();

  async getById(id: UUID): Promise<MfaChallenge | null> {
    return this.challenges.get(id) ?? null;
  }

  async save(challenge: MfaChallenge): Promise<MfaChallenge> {
    this.challenges.set(challenge.id, challenge);
    return challenge;
  }
}

export class InMemoryPasswordResetRepository implements PasswordResetRepository {
  private readonly requests = new Map<UUID, PasswordResetRequest>();

  async getById(id: UUID): Promise<PasswordResetRequest | null> {
    return this.requests.get(id) ?? null;
  }

  async save(request: PasswordResetRequest): Promise<PasswordResetRequest> {
    this.requests.set(request.id, request);
    return request;
  }
}

export function createInMemoryBackendRepositories(): BackendRepositories & {
  auditLogs: InMemoryAuditLogRepository;
} {
  return {
    organizations: new InMemoryOrganizationRepository(),
    facilities: new InMemoryFacilityRepository(),
    users: new InMemoryUserRepository(),
    userCredentials: new InMemoryUserCredentialRepository(),
    residents: new InMemoryResidentRepository(),
    backgroundJobs: new InMemoryBackgroundJobRepository(),
    assessments: new InMemoryAssessmentRepository(),
    carePlans: new InMemoryCarePlanRepository(),
    careTasks: new InMemoryCareTaskRepository(),
    adlEntries: new InMemoryAdlEntryRepository(),
    servicePlans: new InMemoryServicePlanRepository(),
    medicationOrders: new InMemoryMedicationOrderRepository(),
    medicationAdministrations: new InMemoryMedicationAdministrationRepository(),
    incidents: new InMemoryIncidentRepository(),
    complianceIssues: new InMemoryComplianceIssueRepository(),
    billingCharges: new InMemoryBillingChargeRepository(),
    invoices: new InMemoryInvoiceRepository(),
    paymentTransactions: new InMemoryPaymentTransactionRepository(),
    operationalRecords: new InMemoryOperationalRecordRepository(),
    auditLogs: new InMemoryAuditLogRepository(),
    featureRegistry: new InMemoryFeatureRegistryRepository(),
    authSessions: new InMemoryAuthSessionRepository(),
    mfaChallenges: new InMemoryMfaChallengeRepository(),
    passwordResets: new InMemoryPasswordResetRepository()
  };
}
