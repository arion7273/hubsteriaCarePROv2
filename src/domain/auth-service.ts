import { createAuditEvent } from './audit';
import type { BackendRepositories } from './repositories';
import type { AuthSession, MfaChallenge, PasswordResetRequest, User, UUID } from './types';

export type PasswordVerifier = {
  verify(input: { user: User; password: string }): Promise<boolean>;
};

export type MfaVerifier = {
  verify(input: { challenge: MfaChallenge; code: string }): Promise<boolean>;
};

export type AuthClock = () => Date;
export type AuthIdFactory = () => UUID;

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MFA_TTL_MS = 10 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export class AuthService {
  constructor(
    private readonly repositories: BackendRepositories,
    private readonly passwordVerifier: PasswordVerifier,
    private readonly mfaVerifier: MfaVerifier,
    private readonly createId: AuthIdFactory,
    private readonly clock: AuthClock = () => new Date()
  ) {}

  async login(input: { email: string; password: string }): Promise<{ session: AuthSession; mfaChallenge?: MfaChallenge }> {
    const user = await this.repositories.users.getByEmail(input.email);

    if (!user || user.status !== 'active') {
      throw new Error('Invalid credentials');
    }

    const passwordValid = await this.passwordVerifier.verify({ user, password: input.password });

    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    const now = this.clock();
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

    const verified = await this.mfaVerifier.verify({ challenge, code: input.code });

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

    if (!user || user.status !== 'active') {
      throw new Error('User not found');
    }

    const now = this.clock();
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

  private async requireUser(userId: UUID): Promise<User> {
    const user = await this.repositories.users.getById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

function requiresMfa(user: User): boolean {
  return ['T1', 'T2', 'T2_5', 'T3', 'EMPLOYEE'].includes(user.roleTier);
}
