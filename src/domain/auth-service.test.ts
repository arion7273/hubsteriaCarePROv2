import { describe, expect, it } from 'vitest';
import { AuthService, createInMemoryBackendRepositories, type MfaChallenge, type User } from '.';

const activeT3User: User = {
  id: 'user-facility-admin',
  email: 'facility@example.com',
  roleTier: 'T3',
  organizationId: 'org-1',
  facilityIds: ['facility-1'],
  permissions: [],
  status: 'active'
};

function createAuthService() {
  const ids = ['session-1', 'mfa-1', 'audit-login', 'audit-mfa', 'audit-logout', 'reset-1', 'audit-reset'];
  const repositories = createInMemoryBackendRepositories();
  const service = new AuthService(
    repositories,
    {
      async verify({ password }) {
        return password === 'correct-password';
      }
    },
    {
      async verify({ code }) {
        return code === '123456';
      }
    },
    () => ids.shift() ?? 'fallback-id',
    () => new Date('2026-06-24T01:00:00.000Z')
  );

  return { repositories, service };
}

describe('AuthService', () => {
  it('logs active users in, creates MFA challenge, and writes audit', async () => {
    const { repositories, service } = createAuthService();
    await repositories.users.save(activeT3User);

    const result = await service.login({ email: activeT3User.email, password: 'correct-password' });

    expect(result.session).toMatchObject({
      id: 'session-1',
      userId: activeT3User.id,
      mfaVerified: false
    });
    expect(result.mfaChallenge).toMatchObject({
      id: 'mfa-1',
      userId: activeT3User.id
    });
    await expect(repositories.auditLogs.listByEntity('AuthSession', 'session-1')).resolves.toHaveLength(1);
  });

  it('rejects invalid credentials without creating sessions', async () => {
    const { repositories, service } = createAuthService();
    await repositories.users.save(activeT3User);

    await expect(service.login({ email: activeT3User.email, password: 'wrong-password' })).rejects.toThrow('Invalid credentials');
    await expect(repositories.authSessions.getById('session-1')).resolves.toBeNull();
  });

  it('verifies MFA challenge and marks session verified', async () => {
    const { repositories, service } = createAuthService();
    await repositories.users.save(activeT3User);
    const { session, mfaChallenge } = await service.login({ email: activeT3User.email, password: 'correct-password' });

    const verified = await service.verifyMfa({
      sessionId: session.id,
      challengeId: (mfaChallenge as MfaChallenge).id,
      code: '123456'
    });

    expect(verified.mfaVerified).toBe(true);
    await expect(repositories.auditLogs.listByEntity('AuthSession', 'session-1')).resolves.toHaveLength(2);
  });

  it('logs out by revoking session and writing audit', async () => {
    const { repositories, service } = createAuthService();
    await repositories.users.save(activeT3User);
    const { session } = await service.login({ email: activeT3User.email, password: 'correct-password' });

    const revoked = await service.logout(session.id);

    expect(revoked.revokedAt).toBe('2026-06-24T01:00:00.000Z');
    await expect(repositories.auditLogs.listByEntity('AuthSession', 'session-1')).resolves.toHaveLength(2);
  });

  it('creates password reset requests for active users', async () => {
    const { repositories, service } = createAuthService();
    await repositories.users.save(activeT3User);

    await service.login({ email: activeT3User.email, password: 'correct-password' });
    await service.verifyMfa({ sessionId: 'session-1', challengeId: 'mfa-1', code: '123456' });
    await service.logout('session-1');

    const reset = await service.requestPasswordReset(activeT3User.email);

    expect(reset).toMatchObject({
      id: 'reset-1',
      userId: activeT3User.id
    });
    await expect(repositories.auditLogs.listByEntity('PasswordResetRequest', 'reset-1')).resolves.toHaveLength(1);
  });
});
