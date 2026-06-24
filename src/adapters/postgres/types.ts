export type SqlStatement<TValue = unknown> = {
  text: string;
  values: TValue[];
};

export type PostgresRow = Record<string, unknown>;

export type QueryResult<TRow extends PostgresRow = PostgresRow> = {
  rows: TRow[];
};

export interface PostgresClient {
  query<TRow extends PostgresRow = PostgresRow>(statement: SqlStatement): Promise<QueryResult<TRow>>;
}
