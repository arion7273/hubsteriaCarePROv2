# Observability and operations readiness

HubsteriaCarePRO exposes operations hooks for staging and production readiness.

## API telemetry

- Every API response includes an `X-Request-Id` response header.
- `/healthz` reports API liveness.
- `/readyz` reports readiness checks for API and repository mode.
- `/metrics` returns placeholder metrics for API request counts, errors, latency, and background queue status.
- Structured API logs include request ID, method, path, status, duration, timestamp, and session presence.
- Error tracking is abstracted behind a placeholder capture hook for future Sentry, Datadog, Honeycomb, or cloud provider SDKs.

## Alert placeholders

Configure staging alerts for:

- API `/readyz` failure
- frontend `/healthz` failure
- API 5xx error rate
- API latency threshold breach
- background job queue backlog
- dead-letter background jobs
- failed integration sync
- audit write failures
- login failure spike

## Staging dashboard placeholders

The staging dashboard should show:

- API request volume
- API p95 latency
- API error rate
- background jobs queued, processing, failed, and dead-lettered
- Postgres connection health
- migration version
- auth failure rate
- integration failure count
- frontend availability

## Runbook links

Operational responders should start with `docs/operational-runbook.md`, then use request IDs from structured logs to connect API, job, audit, and database events.
