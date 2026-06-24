export type SqlStatement<TValue = unknown> = {
  text: string;
  values: TValue[];
};

export type PostgresRow = Record<string, unknown>;
