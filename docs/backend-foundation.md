# Backend foundation

This document defines the next implementation direction after the UI foundation.

## Goal

Move from static prototype data to a production backend with:

- Server-side authentication
- MFA and session management
- Tenant-isolated data access
- Role-based permissions
- Immutable audit logs
- Feature registry enforcement
- Database-backed repositories

## Domain contracts

Backend-facing TypeScript contracts live in `src/domain`.

- `types.ts` defines organizations, facilities, users, roles, permissions, and scopes.
- `access-control.ts` defines tenant and permission checks.
- `audit.ts` defines immutable audit event creation.
- `feature-registry.ts` validates feature registration requirements.
- `repositories.ts` defines persistence interfaces for future database adapters.
- `in-memory-repositories.ts` provides executable in-memory adapters for tests and local service development.
- `backend-service.ts` provides tenant-safe service operations that enforce permissions and append audit events.
- `auth-service.ts` provides login, MFA verification, logout, and password reset request workflows with audit writes.
- `src/api` provides framework-agnostic API handler contracts for auth, tenant admin, and feature registry operations.
- `src/server` composes runtime services and starts the Node API server.
- `database/migrations` contains the initial PostgreSQL schema and permission seed data.

## Access rules

- T1 can access platform scope.
- T2 can access only its organization.
- T3 can access only assigned facilities.
- Employees, family members, and residents must be scoped by assigned facility/resident permissions.
- Cross-organization and cross-facility access is denied by default.

## Audit rules

All significant actions must write immutable audit records with:

- User
- Role
- Timestamp
- Entity type and ID
- Organization
- Facility
- Resident, when applicable
- Before state
- After state

## Next implementation step

The current backend foundation includes executable service-layer behavior for:

- Creating organizations
- Creating facilities
- Registering features
- Creating residents
- Reading residents
- Updating residents
- Creating users
- Listing users
- Updating users
- Authenticating users
- Creating MFA challenges
- Revoking sessions on logout
- Creating password reset requests
- Enforcing tenant scope and permissions
- Appending immutable audit events

Next, choose a backend stack and implement repository adapters:

- API routes or service layer
- PostgreSQL or equivalent relational datastore
- Authentication provider
- Migration system
- Audit log append-only table
- Tenant-scoped database queries
- Integration workers for notifications, DigitalRX, print, and AI

See `docs/database-foundation.md` for the schema, tenant query rules, and audit log persistence requirements.

## Local API runtime

For local backend development:

```bash
npm run api:dev
```

The runtime defaults to in-memory repositories unless `BACKEND_REPOSITORY_MODE=postgres` is configured.

Apply PostgreSQL migrations with:

```bash
npm run db:migrate
```
