# HubsteriaCarePRO production deployment guide

This repository currently ships a static React/Vite product shell. The production artifact is a compiled static bundle served by nginx.

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
```

## Container run

```bash
docker run --rm -p 8080:8080 hubsteria-care-pro:latest
```

Health check:

```bash
curl http://localhost:8080/healthz
```

Expected response:

```text
ok
```

## Runtime hardening included

- Static asset caching
- SPA fallback routing
- `/healthz` endpoint
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
