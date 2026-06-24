import { assertFeatureRegistration, type AuditEvent, type RegisteredFeature } from '../../domain';
import type {
  AuditLogRepository,
  AuthSessionRepository,
  FacilityRepository,
  FeatureRegistryRepository,
  MfaChallengeRepository,
  OrganizationRepository,
  PasswordResetRepository,
  UserRepository
} from '../../domain/repositories';
import type { AuthSession, Facility, MfaChallenge, Organization, PasswordResetRequest, RoleTier, User, UUID } from '../../domain/types';
import {
  auditLogStatements,
  authSessionStatements,
  facilityStatements,
  featureRegistryStatements,
  mfaChallengeStatements,
  organizationStatements,
  passwordResetStatements,
  userStatements
} from './statements';
import {
  mapAuditRow,
  mapAuthSessionRow,
  mapFacilityRow,
  mapFeatureRow,
  mapMfaChallengeRow,
  mapOrganizationRow,
  mapPasswordResetRequestRow,
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
    const saved = await this.getById(user.id);

    if (!saved) {
      throw new Error('User save failed');
    }

    return saved;
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
