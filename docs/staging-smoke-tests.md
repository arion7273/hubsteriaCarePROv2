# Staging smoke tests

The staging smoke suite verifies the compose stack end to end with real PostgreSQL, the API container, and the frontend container.

## Start staging

```bash
docker compose -f compose.staging.yml up --build
```

The compose stack runs:

- PostgreSQL
- migration job
- API health check at `http://localhost:3000/healthz`
- frontend health check at `http://localhost:8080/healthz`

## Run smoke tests

In another terminal, run:

```bash
RUN_STAGING_SMOKE=true \
STAGING_DATABASE_URL=postgres://hubsteria:hubsteria-staging-password@localhost:5432/hubsteria_staging \
STAGING_API_BASE_URL=http://localhost:3000 \
STAGING_FRONTEND_BASE_URL=http://localhost:8080 \
npm run test:staging-smoke
```

The test applies pending migrations, seeds role rows and a smoke-test admin user, then verifies:

- frontend and API health
- login, MFA, and logout
- organization, facility, and resident CRUD
- assessment, task, eMAR, incident, and billing API writes
- background job producer endpoint
- operational record endpoint

The smoke test is skipped unless `RUN_STAGING_SMOKE=true` is set.
