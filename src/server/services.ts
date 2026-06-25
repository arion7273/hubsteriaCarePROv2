import { randomUUID } from 'node:crypto';
import { createPostgresBackendRepositories, PgPostgresClient } from '../adapters/postgres';
import {
  AuthService,
  BackendFoundationService,
  RepositoryPasswordVerifier,
  TotpMfaProvider,
  UnconfiguredMfaProvider,
  createInMemoryBackendRepositories,
  type MfaProvider,
  type BackendRepositories,
  type User
} from '../domain';
import type { ApiServices } from '../api';
import { readServerConfig, roleIdResolver, type ServerConfig } from './config';

export type RuntimeServices = ApiServices & {
  close?: () => Promise<void>;
};

export function createRuntimeServices(config: ServerConfig = readServerConfig()): RuntimeServices {
  if ((config.demoPassword || config.demoMfaCode) && !config.allowDemoAuth) {
    throw new Error('Demo authentication is disabled for deployable runtime. Set ALLOW_DEMO_AUTH=true only for local development.');
  }

  const runtime = createRepositories(config);
  const passwordVerifier = config.demoPassword
    ? {
        async verify({ password }: { password: string }) {
          return password === config.demoPassword;
        }
      }
    : new RepositoryPasswordVerifier(runtime.repositories);
  const mfaProvider = createMfaProvider(config);
  const auth = new AuthService(
    runtime.repositories,
    passwordVerifier,
    mfaProvider,
    randomUUID
  );
  const backend = new BackendFoundationService(runtime.repositories, randomUUID);

  return {
    auth,
    backend,
    repositories: runtime.repositories,
    now: () => new Date(),
    close: runtime.close
  };
}

function createMfaProvider(config: ServerConfig): MfaProvider {
  if (config.demoMfaCode && config.allowDemoAuth) {
    return {
      async verify({ code }) {
        return code === config.demoMfaCode;
      }
    };
  }

  if (Object.keys(config.totpSecrets).length > 0) {
    return new TotpMfaProvider((userId) => config.totpSecrets[userId]);
  }

  return new UnconfiguredMfaProvider();
}

export async function seedDemoMasterAdmin(services: RuntimeServices): Promise<User> {
  const user: User = {
    id: '00000000-0000-0000-0000-000000001100',
    email: 'b094650@gmail.com',
    roleTier: 'T1',
    facilityIds: [],
    permissions: [],
    status: 'active'
  };

  return services.repositories.users.save(user);
}

function createRepositories(config: ServerConfig): {
  repositories: BackendRepositories;
  close?: () => Promise<void>;
} {
  if (config.repositoryMode === 'postgres') {
    const client = new PgPostgresClient({
      connectionString: config.databaseUrl as string,
      ssl: config.databaseSsl
    });

    return {
      repositories: createPostgresBackendRepositories(client, {
        createId: randomUUID,
        roleIdForTier: roleIdResolver(config)
      }),
      close: () => client.close()
    };
  }

  return {
    repositories: createInMemoryBackendRepositories()
  };
}
