import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('production readiness workflow', () => {
  it('runs regression tests and production build in CI', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');

    expect(workflow).toContain('npm ci');
    expect(workflow).toContain('npm test');
    expect(workflow).toContain('npm run build');
  });

  it('defines a static production container with health checks', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8');
    const nginxConfig = readFileSync('nginx.conf', 'utf8');

    expect(dockerfile).toContain('FROM node:22-alpine AS build');
    expect(dockerfile).toContain('FROM nginx:1.27-alpine AS runtime');
    expect(dockerfile).toContain('HEALTHCHECK');
    expect(dockerfile).toContain('/healthz');

    expect(nginxConfig).toContain('listen 8080');
    expect(nginxConfig).toContain('try_files $uri $uri/ /index.html');
    expect(nginxConfig).toContain('X-Frame-Options "DENY"');
    expect(nginxConfig).toContain('X-Content-Type-Options "nosniff"');
  });

  it('documents production deployment and remaining launch requirements', () => {
    const guide = readFileSync('docs/production-deployment.md', 'utf8');

    expect(guide).toContain('npm run verify');
    expect(guide).toContain('docker build');
    expect(guide).toContain('/healthz');
    expect(guide).toContain('HIPAA security review');
    expect(guide).toContain('Server-side tenant isolation');
  });

  it('documents security, HIPAA, and go-live governance gates', () => {
    const security = readFileSync('SECURITY.md', 'utf8');
    const backend = readFileSync('docs/backend-foundation.md', 'utf8');
    const api = readFileSync('docs/api-foundation.md', 'utf8');
    const auth = readFileSync('docs/authentication-foundation.md', 'utf8');
    const database = readFileSync('docs/database-foundation.md', 'utf8');
    const postgresAdapters = readFileSync('docs/postgres-adapters.md', 'utf8');
    const hipaa = readFileSync('docs/hipaa-security-readiness.md', 'utf8');
    const goLive = readFileSync('docs/go-live-checklist.md', 'utf8');
    const runbook = readFileSync('docs/operational-runbook.md', 'utf8');

    expect(security).toContain('Report security concerns');
    expect(security).toContain('HIPAA security review');
    expect(backend).toContain('Server-side authentication');
    expect(backend).toContain('Tenant-isolated data access');
    expect(backend).toContain('Immutable audit logs');
    expect(backend).toContain('npm run api:dev');
    expect(api).toContain('POST /auth/login');
    expect(api).toContain('src/client/api-client.ts');
    expect(api).toContain('VITE_API_BASE_URL');
    expect(api).toContain('POST /residents');
    expect(api).toContain('PATCH /residents');
    expect(api).toContain('POST /users');
    expect(api).toContain('PATCH /users');
    expect(api).toContain('POST /background-jobs');
    expect(api).toContain('POST /jobs/notifications');
    expect(api).toContain('POST /jobs/digitalrx');
    expect(api).toContain('Protected routes require a valid session');
    expect(api).toContain('Resident APIs must enforce organization and facility scope');
    expect(api).toContain('User APIs must enforce organization scope');
    expect(api).toContain('Background job APIs must enforce platform or tenant scope');
    expect(api).toContain('Typed job producer APIs enqueue notification, print, DigitalRX, AI, and workflow work');
    expect(api).toContain('Background job processors must register handlers per job type');
    expect(api).toContain('POST /tasks');
    expect(api).toContain('POST /adls');
    expect(api).toContain('POST /service-plans');
    expect(api).toContain('Protected routes require a valid session');
    expect(api).toContain('Resident APIs must enforce organization and facility scope');
    expect(api).toContain('User APIs must enforce organization scope');
    expect(api).toContain('Task, ADL, and service plan APIs must enforce resident/facility scope');
    expect(api).toContain('POST /medication-orders');
    expect(api).toContain('POST /medication-administrations');
    expect(api).toContain('Protected routes require a valid session');
    expect(api).toContain('Resident APIs must enforce organization and facility scope');
    expect(api).toContain('User APIs must enforce organization scope');
    expect(api).toContain('Medication APIs must enforce resident/facility scope');
    expect(api).toContain('OpenAPI documentation');
    expect(api).toContain('framework-agnostic dispatcher');
    expect(api).toContain('Invalid request bodies must return `400`');
    expect(api).toContain('Rate-limited requests must return `429`');
    expect(api).toContain('Request logs must redact passwords');
    expect(api).toContain('Node HTTP runtime adapter');
    expect(api).toContain('/openapi.json');
    expect(api).toContain('npm run api:dev');
    expect(auth).toContain('MFA verification');
    expect(auth).toContain('PBKDF2-SHA512 password hashing');
    expect(auth).toContain('Plain-text passwords must never be stored');
    expect(auth).toContain('Sessions must expire and be revocable');
    expect(database).toContain('PostgreSQL');
    expect(database).toContain('Tenant isolation rules');
    expect(database).toContain('`audit_logs` is append-only');
    expect(database).toContain('user credential hashes');
    expect(database).toContain('npm run db:migrate');
    expect(database).toContain('schema_migrations');
    expect(postgresAdapters).toContain('parameterized SQL builders');
    expect(postgresAdapters).toContain('row-to-domain mappers');
    expect(hipaa).toContain('Administrative safeguards');
    expect(hipaa).toContain('Technical safeguards');
    expect(goLive).toContain('Tenant isolation tests completed');
    expect(goLive).toContain('Go-live readiness certification signed');
    expect(runbook).toContain('Standard deployment');
    expect(runbook).toContain('Rollback');
  });

  it('provides environment and ownership templates without secrets', () => {
    const envExample = readFileSync('.env.example', 'utf8');
    const codeowners = readFileSync('.github/CODEOWNERS', 'utf8');
    const gitignore = readFileSync('.gitignore', 'utf8');

    expect(envExample).toContain('VITE_APP_ENV=production');
    expect(envExample).toContain('VITE_APP_SUPPORT_EMAIL=');
    expect(envExample).toContain('DEMO_AUTH_PASSWORD=change-me-for-local-demo-only');
    expect(envExample).not.toContain('Ariana');
    expect(envExample).not.toContain('sk_');
    expect(codeowners).toContain('@arion7273');
    expect(gitignore).toContain('!.env.example');
  });
});
