# Operational runbook

## Standard deployment

1. Confirm release branch is up to date.
2. Run `npm ci`.
3. Run `npm run verify`.
4. Build the frontend and API production containers.
5. Run container health checks against `/healthz`.
6. Promote artifact to staging.
7. Run `docker compose -f compose.staging.yml up --build` for staging validation.
8. Complete smoke test.
9. Promote artifact to production after approval.

## Smoke test

- Load root page.
- Confirm responsive layout on desktop and mobile viewport.
- Confirm navigation anchors work.
- Confirm global search accepts input.
- Confirm frontend `/healthz` returns `ok`.
- Confirm API `/healthz` returns `{"ok":true}`.
- Confirm staging compose services report healthy.

## Rollback

1. Identify last healthy production artifact.
2. Stop current rollout.
3. Restore previous artifact.
4. Validate `/healthz`.
5. Confirm API and frontend health checks.
6. Run smoke test.
7. Notify stakeholders.
8. Open incident review.

## Incident response

1. Triage severity.
2. Assign incident commander.
3. Preserve logs and audit context.
4. Communicate status internally.
5. Mitigate user impact.
6. Resolve or roll back.
7. Complete post-incident review.

## Required observability before go-live

- Application availability.
- Client-side error rate.
- API error rate.
- Queue backlog.
- Background job failures.
- Slow queries.
- Authentication failures.
- Audit write failures.
- Integration failures.
- Monitoring endpoint delivery.
- Error tracking event delivery.

## Alert routing

- Page on API `/readyz` failure for more than two checks.
- Page on frontend `/healthz` failure for more than two checks.
- Alert on API 5xx rate spike.
- Alert on p95 latency threshold breach.
- Alert on background queue backlog or dead-letter jobs.
- Alert on audit write failures.
- Alert on authentication failure spikes.

Use the `X-Request-Id` value from API responses and structured logs as the primary incident correlation key.
