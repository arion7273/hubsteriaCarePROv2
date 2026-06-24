# API foundation

The current API layer is framework-agnostic. It defines handler contracts that can be mounted into Express, Fastify, Next.js, serverless functions, or another HTTP adapter later.

## API contracts

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

## Initial routes

- `POST /auth/login`
- `POST /auth/mfa/verify`
- `POST /auth/logout`
- `POST /auth/password-reset`
- `POST /organizations`
- `POST /facilities`
- `POST /feature-registry`
- `GET /feature-registry`

## Security requirements

- Protected routes require a valid session.
- Administrative protected routes require MFA verification.
- API handlers resolve `AccessContext` from the session.
- Domain services enforce tenant scope and permissions.
- Domain services write audit events for significant actions.
- Invalid login must return a generic invalid credentials response.
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
