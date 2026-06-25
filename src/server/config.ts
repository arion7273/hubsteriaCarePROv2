import type { RoleTier, UUID } from '../domain';

export type RepositoryMode = 'memory' | 'postgres';

export type ServerConfig = {
  port: number;
  repositoryMode: RepositoryMode;
  databaseUrl?: string;
  databaseSsl: boolean;
  demoPassword?: string;
  demoMfaCode?: string;
  allowDemoAuth: boolean;
  totpSecrets: Record<UUID, string>;
  secureCookies: boolean;
  monitoringEndpoint?: string;
  errorTrackingDsn?: string;
  releaseVersion?: string;
  corsAllowedOrigins: string[];
  maxRequestBodyBytes: number;
  authRateLimit: number;
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
    allowDemoAuth: env.ALLOW_DEMO_AUTH === 'true' && env.NODE_ENV !== 'production',
    totpSecrets: parseTotpSecrets(env.MFA_TOTP_SECRETS_JSON),
    secureCookies: env.SECURE_COOKIES !== 'false',
    monitoringEndpoint: env.MONITORING_ENDPOINT,
    errorTrackingDsn: env.ERROR_TRACKING_DSN,
    releaseVersion: env.RELEASE_VERSION,
    corsAllowedOrigins: parseList(env.CORS_ALLOWED_ORIGINS),
    maxRequestBodyBytes: parsePositiveInteger(env.MAX_REQUEST_BODY_BYTES, 1_000_000),
    authRateLimit: parsePositiveInteger(env.AUTH_RATE_LIMIT, 10),
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
  return parsePositiveInteger(value, 3000);
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseList(value: string | undefined): string[] {
  return value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function parseTotpSecrets(value: string | undefined): Record<UUID, string> {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(([, secret]) => typeof secret === 'string')
    ) as Record<UUID, string>;
  } catch {
    return {};
  }
}
