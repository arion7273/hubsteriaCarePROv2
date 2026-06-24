import { describe, expect, it } from 'vitest';
import {
  CredentialService,
  RepositoryPasswordVerifier,
  createInMemoryBackendRepositories,
  hashPassword,
  parsePasswordHash,
  serializePasswordHash,
  verifyPassword,
  type User
} from '.';

const t1User: User = {
  id: 'user-master',
  email: 'b094650@gmail.com',
  roleTier: 'T1',
  facilityIds: [],
  permissions: [],
  status: 'active'
};

const employeeUser: User = {
  id: 'user-employee',
  email: 'employee@example.com',
  roleTier: 'EMPLOYEE',
  organizationId: 'org-1',
  facilityIds: ['facility-1'],
  permissions: ['resident:read'],
  status: 'active'
};

describe('password hashing', () => {
  it('hashes, serializes, parses, and verifies passwords', () => {
    const hash = hashPassword('correct-horse-password', { iterations: 1_000 });
    const serialized = serializePasswordHash(hash);
    const parsed = parsePasswordHash(serialized);

    expect(parsed.algorithm).toBe('pbkdf2-sha512');
    expect(verifyPassword('correct-horse-password', parsed)).toBe(true);
    expect(verifyPassword('wrong-horse-password', parsed)).toBe(false);
    expect(serialized).not.toContain('correct-horse-password');
  });

  it('uses unique salts for repeated password hashes', () => {
    const first = hashPassword('correct-horse-password', { iterations: 1_000 });
    const second = hashPassword('correct-horse-password', { iterations: 1_000 });

    expect(first.salt).not.toBe(second.salt);
    expect(first.hash).not.toBe(second.hash);
  });

  it('rejects short passwords', () => {
    expect(() => hashPassword('short')).toThrow('Password must be at least 12 characters');
  });
});

describe('credential service', () => {
  it('stores only password hashes and verifies through repository-backed verifier', async () => {
    const repositories = createInMemoryBackendRepositories();
    await repositories.users.save(t1User);
    await repositories.users.save(employeeUser);
    const service = new CredentialService(
      repositories,
      () => 'audit-credential',
      () => new Date('2026-06-24T01:00:00.000Z')
    );

    await service.setPassword({ user: t1User }, employeeUser.id, 'correct-horse-password');
    const credential = await repositories.userCredentials.getByUserId(employeeUser.id);

    expect(credential?.passwordHash).toContain('pbkdf2-sha512');
    expect(credential?.passwordHash).not.toContain('correct-horse-password');
    await expect(repositories.auditLogs.listByEntity('UserCredential', employeeUser.id)).resolves.toHaveLength(1);

    const verifier = new RepositoryPasswordVerifier(repositories);
    await expect(verifier.verify({ user: employeeUser, password: 'correct-horse-password' })).resolves.toBe(true);
    await expect(verifier.verify({ user: employeeUser, password: 'wrong-horse-password' })).resolves.toBe(false);
  });
});
