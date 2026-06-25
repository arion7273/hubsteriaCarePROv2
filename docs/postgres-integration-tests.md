# PostgreSQL integration tests

The CI workflow starts a PostgreSQL service database, applies all SQL migrations, seeds deterministic role IDs, and then runs repository plus API integration tests against the real database.

## CI flow

The GitHub Actions workflow:

1. Starts `postgres:16`.
2. Installs dependencies with `npm ci`.
3. Runs the standard regression suite with `npm test`.
4. Runs migrations with `npm run db:migrate`.
5. Runs real database integration tests with `npm run test:postgres`.
6. Builds the production bundle.

## Local run

Set:

```bash
BACKEND_REPOSITORY_MODE=postgres
DATABASE_URL=postgres://user:password@localhost:5432/hubsteria_test
TEST_DATABASE_URL=postgres://user:password@localhost:5432/hubsteria_test
RUN_POSTGRES_INTEGRATION=true
```

Then run:

```bash
npm run db:migrate
npm run test:postgres
```

The integration suite expects migrated schema, seeds the role rows it needs, and verifies concrete PostgreSQL repositories plus protected API routes through the framework-agnostic router.
