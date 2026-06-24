import type { AuditEvent } from './audit';
import { assertFeatureRegistration, type RegisteredFeature } from './feature-registry';
import type {
  AuditLogRepository,
  AdlEntryRepository,
  AuthSessionRepository,
  BackendRepositories,
  CareTaskRepository,
  FacilityRepository,
  FeatureRegistryRepository,
  MfaChallengeRepository,
  OrganizationRepository,
  PasswordResetRepository,
  ResidentRepository,
  ServicePlanRepository,
  UserRepository
} from './repositories';
import type { AdlEntry, AuthSession, CareTask, Facility, MfaChallenge, Organization, PasswordResetRequest, Resident, ServicePlanRecord, User, UUID } from './types';

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
    residents: new InMemoryResidentRepository(),
    careTasks: new InMemoryCareTaskRepository(),
    adlEntries: new InMemoryAdlEntryRepository(),
    servicePlans: new InMemoryServicePlanRepository(),
    auditLogs: new InMemoryAuditLogRepository(),
    featureRegistry: new InMemoryFeatureRegistryRepository(),
    authSessions: new InMemoryAuthSessionRepository(),
    mfaChallenges: new InMemoryMfaChallengeRepository(),
    passwordResets: new InMemoryPasswordResetRepository()
  };
}
