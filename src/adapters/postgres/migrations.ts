import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { PostgresClient, SqlStatement } from './types';

export type MigrationFile = {
  version: string;
  path: string;
  sql: string;
};

export type MigrationResult = {
  applied: string[];
  skipped: string[];
};

export function loadMigrationFiles(directory = 'database/migrations'): MigrationFile[] {
  return readdirSync(directory)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => ({
      version: basename(file, '.sql'),
      path: join(directory, file),
      sql: readFileSync(join(directory, file), 'utf8')
    }));
}

export async function ensureSchemaMigrations(client: PostgresClient): Promise<void> {
  await client.query({
    text: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `,
    values: []
  });
}

export async function listAppliedMigrations(client: PostgresClient): Promise<Set<string>> {
  const result = await client.query<{ version: string }>({
    text: 'SELECT version FROM schema_migrations ORDER BY version',
    values: []
  });

  return new Set(result.rows.map((row) => row.version));
}

export async function applyPendingMigrations(
  client: PostgresClient,
  migrations = loadMigrationFiles()
): Promise<MigrationResult> {
  await ensureSchemaMigrations(client);
  const applied = await listAppliedMigrations(client);
  const result: MigrationResult = {
    applied: [],
    skipped: []
  };

  for (const migration of migrations) {
    if (applied.has(migration.version)) {
      result.skipped.push(migration.version);
      continue;
    }

    await client.query(wrapMigration(migration));
    result.applied.push(migration.version);
  }

  return result;
}

function wrapMigration(migration: MigrationFile): SqlStatement {
  return {
    text: `
      BEGIN;
      ${migration.sql}
      INSERT INTO schema_migrations (version) VALUES ($1);
      COMMIT;
    `,
    values: [migration.version]
  };
}
