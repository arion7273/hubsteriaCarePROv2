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
  const ids = [
    'session-1',
    'mfa-1',
    'audit-login',
    'audit-mfa',
    'audit-logout',
    'reset-1',
    'audit-reset',
    'audit-failed-1',
    'audit-failed-2',
    'audit-failed-3',
    'audit-failed-4',
    'audit-locked',
    'audit-blocked',
    'audit-reset-security',
    'audit-reset-complete',
    'audit-credential-reset'
  ];
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

  it('does not enumerate accounts during password reset requests', async () => {
    const { repositories, service } = createAuthService();

    const reset = await service.requestPasswordReset('missing@example.com');

    expect(reset).toMatchObject({
      id: 'session-1',
      userId: '00000000-0000-0000-0000-000000000000'
    });
    await expect(repositories.passwordResets.getById(reset.id)).resolves.toBeNull();
  });

  it('locks accounts after repeated failed login attempts and audits lockout state', async () => {
    const { repositories, service } = createAuthService();
    await repositories.users.save(activeT3User);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.login({ email: activeT3User.email, password: 'wrong-password' })).rejects.toThrow('Invalid credentials');
    }

    await expect(repositories.accountSecurity.getByUserId(activeT3User.id)).resolves.toMatchObject({
      failedLoginAttempts: 5,
      lockedUntil: '2026-06-24T01:15:00.000Z'
    });
    await expect(service.login({ email: activeT3User.email, password: 'correct-password' })).rejects.toThrow(
      'Account locked. Try again later.'
    );
    await expect(repositories.auditLogs.listByEntity('AccountSecurityState', activeT3User.id)).resolves.toHaveLength(6);
  });

  it('resets failed login counters after a successful login', async () => {
    const { repositories, service } = createAuthService();
    await repositories.users.save(activeT3User);
    await expect(service.login({ email: activeT3User.email, password: 'wrong-password' })).rejects.toThrow('Invalid credentials');

    await expect(service.login({ email: activeT3User.email, password: 'correct-password' })).resolves.toMatchObject({
      session: expect.objectContaining({ userId: activeT3User.id })
    });
    await expect(repositories.accountSecurity.getByUserId(activeT3User.id)).resolves.toMatchObject({
      failedLoginAttempts: 0,
      lockedUntil: undefined
    });
  });

  it('completes password reset by updating credentials marking reset used and auditing', async () => {
    const { repositories, service } = createAuthService();
    await repositories.users.save(activeT3User);
    const reset = await service.requestPasswordReset(activeT3User.email);

    await service.completePasswordReset({ requestId: reset.id, newPassword: 'new-secure-password' });

    await expect(repositories.passwordResets.getById(reset.id)).resolves.toMatchObject({
      usedAt: '2026-06-24T01:00:00.000Z'
    });
    await expect(repositories.userCredentials.getByUserId(activeT3User.id)).resolves.toMatchObject({
      userId: activeT3User.id
    });
    await expect(repositories.auditLogs.listByEntity('PasswordResetRequest', reset.id)).resolves.toHaveLength(2);
    await expect(repositories.auditLogs.listByEntity('UserCredential', activeT3User.id)).resolves.toHaveLength(1);
  });
});
