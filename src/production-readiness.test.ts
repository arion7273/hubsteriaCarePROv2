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
    const hipaa = readFileSync('docs/hipaa-security-readiness.md', 'utf8');
    const goLive = readFileSync('docs/go-live-checklist.md', 'utf8');
    const runbook = readFileSync('docs/operational-runbook.md', 'utf8');

    expect(security).toContain('Report security concerns');
    expect(security).toContain('HIPAA security review');
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
    expect(envExample).not.toContain('password');
    expect(envExample).not.toContain('secret');
    expect(codeowners).toContain('@arion7273');
    expect(gitignore).toContain('!.env.example');
  });
});
