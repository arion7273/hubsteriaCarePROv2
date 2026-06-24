import { createAuditEvent } from './audit';
import { hashPassword, verifyPassword, parsePasswordHash, serializePasswordHash } from './password-hashing';
import type { BackendRepositories } from './repositories';
import type { Clock, IdFactory } from './backend-service';
import type { AccessContext, User, UUID } from './types';
import type { PasswordVerifier } from './auth-service';
import { requirePermission } from './access-control';

export class CredentialService {
  constructor(
    private readonly repositories: BackendRepositories,
    private readonly createId: IdFactory,
    private readonly clock: Clock = () => new Date()
  ) {}

  async setPassword(context: AccessContext, userId: UUID, password: string): Promise<void> {
    const user = await this.repositories.users.getById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const decision = requirePermission(
      context,
      user.organizationId ? { scope: 'organization', organizationId: user.organizationId } : { scope: 'platform' },
      user.organizationId ? 'organization:manage' : 'platform:manage'
    );

    if (!decision.allowed) {
      throw new Error(decision.reason);
    }

    await this.repositories.userCredentials.save({
      userId,
      passwordHash: serializePasswordHash(hashPassword(password)),
      updatedAt: this.clock().toISOString()
    });

    await this.repositories.auditLogs.append(
      createAuditEvent({
        id: this.createId(),
        action: 'update',
        actorUserId: context.user.id,
        actorRole: context.user.roleTier,
        entityType: 'UserCredential',
        entityId: userId,
        scope: user.organizationId ? { scope: 'organization', organizationId: user.organizationId } : { scope: 'platform' },
        beforeState: { passwordHash: '[REDACTED]' },
        afterState: { passwordHash: '[REDACTED]' },
        now: this.clock()
      })
    );
  }
}

export class RepositoryPasswordVerifier implements PasswordVerifier {
  constructor(private readonly repositories: BackendRepositories) {}

  async verify(input: { user: User; password: string }): Promise<boolean> {
    const credential = await this.repositories.userCredentials.getByUserId(input.user.id);

    if (!credential) {
      return false;
    }

    return verifyPassword(input.password, parsePasswordHash(credential.passwordHash));
  }
}
