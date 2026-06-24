# API foundation

The current API layer is framework-agnostic. It defines handler contracts that can be mounted into Express, Fastify, Next.js, serverless functions, or another HTTP adapter later.

## API contracts

- `src/client/api-client.ts`
  - typed browser client for UI-to-API calls
  - uses `VITE_API_BASE_URL`
  - supports auth, resident, and user API operations
- `src/api/http.ts`
  - request envelope
  - response envelope
  - error mapping
- `src/api/handlers.ts`
  - auth handlers
  - organization/facility handlers
  - feature registry handlers
  - session-to-access-context resolution
- `src/api/routes.ts`
  - route manifest and auth requirements
- `src/api/router.ts`
  - framework-agnostic dispatcher
  - method/path matching
  - 404/405 responses
- `src/api/validation.ts`
  - request body validation for current routes
- `src/api/openapi.ts`
  - initial OpenAPI 3.1 API contract
- `src/api/middleware.ts`
  - request ID middleware
  - rate limiting middleware
  - CSRF middleware for cookie-backed unsafe requests
  - redacted request logging
- `src/api/node-server.ts`
  - Node HTTP runtime adapter
  - `/healthz` endpoint
  - `/openapi.json` endpoint
  - JSON parsing and error responses
- `src/server/index.ts`
  - executable backend entrypoint
  - memory/PostgreSQL service composition

## Initial routes

- `POST /auth/login`
- `POST /auth/mfa/verify`
- `POST /auth/logout`
- `POST /auth/password-reset`
- `POST /organizations`
- `POST /facilities`
- `POST /feature-registry`
- `GET /feature-registry`
- `POST /residents`
- `GET /residents`
- `GET /residents/get`
- `PATCH /residents`
- `POST /users`
- `GET /users`
- `PATCH /users`
- `POST /background-jobs`
- `GET /background-jobs`
- `POST /background-jobs/lease`
- `PATCH /background-jobs/complete`
- `PATCH /background-jobs/fail`
- `POST /jobs/notifications`
- `POST /jobs/print`
- `POST /jobs/digitalrx`
- `POST /jobs/ai`
- `POST /jobs/workflow-actions`
- `POST /operational-records`
- `GET /operational-records`
- `GET /operational-records/get`
- `PATCH /operational-records`

## Security requirements

- Protected routes require a valid session.
- Administrative protected routes require MFA verification.
- API handlers resolve `AccessContext` from the session.
- Domain services enforce tenant scope and permissions.
- Domain services write audit events for significant actions.
- Invalid login must return a generic invalid credentials response.
- Resident APIs must enforce organization and facility scope.
- User APIs must enforce organization scope and administrative permissions.
- Background job APIs must enforce platform or tenant scope depending on job ownership.
- Typed job producer APIs enqueue notification, print, DigitalRX, AI, and workflow work into the shared background queue.
- Operational record APIs provide a tenant-scoped ledger for notification, print, DigitalRX, workflow, AI, and integration activity.
- Background job processors must register handlers per job type and dead-letter jobs that cannot be handled after retries.
- Invalid request bodies must return `400`.
- Wrong methods must return `405`.
- Unknown routes must return `404`.
- Rate-limited requests must return `429`.
- Cookie-backed unsafe requests must include a CSRF token.
- Request logs must redact passwords, MFA codes, tokens, API keys, and secrets.

## Next implementation step

Mount these handlers into a real HTTP runtime and add:

- production logging
- generated OpenAPI documentation publishing
- integration tests against a test database

The Node HTTP adapter is available as a dependency-free starting point for the deployable backend service.

Run the current backend API in development:

```bash
npm run api:dev
```
