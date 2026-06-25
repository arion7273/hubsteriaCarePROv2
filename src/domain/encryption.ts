export type KeyPurpose = 'phi' | 'audit' | 'integration-secret';

export type EncryptionKeyProvider = {
  getKey(purpose: KeyPurpose): Promise<CryptoKeyMaterial>;
};

export type CryptoKeyMaterial = {
  keyId: string;
  algorithm: 'external-kms' | 'aes-256-gcm';
};

export type PhiEncryptionService = {
  encryptField(input: { purpose: KeyPurpose; plaintext: string }): Promise<{ keyId: string; ciphertext: string }>;
  decryptField(input: { purpose: KeyPurpose; keyId: string; ciphertext: string }): Promise<string>;
};

export class UnconfiguredPhiEncryptionService implements PhiEncryptionService {
  async encryptField(): Promise<{ keyId: string; ciphertext: string }> {
    throw new Error('PHI encryption service is not configured');
  }

  async decryptField(): Promise<string> {
    throw new Error('PHI encryption service is not configured');
  }
}
