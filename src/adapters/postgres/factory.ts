import type { BackendRepositories, RoleTier, UUID } from '../../domain';
import {
  PostgresAccountSecurityRepository,
  PostgresAuditLogRepository,
  PostgresBackgroundJobRepository,
  PostgresAuthSessionRepository,
  PostgresFacilityRepository,
  PostgresFeatureRegistryRepository,
  PostgresMfaChallengeRepository,
  PostgresOrganizationRepository,
  PostgresPasswordResetRepository,
  PostgresResidentRepository,
  PostgresUserCredentialRepository,
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
    userCredentials: new PostgresUserCredentialRepository(client),
    residents: new PostgresResidentRepository(client),
    backgroundJobs: new PostgresBackgroundJobRepository(client),
    auditLogs: new PostgresAuditLogRepository(client),
    featureRegistry: new PostgresFeatureRegistryRepository(client, options.createId),
    authSessions: new PostgresAuthSessionRepository(client),
    mfaChallenges: new PostgresMfaChallengeRepository(client),
    passwordResets: new PostgresPasswordResetRepository(client),
    accountSecurity: new PostgresAccountSecurityRepository(client)
  };
}
