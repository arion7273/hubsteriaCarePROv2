import type { BackendRepositories, RoleTier, UUID } from '../../domain';
import {
  PostgresAuditLogRepository,
  PostgresComplianceIssueRepository,
  PostgresAuthSessionRepository,
  PostgresFacilityRepository,
  PostgresFeatureRegistryRepository,
  PostgresIncidentRepository,
  PostgresMfaChallengeRepository,
  PostgresOrganizationRepository,
  PostgresPasswordResetRepository,
  PostgresResidentRepository,
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
    incidents: new PostgresIncidentRepository(client),
    complianceIssues: new PostgresComplianceIssueRepository(client),
    auditLogs: new PostgresAuditLogRepository(client),
    featureRegistry: new PostgresFeatureRegistryRepository(client, options.createId),
    authSessions: new PostgresAuthSessionRepository(client),
    mfaChallenges: new PostgresMfaChallengeRepository(client),
    passwordResets: new PostgresPasswordResetRepository(client)
  };
}
