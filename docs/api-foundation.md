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

## Next implementation step

Mount these handlers into a real HTTP runtime and add:

- request validation
- rate limiting
- CSRF protection if cookie sessions are used
- production logging
- OpenAPI documentation
- integration tests against a test database
