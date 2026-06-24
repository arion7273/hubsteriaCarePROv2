import { describe, expect, it } from 'vitest';
import { readServerConfig, roleIdResolver } from './config';
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
});

describe('server runtime services', () => {
  it('creates in-memory API services and seeds demo master admin', async () => {
    const services = createRuntimeServices(
      readServerConfig({
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

  it('fails auth verification when demo verifier is not configured', async () => {
    const services = createRuntimeServices(readServerConfig({}));
    await seedDemoMasterAdmin(services);

    await expect(services.auth.login({ email: 'b094650@gmail.com', password: 'anything' })).rejects.toThrow(
      'Password verifier is not configured'
    );
  });
});
