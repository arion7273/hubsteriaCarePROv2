import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

export type PasswordHashRecord = {
  algorithm: 'pbkdf2-sha512';
  iterations: number;
  salt: string;
  hash: string;
};

export type PasswordHashOptions = {
  iterations?: number;
  saltBytes?: number;
  keyLength?: number;
};

const DEFAULT_ITERATIONS = 210_000;
const DEFAULT_SALT_BYTES = 32;
const DEFAULT_KEY_LENGTH = 64;

export function hashPassword(password: string, options: PasswordHashOptions = {}): PasswordHashRecord {
  assertPassword(password);
  const iterations = options.iterations ?? DEFAULT_ITERATIONS;
  const salt = randomBytes(options.saltBytes ?? DEFAULT_SALT_BYTES);
  const hash = pbkdf2Sync(password, salt, iterations, options.keyLength ?? DEFAULT_KEY_LENGTH, 'sha512');

  return {
    algorithm: 'pbkdf2-sha512',
    iterations,
    salt: salt.toString('base64'),
    hash: hash.toString('base64')
  };
}

export function verifyPassword(password: string, record: PasswordHashRecord): boolean {
  assertPassword(password);

  if (record.algorithm !== 'pbkdf2-sha512') {
    return false;
  }

  const salt = Buffer.from(record.salt, 'base64');
  const expected = Buffer.from(record.hash, 'base64');
  const actual = pbkdf2Sync(password, salt, record.iterations, expected.length, 'sha512');

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function serializePasswordHash(record: PasswordHashRecord): string {
  return [record.algorithm, record.iterations, record.salt, record.hash].join('$');
}

export function parsePasswordHash(serialized: string): PasswordHashRecord {
  const [algorithm, iterations, salt, hash] = serialized.split('$');

  if (algorithm !== 'pbkdf2-sha512' || !iterations || !salt || !hash) {
    throw new Error('Invalid password hash format');
  }

  return {
    algorithm,
    iterations: Number(iterations),
    salt,
    hash
  };
}

function assertPassword(password: string): void {
  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters');
  }
}
