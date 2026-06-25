# Session cookie and token strategy

HubsteriaCarePRO supports two session transport mechanisms:

- Browser sessions use an HttpOnly SameSite session cookie set by the API login response.
- Non-browser API clients may continue to use the `X-Session-Id` header.

## Browser session requirements

- Cookies must be `HttpOnly`.
- Cookies must be `SameSite=Strict`.
- Cookies must be `Secure` in deployed environments.
- Logout clears the session cookie and revokes the server-side session.
- UI code must not persist session IDs in localStorage or display session IDs.

## API client session requirements

- Header-based sessions are bearer credentials and must be sent only over TLS.
- Session IDs must never be logged.
- Expired, revoked, or non-MFA-verified sessions must be rejected by protected routes.

## Remaining production work

- Add session rotation after MFA.
- Add device/session inventory and user self-service revocation.
- Bind CSRF tokens to cookie-backed sessions for unsafe browser requests.
