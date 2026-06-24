# Session cookie and token strategy

HubsteriaCarePRO currently supports API session IDs through the `X-Session-Id` header. Production deployments must treat session IDs as bearer credentials.

## API session rules

- Sessions must expire.
- Logout must revoke sessions server-side.
- Protected routes must reject missing, expired, revoked, or non-MFA-verified sessions.
- Session IDs must never be logged.
- Request logs must redact passwords, MFA codes, tokens, API keys, secrets, and PHI fields.

## Browser storage strategy

For production browser deployments, prefer secure, HTTP-only, same-site cookies managed by the API edge or identity provider.

If header-based sessions are used temporarily:

- Store only short-lived session IDs.
- Clear session state on logout.
- Show session expiration to users.
- Use CSRF protection for cookie-backed unsafe requests.
- Use CORS allowlists for browser origins.

## Hardening controls

- API responses include security headers.
- CORS is allowlist-based.
- Request bodies are size-limited.
- Auth routes have stricter rate limits than general API routes.
- PHI-safe request logging redacts resident names, room, diagnoses, medication names, tokens, codes, and secrets.
