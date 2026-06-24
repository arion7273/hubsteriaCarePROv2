# PostgreSQL adapter foundation

The repository now includes PostgreSQL adapter helpers without binding to a specific database client.

## Files

- `src/adapters/postgres/types.ts`
  - SQL statement shape
  - generic row shape
- `src/adapters/postgres/statements.ts`
  - parameterized SQL builders for organizations, facilities, users, feature registry, and audit logs
- `src/adapters/postgres/mappers.ts`
  - row-to-domain mappers
- `src/adapters/postgres/repositories.ts`
  - concrete repository classes using a generic PostgreSQL client

## Rules

- All write/read statements use parameter placeholders.
- Tenant-scoped list queries must filter by `organization_id` and/or `facility_id`.
- Audit log adapter behavior is append-only.
- JSON states and feature dependencies are serialized before database writes.
- User queries join roles, facilities, and permissions to build an access context.
- Repository classes return domain objects and keep SQL execution behind `src/domain/repositories.ts` interfaces.

## Next step

Choose a PostgreSQL client, such as `pg`, and pass it into the concrete repository classes through the generic `PostgresClient` interface.
