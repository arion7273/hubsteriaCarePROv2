# Security policy

## Reporting vulnerabilities

Do not open public issues for suspected vulnerabilities.

Report security concerns to the repository owner or the configured security contact before disclosure.

## Security expectations before production launch

- Server-side authentication, MFA, session management, and RBAC are required.
- Tenant isolation must be enforced on the server and validated with automated tests.
- PHI/PII must be encrypted in transit and at rest.
- All significant actions must produce immutable audit records.
- Secrets must be stored in a managed secret store, never in source control.
- HIPAA security review and penetration testing are required before go-live.
- Backup restoration and disaster recovery drills are required before go-live.

## Supported versions

This project is currently a pre-production foundation prototype. Production support begins only after formal release candidate signoff.
