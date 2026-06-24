import type { AuditEvent } from './audit';
import { assertFeatureRegistration, type RegisteredFeature } from './feature-registry';
import type {
  AuditLogRepository,
  BackendRepositories,
  FacilityRepository,
  FeatureRegistryRepository,
  OrganizationRepository,
  UserRepository
} from './repositories';
import type { Facility, Organization, User, UUID } from './types';

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

export function createInMemoryBackendRepositories(): BackendRepositories & {
  auditLogs: InMemoryAuditLogRepository;
} {
  return {
    organizations: new InMemoryOrganizationRepository(),
    facilities: new InMemoryFacilityRepository(),
    users: new InMemoryUserRepository(),
    auditLogs: new InMemoryAuditLogRepository(),
    featureRegistry: new InMemoryFeatureRegistryRepository()
  };
}
