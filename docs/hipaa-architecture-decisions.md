# HIPAA architecture decisions

HubsteriaCare treats HIPAA safeguards as architectural requirements.

## PHI storage

- Resident, assessment, medication, incident, billing, ADL, service-plan, and audit payloads may contain PHI.
- Database-level encryption must be enabled by the managed PostgreSQL provider.
- Field-level encryption is represented by `PhiEncryptionService` and `EncryptionKeyProvider`; production must connect these abstractions to a managed KMS before storing high-risk PHI fields.

## PHI transmission

- All production traffic must terminate TLS before reaching the API.
- Header session IDs are bearer credentials and must be used only over TLS.
- Browser sessions use HttpOnly SameSite cookies.

## PHI access auditing

- Direct resident reads are audited.
- Medication-order access is audited as medication access.
- PHI export and print access use explicit audit helpers.
- Audit entries should store minimal metadata (`accessType`, `phi`) and avoid full PHI snapshots where possible.

## Resident-level authorization

- `FAMILY` and `RESIDENT` users may access only assigned `residentIds`.
- Facility-level access is denied for portal roles without resident scope.

## Audit immutability and retention

- `audit_logs` are append-only.
- `0013_hipaa_readiness.sql` installs update/delete prevention triggers.
- `audit_retention_policies` stores minimum retention requirements with a seven-year floor.

## Secrets management

- `SecretProvider` abstracts secret retrieval.
- Production deployments must use a managed secret store for database URLs, PHI keys, audit keys, MFA secrets, and integration credentials.
- Environment variables remain acceptable only for local development and staging placeholders.
