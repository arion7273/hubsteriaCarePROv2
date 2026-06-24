import type { BackendRepositories, RoleTier, UUID } from '../../domain';
import {
  PostgresAuditLogRepository,
  PostgresAdlEntryRepository,
  PostgresCareTaskRepository,
  PostgresAuthSessionRepository,
  PostgresFacilityRepository,
  PostgresFeatureRegistryRepository,
  PostgresMfaChallengeRepository,
  PostgresOrganizationRepository,
  PostgresPasswordResetRepository,
  PostgresResidentRepository,
  PostgresServicePlanRepository,
  PostgresUserRepository
} from './repositories';
import type { PostgresClient } from './types';

export type PostgresRepositoryFactoryOptions = {
  createId: () => UUID;
  roleIdForTier: (roleTier: RoleTier) => UUID;
};

export function createPostgresBackendRepositories(
  client: PostgresClient,
  options: PostgresRepositoryFactoryOptions
): BackendRepositories {
  return {
    organizations: new PostgresOrganizationRepository(client),
    facilities: new PostgresFacilityRepository(client),
    users: new PostgresUserRepository(client, options.roleIdForTier),
    residents: new PostgresResidentRepository(client),
    careTasks: new PostgresCareTaskRepository(client),
    adlEntries: new PostgresAdlEntryRepository(client),
    servicePlans: new PostgresServicePlanRepository(client),
    auditLogs: new PostgresAuditLogRepository(client),
    featureRegistry: new PostgresFeatureRegistryRepository(client, options.createId),
    authSessions: new PostgresAuthSessionRepository(client),
    mfaChallenges: new PostgresMfaChallengeRepository(client),
    passwordResets: new PostgresPasswordResetRepository(client)
  };
}
