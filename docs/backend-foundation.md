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

Choose a backend stack and implement repository adapters:

- API routes or service layer
- PostgreSQL or equivalent relational datastore
- Authentication provider
- Migration system
- Audit log append-only table
- Tenant-scoped database queries
- Integration workers for notifications, DigitalRX, print, and AI
