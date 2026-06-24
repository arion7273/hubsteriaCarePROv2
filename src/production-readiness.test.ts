import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('production readiness workflow', () => {
  it('runs regression tests and production build in CI', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');

    expect(workflow).toContain('npm ci');
    expect(workflow).toContain('npm test');
    expect(workflow).toContain('npm run build');
  });
});
