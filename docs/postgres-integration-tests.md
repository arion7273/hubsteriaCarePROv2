# PostgreSQL integration tests

The repository includes optional integration tests that run against a real PostgreSQL database.

They are skipped by default so local/CI verification can run without a database.

## Required environment

```bash
RUN_POSTGRES_INTEGRATION=true
TEST_DATABASE_URL=postgres://user:password@host:5432/database
TEST_DATABASE_SSL=false
TEST_ROLE_ID_T1=<existing-role-id>
TEST_ROLE_ID_T2=<existing-role-id>
TEST_ROLE_ID_T2_5=<existing-role-id>
TEST_ROLE_ID_T3=<existing-role-id>
TEST_ROLE_ID_EMPLOYEE=<existing-role-id>
TEST_ROLE_ID_FAMILY=<existing-role-id>
TEST_ROLE_ID_RESIDENT=<existing-role-id>
```

The role IDs must exist in the test database because user persistence references `roles(id)`.

## Run

```bash
npm run test:integration
```

The integration test applies pending migrations, creates tenant records through the service layer, verifies repository-backed password credentials, and confirms audit persistence.

## Recommended CI setup

Add a PostgreSQL service container in CI and run:

```bash
npm run db:migrate
npm run test:integration
```
