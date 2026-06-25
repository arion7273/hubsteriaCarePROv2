import { createHmac, timingSafeEqual } from 'node:crypto';
import type { MfaChallenge, UUID } from './types';
import type { MfaProvider } from './auth-service';

export type TotpSecretProvider = (userId: UUID) => Promise<string | undefined> | string | undefined;

export class TotpMfaProvider implements MfaProvider {
  constructor(
    private readonly secretForUser: TotpSecretProvider,
    private readonly options: { digits?: number; periodSeconds?: number; window?: number; now?: () => Date } = {}
  ) {}

  async verify(input: { challenge: MfaChallenge; code: string }): Promise<boolean> {
    const secret = await this.secretForUser(input.challenge.userId);
    if (!secret) return false;

    const digits = this.options.digits ?? 6;
    const periodSeconds = this.options.periodSeconds ?? 30;
    const window = this.options.window ?? 1;
    const now = Math.floor((this.options.now?.() ?? new Date()).getTime() / 1000 / periodSeconds);

    return Array.from({ length: window * 2 + 1 }, (_, index) => now + index - window).some((counter) =>
      safeEqual(input.code, generateTotp(secret, counter, digits))
    );
  }
}

export class UnconfiguredMfaProvider implements MfaProvider {
  async verify(): Promise<boolean> {
    throw new Error('MFA provider is not configured');
  }
}

function generateTotp(base32Secret: string, counter: number, digits: number): string {
  const key = decodeBase32(base32Secret);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(binary % 10 ** digits).padStart(digits, '0');
}

function decodeBase32(secret: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const normalized = secret.replace(/=+$/g, '').replace(/\s+/g, '').toUpperCase();
  let bits = '';

  for (const char of normalized) {
    const value = alphabet.indexOf(char);
    if (value === -1) throw new Error('Invalid TOTP secret');
    bits += value.toString(2).padStart(5, '0');
  }

  const bytes = bits.match(/.{1,8}/g)?.filter((byte) => byte.length === 8).map((byte) => Number.parseInt(byte, 2)) ?? [];
  return Buffer.from(bytes);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
