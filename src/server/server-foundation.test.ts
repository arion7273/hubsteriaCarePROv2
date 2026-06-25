import { describe, expect, it } from 'vitest';
import { readServerConfig, roleIdResolver } from './config';
import { initializeObservability } from './observability';
import { createRuntimeServices, seedDemoMasterAdmin } from './services';

describe('server runtime configuration', () => {
  it('defaults to memory mode and port 3000', () => {
    expect(readServerConfig({})).toMatchObject({
      port: 3000,
      repositoryMode: 'memory',
      databaseSsl: false
    });
  });

  it('requires DATABASE_URL for postgres mode', () => {
    expect(() => readServerConfig({ BACKEND_REPOSITORY_MODE: 'postgres' })).toThrow(
      'DATABASE_URL is required when BACKEND_REPOSITORY_MODE=postgres'
    );
  });

  it('resolves role IDs from environment-backed config', () => {
    const config = readServerConfig({
      ROLE_ID_T1: 'role-t1',
      ROLE_ID_T3: 'role-t3'
    });

    expect(roleIdResolver(config)('T1')).toBe('role-t1');
    expect(() => roleIdResolver(config)('T2')).toThrow('Missing role id for tier T2');
  });

  it('reads staging observability placeholders from environment', () => {
    const config = readServerConfig({
      MONITORING_ENDPOINT: 'https://monitoring.example.invalid/hubsteria',
      ERROR_TRACKING_DSN: 'https://errors.example.invalid/hubsteria',
      RELEASE_VERSION: 'staging-2026-06-24',
      CORS_ALLOWED_ORIGINS: 'https://app.example.com,https://admin.example.com',
      MAX_REQUEST_BODY_BYTES: '2048',
      AUTH_RATE_LIMIT: '3',
      SECURE_COOKIES: 'false',
      MFA_TOTP_SECRETS_JSON: '{"user-1":"JBSWY3DPEHPK3PXP"}'
    });

    expect(config).toMatchObject({
      monitoringEndpoint: 'https://monitoring.example.invalid/hubsteria',
      errorTrackingDsn: 'https://errors.example.invalid/hubsteria',
      releaseVersion: 'staging-2026-06-24',
      corsAllowedOrigins: ['https://app.example.com', 'https://admin.example.com'],
      maxRequestBodyBytes: 2048,
      authRateLimit: 3,
      secureCookies: false,
      totpSecrets: { 'user-1': 'JBSWY3DPEHPK3PXP' }
    });
    expect(initializeObservability(config)).toEqual({
      monitoringConfigured: true,
      errorTrackingConfigured: true,
      releaseVersion: 'staging-2026-06-24'
    });
  });
});

describe('server runtime services', () => {
  it('creates in-memory API services and seeds demo master admin', async () => {
    const services = createRuntimeServices(
      readServerConfig({
        ALLOW_DEMO_AUTH: 'true',
        DEMO_AUTH_PASSWORD: 'local-password',
        DEMO_MFA_CODE: '123456'
      })
    );

    await seedDemoMasterAdmin(services);

    await expect(services.repositories.users.getByEmail('b094650@gmail.com')).resolves.toMatchObject({
      roleTier: 'T1',
      status: 'active'
    });
  });

  it('rejects demo authentication unless explicitly enabled for local development', () => {
    expect(() =>
      createRuntimeServices(
        readServerConfig({
          DEMO_AUTH_PASSWORD: 'local-password',
          DEMO_MFA_CODE: '123456'
        })
      )
    ).toThrow('Demo authentication is disabled');
  });

  it('uses repository-backed credentials when demo verifier is not configured', async () => {
    const services = createRuntimeServices(readServerConfig({}));
    await seedDemoMasterAdmin(services);

    await expect(services.auth.login({ email: 'b094650@gmail.com', password: 'anything' })).rejects.toThrow(
      'Invalid credentials'
    );
  });
});
