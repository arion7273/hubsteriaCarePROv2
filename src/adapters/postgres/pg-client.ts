import pg from 'pg';
import type { PostgresClient, PostgresRow, QueryResult, SqlStatement } from './types';

const { Pool } = pg;

export type PgClientOptions = {
  connectionString: string;
  ssl?: boolean;
};

export class PgPostgresClient implements PostgresClient {
  private readonly pool: pg.Pool;

  constructor(options: PgClientOptions) {
    this.pool = new Pool({
      connectionString: options.connectionString,
      ssl: options.ssl ? { rejectUnauthorized: true } : undefined
    });
  }

  async query<TRow extends PostgresRow = PostgresRow>(statement: SqlStatement): Promise<QueryResult<TRow>> {
    const result = await this.pool.query<TRow>(statement.text, statement.values);
    return { rows: result.rows };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
