import { applyPendingMigrations, PgPostgresClient } from '../adapters/postgres';
import { readServerConfig } from './config';

const config = readServerConfig({
  ...process.env,
  BACKEND_REPOSITORY_MODE: 'postgres'
});

const client = new PgPostgresClient({
  connectionString: config.databaseUrl as string,
  ssl: config.databaseSsl
});

try {
  const result = await applyPendingMigrations(client);
  console.log(`Applied migrations: ${result.applied.length > 0 ? result.applied.join(', ') : 'none'}`);
  console.log(`Skipped migrations: ${result.skipped.length > 0 ? result.skipped.join(', ') : 'none'}`);
} finally {
  await client.close();
}
