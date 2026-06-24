# Database foundation

The initial database target is PostgreSQL.

## Migrations

- `database/migrations/0001_multitenant_foundation.sql`
  - organizations
  - facilities
  - roles
  - permissions
  - role permissions
  - users
  - user facilities
  - residents
  - feature registry
  - audit logs
  - tenant/access indexes
- `database/migrations/0002_seed_permissions.sql`
  - base permission keys aligned with `src/domain/types.ts`
- `database/migrations/0003_auth_sessions.sql`
  - auth sessions
  - MFA challenges
  - password reset requests
- `database/migrations/0007_emar_medications.sql`
  - medication orders
  - medication administrations

Run migrations with:

```bash
npm run db:migrate
```

The migration runner records applied versions in `schema_migrations`.

## Tenant isolation rules

Every production query must filter by tenant scope:

- `organization_id`
- `facility_id`
- `resident_id` when applicable

T1 platform users are the only users that may intentionally cross organization boundaries.

T2 users may query only their organization.

T3 and employee users may query only assigned facilities.

Family and resident users require resident-specific permission mapping before data access.

## Audit log rules

`audit_logs` is append-only.

Production database roles must not receive `UPDATE` or `DELETE` grants on `audit_logs`.

Audit events must include:

- action
- actor user
- actor role
- entity type
- entity ID
- organization
- facility
- resident when applicable
- before state
- after state

## Next step

Implement PostgreSQL repository adapters for `src/domain/repositories.ts`, then wire them to an API layer.

See `docs/postgres-adapters.md` for the statement builders and row mappers that should be used by concrete PostgreSQL repository classes.

## Authentication persistence rules

- Sessions must expire.
- Sessions must be revocable on logout.
- MFA challenges must expire.
- Password reset requests must expire and be single-use.
- Login, MFA verification, logout, and password reset requests must create audit records.
