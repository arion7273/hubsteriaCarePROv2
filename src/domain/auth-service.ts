import { createAuditEvent } from './audit';
import { hashPassword, serializePasswordHash } from './password-hashing';
import type { BackendRepositories } from './repositories';
import type { AccountSecurityState, AuthSession, MfaChallenge, PasswordResetRequest, User, UUID } from './types';

export type PasswordVerifier = {
  verify(input: { user: User; password: string }): Promise<boolean>;
};

export type MfaProvider = {
  verify(input: { challenge: MfaChallenge; code: string }): Promise<boolean>;
};
export type MfaVerifier = MfaProvider;

export type AuthClock = () => Date;
export type AuthIdFactory = () => UUID;

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MFA_TTL_MS = 10 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCKOUT_MS = 15 * 60 * 1000;
const PASSWORD_RESET_ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';

export class AuthService {
  constructor(
    private readonly repositories: BackendRepositories,
    private readonly passwordVerifier: PasswordVerifier,
    private readonly mfaProvider: MfaProvider,
    private readonly createId: AuthIdFactory,
    private readonly clock: AuthClock = () => new Date()
  ) {}

  async login(input: { email: string; password: string }): Promise<{ session: AuthSession; mfaChallenge?: MfaChallenge }> {
    const user = await this.repositories.users.getByEmail(input.email);

    if (!user || user.status !== 'active') {
      throw new Error('Invalid credentials');
    }

    const now = this.clock();
    const securityState = await this.repositories.accountSecurity.getByUserId(user.id);
    if (securityState?.lockedUntil && Date.parse(securityState.lockedUntil) > now.getTime()) {
      await this.auditAccountSecurity(user, securityState, securityState, 'locked_login_blocked');
      throw new Error('Account locked. Try again later.');
    }

    const passwordValid = await this.passwordVerifier.verify({ user, password: input.password });

    if (!passwordValid) {
      await this.recordFailedLogin(user, securityState, now);
      throw new Error('Invalid credentials');
    }

    if (securityState && (securityState.failedLoginAttempts > 0 || securityState.lockedUntil)) {
      await this.resetAccountSecurity(user, securityState, now);
    }

    const session: AuthSession = {
      id: this.createId(),
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
      mfaVerified: !requiresMfa(user)
    };

    await this.repositories.authSessions.save(session);

    const mfaChallenge = requiresMfa(user)
      ? await this.repositories.mfaChallenges.save({
          id: this.createId(),
          userId: user.id,
          createdAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + MFA_TTL_MS).toISOString()
        })
      : undefined;

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'login',
        actorUserId: user.id,
        actorRole: user.roleTier,
        entityType: 'AuthSession',
        entityId: session.id,
        scope: { scope: user.organizationId ? 'organization' : 'platform', organizationId: user.organizationId },
        beforeState: null,
        afterState: { sessionId: session.id, mfaRequired: Boolean(mfaChallenge) },
        now
      })
    );

    return { session, mfaChallenge };
  }

  async verifyMfa(input: { sessionId: UUID; challengeId: UUID; code: string }): Promise<AuthSession> {
    const session = await this.repositories.authSessions.getById(input.sessionId);
    const challenge = await this.repositories.mfaChallenges.getById(input.challengeId);

    if (!session || !challenge || challenge.userId !== session.userId) {
      throw new Error('Invalid MFA challenge');
    }

    if (session.revokedAt) {
      throw new Error('Session revoked');
    }

    const now = this.clock();

    if (Date.parse(challenge.expiresAt) < now.getTime()) {
      throw new Error('MFA challenge expired');
    }

    const verified = await this.mfaProvider.verify({ challenge, code: input.code });

    if (!verified) {
      throw new Error('Invalid MFA code');
    }

    await this.repositories.mfaChallenges.save({ ...challenge, verifiedAt: now.toISOString() });
    const verifiedSession = await this.repositories.authSessions.save({ ...session, mfaVerified: true });
    const user = await this.requireUser(session.userId);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'update',
        actorUserId: user.id,
        actorRole: user.roleTier,
        entityType: 'AuthSession',
        entityId: session.id,
        scope: { scope: user.organizationId ? 'organization' : 'platform', organizationId: user.organizationId },
        beforeState: { mfaVerified: false },
        afterState: { mfaVerified: true },
        now
      })
    );

    return verifiedSession;
  }

  async logout(sessionId: UUID): Promise<AuthSession> {
    const now = this.clock();
    const session = await this.repositories.authSessions.revoke(sessionId, now.toISOString());

    if (!session) {
      throw new Error('Session not found');
    }

    const user = await this.requireUser(session.userId);

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'logout',
        actorUserId: user.id,
        actorRole: user.roleTier,
        entityType: 'AuthSession',
        entityId: session.id,
        scope: { scope: user.organizationId ? 'organization' : 'platform', organizationId: user.organizationId },
        beforeState: { revokedAt: undefined },
        afterState: { revokedAt: session.revokedAt },
        now
      })
    );

    return session;
  }

  async requestPasswordReset(email: string): Promise<PasswordResetRequest> {
    const user = await this.repositories.users.getByEmail(email);
    const now = this.clock();

    if (!user || user.status !== 'active') {
      return {
        id: this.createId(),
        userId: PASSWORD_RESET_ANONYMOUS_USER_ID,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS).toISOString()
      };
    }

    const request = await this.repositories.passwordResets.save({
      id: this.createId(),
      userId: user.id,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS).toISOString()
    });

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'create',
        actorUserId: user.id,
        actorRole: user.roleTier,
        entityType: 'PasswordResetRequest',
        entityId: request.id,
        scope: { scope: user.organizationId ? 'organization' : 'platform', organizationId: user.organizationId },
        beforeState: null,
        afterState: { requestId: request.id },
        now
      })
    );

    return request;
  }

  async completePasswordReset(input: { requestId: UUID; newPassword: string }): Promise<void> {
    const request = await this.repositories.passwordResets.getById(input.requestId);

    if (!request || request.userId === PASSWORD_RESET_ANONYMOUS_USER_ID) {
      throw new Error('Password reset request not found');
    }

    const now = this.clock();
    if (request.usedAt) throw new Error('Password reset request already used');
    if (Date.parse(request.expiresAt) < now.getTime()) throw new Error('Password reset request expired');

    const user = await this.requireUser(request.userId);
    await this.repositories.userCredentials.save({
      userId: user.id,
      passwordHash: serializePasswordHash(hashPassword(input.newPassword)),
      updatedAt: now.toISOString()
    });
    const completed = await this.repositories.passwordResets.save({ ...request, usedAt: now.toISOString() });
    const securityState = await this.repositories.accountSecurity.getByUserId(user.id);
    if (securityState) await this.resetAccountSecurity(user, securityState, now);

    await this.repositories.auditLogs.append(createAuditEvent({
      id: this.createId(),
      action: 'update',
      actorUserId: user.id,
      actorRole: user.roleTier,
      entityType: 'PasswordResetRequest',
      entityId: completed.id,
      scope: { scope: user.organizationId ? 'organization' : 'platform', organizationId: user.organizationId },
      beforeState: { usedAt: request.usedAt },
      afterState: { usedAt: completed.usedAt },
      now
    }));
    await this.repositories.auditLogs.append(createAuditEvent({
      id: this.createId(),
      action: 'update',
      actorUserId: user.id,
      actorRole: user.roleTier,
      entityType: 'UserCredential',
      entityId: user.id,
      scope: { scope: user.organizationId ? 'organization' : 'platform', organizationId: user.organizationId },
      beforeState: { passwordHash: '[REDACTED]' },
      afterState: { passwordHash: '[REDACTED]' },
      now
    }));
  }

  private async requireUser(userId: UUID): Promise<User> {
    const user = await this.repositories.users.getById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private async recordFailedLogin(user: User, existing: AccountSecurityState | null, now: Date): Promise<void> {
    const failedLoginAttempts = (existing?.failedLoginAttempts ?? 0) + 1;
    const lockedUntil = failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS
      ? new Date(now.getTime() + ACCOUNT_LOCKOUT_MS).toISOString()
      : existing?.lockedUntil;
    const updated = await this.repositories.accountSecurity.save({
      userId: user.id,
      failedLoginAttempts,
      lockedUntil,
      lastFailedAt: now.toISOString(),
      updatedAt: now.toISOString()
    });

    await this.auditAccountSecurity(user, updated, existing, lockedUntil ? 'account_locked' : 'failed_login');
  }

  private async resetAccountSecurity(user: User, existing: AccountSecurityState, now: Date): Promise<void> {
    const updated = await this.repositories.accountSecurity.save({
      userId: user.id,
      failedLoginAttempts: 0,
      lockedUntil: undefined,
      lastFailedAt: existing.lastFailedAt,
      updatedAt: now.toISOString()
    });

    await this.auditAccountSecurity(user, updated, existing, 'account_security_reset');
  }

  private async auditAccountSecurity(
    user: User,
    afterState: AccountSecurityState,
    beforeState: AccountSecurityState | null,
    reason: string
  ): Promise<void> {
    await this.repositories.auditLogs.append(createAuditEvent({
      id: this.createId(),
      action: beforeState ? 'update' : 'create',
      actorUserId: user.id,
      actorRole: user.roleTier,
      entityType: 'AccountSecurityState',
      entityId: user.id,
      scope: { scope: user.organizationId ? 'organization' : 'platform', organizationId: user.organizationId },
      beforeState,
      afterState: { ...afterState, reason },
      now: this.clock()
    }));
  }
}

function requiresMfa(user: User): boolean {
  return ['T1', 'T2', 'T2_5', 'T3', 'EMPLOYEE'].includes(user.roleTier);
}
