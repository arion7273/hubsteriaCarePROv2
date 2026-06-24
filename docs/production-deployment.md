# HubsteriaCarePRO production deployment guide

This repository ships a static React/Vite product shell and a Node API runtime. The frontend artifact is a compiled static bundle served by nginx. The API artifact runs the framework-agnostic Node server with repository-backed services.

## Local verification

Run the complete local gate before deployment:

```bash
npm ci
npm run verify
```

`npm run verify` runs:

- Regression tests
- TypeScript production build
- Vite production bundle

## Container build

```bash
docker build -t hubsteria-care-pro:latest .
docker build --target api-runtime -t hubsteria-care-pro-api:latest .
```

## Container run

```bash
docker run --rm -p 8080:8080 hubsteria-care-pro:latest
docker run --rm -p 3000:3000 --env-file .env hubsteria-care-pro-api:latest
```

Health check:

```bash
curl http://localhost:8080/healthz
curl http://localhost:3000/healthz
```

Expected response:

```text
ok
{"ok":true}
```

## Staging compose stack

Use the staging compose file to run frontend, API, and PostgreSQL together:

```bash
docker compose -f compose.staging.yml up --build
```

The stack includes:

- `postgres` with a persistent volume and `pg_isready` health check
- `migrate` one-shot service running `npm run db:migrate`
- `api` built from the `api-runtime` Docker target with `/healthz`
- `frontend` built from the nginx `runtime` target with `/healthz`

## Environment configuration

Set staging and production values through environment variables:

- `VITE_API_BASE_URL`
- `BACKEND_REPOSITORY_MODE=postgres`
- `DATABASE_URL`
- `DATABASE_SSL`
- `ROLE_ID_T1`, `ROLE_ID_T2`, `ROLE_ID_T2_5`, `ROLE_ID_T3`, `ROLE_ID_EMPLOYEE`, `ROLE_ID_FAMILY`, `ROLE_ID_RESIDENT`
- `MONITORING_ENDPOINT`
- `ERROR_TRACKING_DSN`
- `RELEASE_VERSION`

Monitoring and error tracking placeholders are intentionally environment-driven. Replace the placeholder endpoints with the chosen observability provider before production launch.

## Runtime hardening included

- Static asset caching
- SPA fallback routing
- `/healthz` endpoint
- API container health checks
- Staging compose health checks
- Monitoring and error tracking placeholders
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Restrictive `Permissions-Policy`

## Still required before real production launch

- Backend/API services
- Database persistence
- Server-side authentication, MFA, sessions, and RBAC
- Server-side tenant isolation
- Immutable audit log storage
- Secrets management
- HIPAA security review
- Penetration testing
- Backup and disaster recovery validation
- Monitoring and error tracking
- Real DigitalRX, SMS, email, push, FHIR/HL7 integrations
