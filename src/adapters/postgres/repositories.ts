import { assertFeatureRegistration, type AuditEvent, type RegisteredFeature } from '../../domain';
import type {
  AccountSecurityRepository,
  AdlEntryRepository,
  AuditLogRepository,
  AssessmentRepository,
  BackgroundJobRepository,
  BillingChargeRepository,
  ComplianceIssueRepository,
  AuthSessionRepository,
  CarePlanRepository,
  CareTaskRepository,
  FacilityRepository,
  FeatureRegistryRepository,
  MedicationAdministrationRepository,
  MedicationOrderRepository,
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
} from '../../domain/repositories';
import type {
  AccountSecurityState,
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
  OperationalRecord,
  Organization,
  PaymentTransaction,
  PasswordResetRequest,
  Resident,
  RoleTier,
  ServicePlanRecord,
  User,
  UserCredential,
  UUID
} from '../../domain/types';
import {
  accountSecurityStatements,
  assessmentStatements,
  adlEntryStatements,
  auditLogStatements,
  backgroundJobStatements,
  authSessionStatements,
  carePlanStatements,
  careTaskStatements,
  facilityStatements,
  featureRegistryStatements,
  medicationAdministrationStatements,
  medicationOrderStatements,
  complianceIssueStatements,
  incidentStatements,
  billingChargeStatements,
  invoiceStatements,
  mfaChallengeStatements,
  operationalRecordStatements,
  organizationStatements,
  passwordResetStatements,
  paymentTransactionStatements,
  residentStatements,
  servicePlanStatements,
  userCredentialStatements,
  userStatements
} from './statements';
import {
  mapAccountSecurityStateRow,
  mapAssessmentRow,
  mapAdlEntryRow,
  mapAuditRow,
  mapBackgroundJobRow,
  mapAuthSessionRow,
  mapCarePlanRow,
  mapCareTaskRow,
  mapFacilityRow,
  mapFeatureRow,
  mapMedicationAdministrationRow,
  mapMedicationOrderRow,
  mapComplianceIssueRow,
  mapIncidentRow,
  mapBillingChargeRow,
  mapInvoiceRow,
  mapMfaChallengeRow,
  mapOperationalRecordRow,
  mapOrganizationRow,
  mapPasswordResetRequestRow,
  mapPaymentTransactionRow,
  mapResidentRow,
  mapServicePlanRow,
  mapUserCredentialRow,
  mapUserRow
} from './mappers';
import type { PostgresClient, PostgresRow } from './types';

export class PostgresOrganizationRepository implements OrganizationRepository {
  constructor(private readonly client: PostgresClient) {}

  async getById(id: UUID): Promise<Organization | null> {
    return first(await this.client.query(organizationStatements.selectById(id)), mapOrganizationRow);
  }

  async list(): Promise<Organization[]> {
    const result = await this.client.query(organizationStatements.list());
    return result.rows.map(mapOrganizationRow);
  }

  async save(organization: Organization): Promise<Organization> {
    return requiredFirst(await this.client.query(organizationStatements.upsert(organization)), mapOrganizationRow);
  }
}

export class PostgresFacilityRepository implements FacilityRepository {
  constructor(private readonly client: PostgresClient) {}

  async getById(id: UUID): Promise<Facility | null> {
    return first(await this.client.query(facilityStatements.selectById(id)), mapFacilityRow);
  }

  async listByOrganization(organizationId: UUID): Promise<Facility[]> {
    const result = await this.client.query(facilityStatements.listByOrganization(organizationId));
    return result.rows.map(mapFacilityRow);
  }

  async save(facility: Facility): Promise<Facility> {
    return requiredFirst(await this.client.query(facilityStatements.upsert(facility)), mapFacilityRow);
  }
}

export class PostgresUserRepository implements UserRepository {
  constructor(
    private readonly client: PostgresClient,
    private readonly roleIdForTier: (roleTier: RoleTier) => UUID
  ) {}

  async getById(id: UUID): Promise<User | null> {
    return first(await this.client.query(userStatements.selectById(id)), mapUserRow);
  }

  async getByEmail(email: string): Promise<User | null> {
    return first(await this.client.query(userStatements.selectByEmail(email)), mapUserRow);
  }

  async listByOrganization(organizationId: UUID): Promise<User[]> {
    const result = await this.client.query(userStatements.listByOrganization(organizationId));
    return result.rows.map(mapUserRow);
  }

  async save(user: User): Promise<User> {
    await this.client.query(userStatements.upsert(user, this.roleIdForTier(user.roleTier)));
    await this.client.query(userStatements.deleteFacilities(user.id));

    for (const facilityId of user.facilityIds) {
      await this.client.query(userStatements.insertFacility(user.id, facilityId));
    }

    const saved = await this.getById(user.id);

    if (!saved) {
      throw new Error('User save failed');
    }

    return saved;
  }
}

export class PostgresResidentRepository implements ResidentRepository {
  constructor(private readonly client: PostgresClient) {}

  async getById(id: UUID): Promise<Resident | null> {
    return first(await this.client.query(residentStatements.selectById(id)), mapResidentRow);
  }

  async listByFacility(organizationId: UUID, facilityId: UUID): Promise<Resident[]> {
    const result = await this.client.query(residentStatements.listByFacility(organizationId, facilityId));
    return result.rows.map(mapResidentRow);
  }

  async save(resident: Resident): Promise<Resident> {
    return requiredFirst(await this.client.query(residentStatements.upsert(resident)), mapResidentRow);
  }
}

export class PostgresBackgroundJobRepository implements BackgroundJobRepository {
  constructor(private readonly client: PostgresClient) {}
  async getById(id: UUID): Promise<BackgroundJob | null> { return first(await this.client.query(backgroundJobStatements.selectById(id)), mapBackgroundJobRow); }
  async listQueued(limit: number): Promise<BackgroundJob[]> { return (await this.client.query(backgroundJobStatements.listQueued(limit))).rows.map(mapBackgroundJobRow); }
  async listByScope(scope: { organizationId?: UUID; facilityId?: UUID; residentId?: UUID }): Promise<BackgroundJob[]> { return (await this.client.query(backgroundJobStatements.listByScope(scope))).rows.map(mapBackgroundJobRow); }
  async save(job: BackgroundJob): Promise<BackgroundJob> { return requiredFirst(await this.client.query(backgroundJobStatements.upsert(job)), mapBackgroundJobRow); }
}

export class PostgresAssessmentRepository implements AssessmentRepository {
  constructor(private readonly client: PostgresClient) {}

  async getById(id: UUID): Promise<Assessment | null> {
    return first(await this.client.query(assessmentStatements.selectById(id)), mapAssessmentRow);
  }

  async listByResident(residentId: UUID): Promise<Assessment[]> {
    const result = await this.client.query(assessmentStatements.listByResident(residentId));
    return result.rows.map(mapAssessmentRow);
  }

  async save(assessment: Assessment): Promise<Assessment> {
    return requiredFirst(await this.client.query(assessmentStatements.upsert(assessment)), mapAssessmentRow);
  }
}

export class PostgresCarePlanRepository implements CarePlanRepository {
  constructor(private readonly client: PostgresClient) {}

  async getById(id: UUID): Promise<CarePlan | null> {
    return first(await this.client.query(carePlanStatements.selectById(id)), mapCarePlanRow);
  }

  async listByResident(residentId: UUID): Promise<CarePlan[]> {
    const result = await this.client.query(carePlanStatements.listByResident(residentId));
    return result.rows.map(mapCarePlanRow);
  }

  async save(carePlan: CarePlan): Promise<CarePlan> {
    return requiredFirst(await this.client.query(carePlanStatements.upsert(carePlan)), mapCarePlanRow);
  }
}

export class PostgresCareTaskRepository implements CareTaskRepository {
  constructor(private readonly client: PostgresClient) {}
  async getById(id: UUID): Promise<CareTask | null> { return first(await this.client.query(careTaskStatements.selectById(id)), mapCareTaskRow); }
  async listByResident(residentId: UUID): Promise<CareTask[]> { return (await this.client.query(careTaskStatements.listByResident(residentId))).rows.map(mapCareTaskRow); }
  async save(task: CareTask): Promise<CareTask> { return requiredFirst(await this.client.query(careTaskStatements.upsert(task)), mapCareTaskRow); }
}

export class PostgresAdlEntryRepository implements AdlEntryRepository {
  constructor(private readonly client: PostgresClient) {}
  async listByResident(residentId: UUID): Promise<AdlEntry[]> { return (await this.client.query(adlEntryStatements.listByResident(residentId))).rows.map(mapAdlEntryRow); }
  async save(entry: AdlEntry): Promise<AdlEntry> { return requiredFirst(await this.client.query(adlEntryStatements.insert(entry)), mapAdlEntryRow); }
}

export class PostgresServicePlanRepository implements ServicePlanRepository {
  constructor(private readonly client: PostgresClient) {}
  async listByResident(residentId: UUID): Promise<ServicePlanRecord[]> { return (await this.client.query(servicePlanStatements.listByResident(residentId))).rows.map(mapServicePlanRow); }
  async save(plan: ServicePlanRecord): Promise<ServicePlanRecord> { return requiredFirst(await this.client.query(servicePlanStatements.upsert(plan)), mapServicePlanRow); }
}

export class PostgresMedicationOrderRepository implements MedicationOrderRepository {
  constructor(private readonly client: PostgresClient) {}
  async getById(id: UUID): Promise<MedicationOrder | null> { return first(await this.client.query(medicationOrderStatements.selectById(id)), mapMedicationOrderRow); }
  async listByResident(residentId: UUID): Promise<MedicationOrder[]> { return (await this.client.query(medicationOrderStatements.listByResident(residentId))).rows.map(mapMedicationOrderRow); }
  async save(order: MedicationOrder): Promise<MedicationOrder> { return requiredFirst(await this.client.query(medicationOrderStatements.upsert(order)), mapMedicationOrderRow); }
}

export class PostgresMedicationAdministrationRepository implements MedicationAdministrationRepository {
  constructor(private readonly client: PostgresClient) {}
  async listByResident(residentId: UUID): Promise<MedicationAdministration[]> { return (await this.client.query(medicationAdministrationStatements.listByResident(residentId))).rows.map(mapMedicationAdministrationRow); }
  async save(administration: MedicationAdministration): Promise<MedicationAdministration> { return requiredFirst(await this.client.query(medicationAdministrationStatements.insert(administration)), mapMedicationAdministrationRow); }
}

export class PostgresIncidentRepository implements IncidentRepository {
  constructor(private readonly client: PostgresClient) {}
  async getById(id: UUID): Promise<Incident | null> { return first(await this.client.query(incidentStatements.selectById(id)), mapIncidentRow); }
  async listByResident(residentId: UUID): Promise<Incident[]> { return (await this.client.query(incidentStatements.listByResident(residentId))).rows.map(mapIncidentRow); }
  async listByFacility(organizationId: UUID, facilityId: UUID): Promise<Incident[]> { return (await this.client.query(incidentStatements.listByFacility(organizationId, facilityId))).rows.map(mapIncidentRow); }
  async save(incident: Incident): Promise<Incident> { return requiredFirst(await this.client.query(incidentStatements.upsert(incident)), mapIncidentRow); }
}

export class PostgresComplianceIssueRepository implements ComplianceIssueRepository {
  constructor(private readonly client: PostgresClient) {}
  async listByFacility(organizationId: UUID, facilityId: UUID): Promise<ComplianceIssue[]> { return (await this.client.query(complianceIssueStatements.listByFacility(organizationId, facilityId))).rows.map(mapComplianceIssueRow); }
  async save(issue: ComplianceIssue): Promise<ComplianceIssue> { return requiredFirst(await this.client.query(complianceIssueStatements.upsert(issue)), mapComplianceIssueRow); }
}

export class PostgresBillingChargeRepository implements BillingChargeRepository {
  constructor(private readonly client: PostgresClient) {}
  async listByResident(residentId: UUID): Promise<BillingCharge[]> { return (await this.client.query(billingChargeStatements.listByResident(residentId))).rows.map(mapBillingChargeRow); }
  async save(charge: BillingCharge): Promise<BillingCharge> { return requiredFirst(await this.client.query(billingChargeStatements.upsert(charge)), mapBillingChargeRow); }
}

export class PostgresInvoiceRepository implements InvoiceRepository {
  constructor(private readonly client: PostgresClient) {}
  async getById(id: UUID): Promise<Invoice | null> { return first(await this.client.query(invoiceStatements.selectById(id)), mapInvoiceRow); }
  async listByResident(residentId: UUID): Promise<Invoice[]> { return (await this.client.query(invoiceStatements.listByResident(residentId))).rows.map(mapInvoiceRow); }
  async save(invoice: Invoice): Promise<Invoice> { return requiredFirst(await this.client.query(invoiceStatements.upsert(invoice)), mapInvoiceRow); }
}

export class PostgresPaymentTransactionRepository implements PaymentTransactionRepository {
  constructor(private readonly client: PostgresClient) {}
  async listByResident(residentId: UUID): Promise<PaymentTransaction[]> { return (await this.client.query(paymentTransactionStatements.listByResident(residentId))).rows.map(mapPaymentTransactionRow); }
  async save(transaction: PaymentTransaction): Promise<PaymentTransaction> { return requiredFirst(await this.client.query(paymentTransactionStatements.insert(transaction)), mapPaymentTransactionRow); }
}

export class PostgresOperationalRecordRepository implements OperationalRecordRepository {
  constructor(private readonly client: PostgresClient) {}

  async getById(id: UUID): Promise<OperationalRecord | null> {
    return first(await this.client.query(operationalRecordStatements.selectById(id)), mapOperationalRecordRow);
  }

  async listByScope(scope: { organizationId: UUID; facilityId?: UUID; residentId?: UUID; module?: OperationalRecord['module'] }): Promise<OperationalRecord[]> {
    const result = await this.client.query(operationalRecordStatements.listByScope(scope));
    return result.rows.map(mapOperationalRecordRow);
  }

  async save(record: OperationalRecord): Promise<OperationalRecord> {
    return requiredFirst(await this.client.query(operationalRecordStatements.upsert(record)), mapOperationalRecordRow);
  }
}

export class PostgresAuditLogRepository implements AuditLogRepository {
  constructor(private readonly client: PostgresClient) {}

  async append(event: AuditEvent): Promise<void> {
    await this.client.query(auditLogStatements.append(event));
  }

  async listByEntity(entityType: string, entityId: UUID): Promise<AuditEvent[]> {
    const result = await this.client.query(auditLogStatements.listByEntity(entityType, entityId));
    return result.rows.map(mapAuditRow);
  }
}

export class PostgresFeatureRegistryRepository implements FeatureRegistryRepository {
  constructor(
    private readonly client: PostgresClient,
    private readonly createId: () => UUID
  ) {}

  async register(feature: RegisteredFeature): Promise<RegisteredFeature> {
    const validFeature = assertFeatureRegistration(feature);
    return requiredFirst(await this.client.query(featureRegistryStatements.insert(validFeature, this.createId())), mapFeatureRow);
  }

  async list(): Promise<RegisteredFeature[]> {
    const result = await this.client.query(featureRegistryStatements.list());
    return result.rows.map(mapFeatureRow);
  }
}

export class PostgresAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly client: PostgresClient) {}

  async getById(id: UUID): Promise<AuthSession | null> {
    return first(await this.client.query(authSessionStatements.selectById(id)), mapAuthSessionRow);
  }

  async save(session: AuthSession): Promise<AuthSession> {
    return requiredFirst(await this.client.query(authSessionStatements.upsert(session)), mapAuthSessionRow);
  }

  async revoke(id: UUID, revokedAt: string): Promise<AuthSession | null> {
    return first(await this.client.query(authSessionStatements.revoke(id, revokedAt)), mapAuthSessionRow);
  }
}

export class PostgresMfaChallengeRepository implements MfaChallengeRepository {
  constructor(private readonly client: PostgresClient) {}

  async getById(id: UUID): Promise<MfaChallenge | null> {
    return first(await this.client.query(mfaChallengeStatements.selectById(id)), mapMfaChallengeRow);
  }

  async save(challenge: MfaChallenge): Promise<MfaChallenge> {
    return requiredFirst(await this.client.query(mfaChallengeStatements.upsert(challenge)), mapMfaChallengeRow);
  }
}

export class PostgresPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly client: PostgresClient) {}

  async getById(id: UUID): Promise<PasswordResetRequest | null> {
    return first(await this.client.query(passwordResetStatements.selectById(id)), mapPasswordResetRequestRow);
  }

  async save(request: PasswordResetRequest): Promise<PasswordResetRequest> {
    return requiredFirst(await this.client.query(passwordResetStatements.upsert(request)), mapPasswordResetRequestRow);
  }
}

export class PostgresUserCredentialRepository implements UserCredentialRepository {
  constructor(private readonly client: PostgresClient) {}

  async getByUserId(userId: UUID): Promise<UserCredential | null> {
    return first(await this.client.query(userCredentialStatements.selectByUserId(userId)), mapUserCredentialRow);
  }

  async save(credential: UserCredential): Promise<UserCredential> {
    return requiredFirst(await this.client.query(userCredentialStatements.upsert(credential)), mapUserCredentialRow);
  }
}

export class PostgresAccountSecurityRepository implements AccountSecurityRepository {
  constructor(private readonly client: PostgresClient) {}

  async getByUserId(userId: UUID): Promise<AccountSecurityState | null> {
    return first(await this.client.query(accountSecurityStatements.selectByUserId(userId)), mapAccountSecurityStateRow);
  }

  async save(state: AccountSecurityState): Promise<AccountSecurityState> {
    return requiredFirst(await this.client.query(accountSecurityStatements.upsert(state)), mapAccountSecurityStateRow);
  }
}

function first<T>(result: { rows: PostgresRow[] }, mapper: (row: PostgresRow) => T): T | null {
  return result.rows[0] ? mapper(result.rows[0]) : null;
}

function requiredFirst<T>(result: { rows: PostgresRow[] }, mapper: (row: PostgresRow) => T): T {
  const mapped = first(result, mapper);

  if (!mapped) {
    throw new Error('PostgreSQL statement returned no rows');
  }

  return mapped;
}
