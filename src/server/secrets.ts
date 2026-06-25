export type SecretPurpose = 'database-url' | 'phi-key' | 'audit-key' | 'mfa-secret' | 'integration-credential';

export type SecretProvider = {
  getSecret(name: string, purpose: SecretPurpose): Promise<string | undefined>;
};

export class EnvironmentSecretProvider implements SecretProvider {
  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  async getSecret(name: string): Promise<string | undefined> {
    return this.env[name];
  }
}

export class UnconfiguredSecretProvider implements SecretProvider {
  async getSecret(): Promise<string | undefined> {
    throw new Error('Secret provider is not configured');
  }
}
