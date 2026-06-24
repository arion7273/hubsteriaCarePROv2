import type { RoleTier, UUID } from '../domain';

export type RepositoryMode = 'memory' | 'postgres';

export type ServerConfig = {
  port: number;
  repositoryMode: RepositoryMode;
  databaseUrl?: string;
  databaseSsl: boolean;
  demoPassword?: string;
  demoMfaCode?: string;
  roleIds: Partial<Record<RoleTier, UUID>>;
};

export function readServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const repositoryMode = parseRepositoryMode(env.BACKEND_REPOSITORY_MODE);
  const databaseUrl = env.DATABASE_URL;

  if (repositoryMode === 'postgres' && !databaseUrl) {
    throw new Error('DATABASE_URL is required when BACKEND_REPOSITORY_MODE=postgres');
  }

  return {
    port: parsePort(env.PORT),
    repositoryMode,
    databaseUrl,
    databaseSsl: env.DATABASE_SSL === 'true',
    demoPassword: env.DEMO_AUTH_PASSWORD,
    demoMfaCode: env.DEMO_MFA_CODE,
    roleIds: {
      T1: env.ROLE_ID_T1,
      T2: env.ROLE_ID_T2,
      T2_5: env.ROLE_ID_T2_5,
      T3: env.ROLE_ID_T3,
      EMPLOYEE: env.ROLE_ID_EMPLOYEE,
      FAMILY: env.ROLE_ID_FAMILY,
      RESIDENT: env.ROLE_ID_RESIDENT
    }
  };
}

export function roleIdResolver(config: ServerConfig): (roleTier: RoleTier) => UUID {
  return (roleTier) => {
    const roleId = config.roleIds[roleTier];

    if (!roleId) {
      throw new Error(`Missing role id for tier ${roleTier}`);
    }

    return roleId;
  };
}

function parseRepositoryMode(value: string | undefined): RepositoryMode {
  if (value === 'postgres') {
    return 'postgres';
  }

  return 'memory';
}

function parsePort(value: string | undefined): number {
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return 3000;
}
