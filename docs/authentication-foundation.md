# Authentication foundation

HubsteriaCarePRO authentication must be server-side before real production use.

## Supported workflows in domain foundation

- Login
- MFA challenge creation
- MFA verification
- Logout/session revocation
- Password reset request
- Audit events for auth actions

## Required production implementation

- Password hashes must be stored only in the backend database or identity provider.
- Plain-text passwords must never be stored.
- MFA is required for platform, organization, facility, and employee users.
- Sessions must expire and be revocable.
- Password reset requests must expire and be single-use.
- Authentication failures must not reveal whether the email exists.
- Auth events must write immutable audit logs.

## Next implementation step

Integrate an identity provider or implement secure credentials using:

- Argon2id or equivalent password hashing
- Managed secret storage
- Email-based password reset delivery
- TOTP/SMS/email MFA provider
- Rate limiting
- Suspicious-login monitoring
