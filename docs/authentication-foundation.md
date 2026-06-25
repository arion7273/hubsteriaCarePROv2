# Authentication foundation

HubsteriaCarePRO authentication must be server-side before real production use.

## Supported workflows in domain foundation

- Login
- MFA challenge creation
- MFA verification
- Logout/session revocation
- Password reset request
- Password reset completion
- Account lockout after repeated failed logins
- Audit events for auth actions
- PBKDF2-SHA512 password hashing
- Repository-backed credential verification
- TOTP-ready MFA provider abstraction

## Required production implementation

- Password hashes must be stored only in `user_credentials` or a trusted identity provider.
- Plain-text passwords must never be stored.
- MFA is required for platform, organization, facility, and employee users.
- Sessions must expire and be revocable.
- Password reset requests must expire and be single-use.
- Account lockout state must be persisted and audited.
- Authentication failures must not reveal whether the email exists.
- Auth events must write immutable audit logs.
- Deployable runtimes must reject demo password/MFA unless explicitly enabled for local development.
- Browser sessions should use HttpOnly Secure SameSite cookies; header sessions are reserved for API clients.

## Next implementation step

The current foundation includes PBKDF2-SHA512 credential hashing and repository-backed verification.

Next, integrate an identity provider or complete production credential operations using:

- Argon2id or equivalent password hashing
- Managed secret storage
- Email-based password reset delivery
- Production TOTP secret enrollment and rotation
- External identity provider integration
- Suspicious-login monitoring
