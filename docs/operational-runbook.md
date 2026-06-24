# Operational runbook

## Standard deployment

1. Confirm release branch is up to date.
2. Run `npm ci`.
3. Run `npm run verify`.
4. Build the production container.
5. Run container health check against `/healthz`.
6. Promote artifact to staging.
7. Complete smoke test.
8. Promote artifact to production after approval.

## Smoke test

- Load root page.
- Confirm responsive layout on desktop and mobile viewport.
- Confirm navigation anchors work.
- Confirm global search accepts input.
- Confirm `/healthz` returns `ok`.

## Rollback

1. Identify last healthy production artifact.
2. Stop current rollout.
3. Restore previous artifact.
4. Validate `/healthz`.
5. Run smoke test.
6. Notify stakeholders.
7. Open incident review.

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
