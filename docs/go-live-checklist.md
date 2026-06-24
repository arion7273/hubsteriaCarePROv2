# Go-live readiness checklist

Use this checklist before moving HubsteriaCarePRO into real production use.

## Product and engineering gates

- CI passes on the release branch.
- Regression tests pass.
- Production build passes.
- Container image builds successfully.
- Health check endpoint returns success.
- Rollback plan is documented.
- Release candidate has stakeholder signoff.

## Security and compliance gates

- HIPAA security review completed.
- Penetration test completed.
- Tenant isolation tests completed.
- RBAC tests completed.
- Audit immutability validated.
- Encryption at rest and in transit validated.
- Secrets management validated.

## Operations gates

- Monitoring is configured.
- Error tracking is configured.
- Backup jobs are configured.
- Restore drill is completed.
- Disaster recovery runbook is approved.
- On-call escalation is staffed.
- Support playbook is approved.

## Integration gates

- DigitalRX credentials validated.
- SMS provider validated.
- Email provider validated.
- Push notification provider validated.
- FHIR/HL7 integration contracts reviewed.
- Webhook retry and dead-letter behavior validated.

## Documentation gates

- Administrator manual complete.
- User manual complete.
- API documentation complete.
- Support escalation guide complete.
- Privacy and security policies complete.
- Go-live readiness certification signed.
