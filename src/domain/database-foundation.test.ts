import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const schema = readFileSync('database/migrations/0001_multitenant_foundation.sql', 'utf8');
const seed = readFileSync('database/migrations/0002_seed_permissions.sql', 'utf8');
const authSchema = readFileSync('database/migrations/0003_auth_sessions.sql', 'utf8');
const docs = readFileSync('docs/database-foundation.md', 'utf8');

describe('database foundation migrations', () => {
  it('creates core multi-tenant tables', () => {
    [
      'CREATE TABLE organizations',
      'CREATE TABLE facilities',
      'CREATE TABLE roles',
      'CREATE TABLE permissions',
      'CREATE TABLE role_permissions',
      'CREATE TABLE users',
      'CREATE TABLE user_facilities',
      'CREATE TABLE residents',
      'CREATE TABLE feature_registry',
      'CREATE TABLE audit_logs',
      'CREATE TABLE auth_sessions',
      'CREATE TABLE mfa_challenges',
      'CREATE TABLE password_reset_requests'
    ].forEach((statement) => {
      expect(`${schema}\n${authSchema}`).toContain(statement);
    });
  });

  it('includes tenant foreign keys and query indexes', () => {
    expect(schema).toContain('organization_id UUID NOT NULL REFERENCES organizations(id)');
    expect(schema).toContain('facility_id UUID NOT NULL REFERENCES facilities(id)');
    expect(schema).toContain('CREATE INDEX idx_residents_tenant');
    expect(schema).toContain('CREATE INDEX idx_audit_logs_tenant');
    expect(schema).toContain('CREATE INDEX idx_feature_registry_module');
  });

  it('documents append-only audit log expectations', () => {
    expect(schema).toContain('No UPDATE/DELETE paths should be granted for audit_logs in production.');
    expect(docs).toContain('`audit_logs` is append-only');
    expect(docs).toContain('Production database roles must not receive `UPDATE` or `DELETE` grants');
  });

  it('seeds every domain permission key', () => {
    [
      'platform:manage',
      'organization:manage',
      'facility:manage',
      'resident:read',
      'resident:write',
      'medication:manage',
      'assessment:manage',
      'billing:manage',
      'communication:manage',
      'support:manage',
      'report:read'
    ].forEach((permission) => {
      expect(seed).toContain(permission);
    });
  });
});
