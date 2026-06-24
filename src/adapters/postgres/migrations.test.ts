import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { applyPendingMigrations, loadMigrationFiles, type PostgresClient, type PostgresRow, type SqlStatement } from '.';

class FakeMigrationClient implements PostgresClient {
  statements: SqlStatement[] = [];

  constructor(private readonly appliedVersions: string[] = []) {}

  async query<TRow extends PostgresRow = PostgresRow>(statement: SqlStatement) {
    this.statements.push(statement);

    if (statement.text.includes('SELECT version FROM schema_migrations')) {
      return {
        rows: this.appliedVersions.map((version) => ({ version })) as unknown as TRow[]
      };
    }

    return { rows: [] as TRow[] };
  }
}

describe('Postgres migration runner', () => {
  it('loads SQL migration files in deterministic order', () => {
    const directory = mkdtempSync(join(tmpdir(), 'hubsteria-migrations-'));

    try {
      writeFileSync(join(directory, '0002_second.sql'), 'SELECT 2;');
      writeFileSync(join(directory, '0001_first.sql'), 'SELECT 1;');
      writeFileSync(join(directory, 'README.md'), 'ignore');

      expect(loadMigrationFiles(directory).map((migration) => migration.version)).toEqual(['0001_first', '0002_second']);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('applies pending migrations and skips previously applied versions', async () => {
    const client = new FakeMigrationClient(['0001_first']);
    const result = await applyPendingMigrations(client, [
      {
        version: '0001_first',
        path: '0001_first.sql',
        sql: 'SELECT 1;'
      },
      {
        version: '0002_second',
        path: '0002_second.sql',
        sql: 'SELECT 2;'
      }
    ]);

    expect(result).toEqual({
      applied: ['0002_second'],
      skipped: ['0001_first']
    });
    expect(client.statements[0].text).toContain('CREATE TABLE IF NOT EXISTS schema_migrations');
    expect(client.statements[2].text).toContain('BEGIN;');
    expect(client.statements[2].text).toContain('SELECT 2;');
    expect(client.statements[2].text).toContain('INSERT INTO schema_migrations (version) VALUES ($1);');
    expect(client.statements[2].text).toContain('COMMIT;');
    expect(client.statements[2].values).toEqual(['0002_second']);
  });
});
