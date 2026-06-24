export type ReadinessStatus = 'Ready' | 'In Progress' | 'Required';

export type ProductionMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ProductionChecklistItem = {
  area: string;
  status: ReadinessStatus;
  detail: string;
};

export const productionMetrics: ProductionMetric[] = [
  { label: 'Regression Tests', value: '44', detail: 'Current automated coverage' },
  { label: 'CI Gates', value: '3', detail: 'Install, test, build' },
  { label: 'Hardening Areas', value: '12', detail: 'Security, recovery, monitoring, docs' },
  { label: 'Release Stage', value: 'RC', detail: 'Release candidate process required' }
];

export const productionChecklist: ProductionChecklistItem[] = [
  {
    area: 'HIPAA Security Review',
    status: 'Required',
    detail: 'Validate privacy, access control, audit, encryption, BAAs, and operational safeguards.'
  },
  {
    area: 'Penetration Testing',
    status: 'Required',
    detail: 'Run third-party application, API, auth, and infrastructure penetration tests before go-live.'
  },
  {
    area: 'Audit Validation',
    status: 'In Progress',
    detail: 'Confirm all significant actions create immutable user, tenant, facility, before/after audit records.'
  },
  {
    area: 'Backup Systems',
    status: 'Required',
    detail: 'Configure encrypted backups, retention policy, restore testing, and tenant-aware recovery.'
  },
  {
    area: 'Disaster Recovery',
    status: 'Required',
    detail: 'Define RPO/RTO, failover runbooks, restore drills, and incident communication process.'
  },
  {
    area: 'High Availability',
    status: 'Required',
    detail: 'Deploy redundant services, databases, queues, object storage, and health checks.'
  },
  {
    area: 'Monitoring',
    status: 'In Progress',
    detail: 'Track availability, latency, queue backlogs, job failures, slow queries, and user-facing errors.'
  },
  {
    area: 'Error Tracking',
    status: 'In Progress',
    detail: 'Capture client and server exceptions with tenant-safe redaction and alert routing.'
  },
  {
    area: 'Regression Test Suite',
    status: 'Ready',
    detail: 'CI runs npm ci, npm test, and npm run build on pull requests and protected branches.'
  },
  {
    area: 'Deployment Pipeline',
    status: 'In Progress',
    detail: 'Automate build, test, artifact promotion, environment approvals, and rollback.'
  },
  {
    area: 'Enterprise Documentation',
    status: 'In Progress',
    detail: 'Prepare administrator manuals, user manuals, API documentation, and go-live certification.'
  },
  {
    area: 'Release Candidate Process',
    status: 'Required',
    detail: 'Require checklist signoff, security validation, regression pass, and support readiness before launch.'
  }
];

export const enterpriseDocuments = [
  'Administrator Manuals',
  'User Manuals',
  'API Documentation',
  'Security Runbooks',
  'Disaster Recovery Runbooks',
  'Go-Live Readiness Certification',
  'Release Candidate Checklist',
  'Support Escalation Playbook'
];

export const deploymentPipelineSteps = [
  'Code review',
  'Dependency install',
  'Regression tests',
  'Production build',
  'Security checks',
  'Artifact promotion',
  'Environment approval',
  'Rollback plan'
];

export const productionReadinessRequirements = [
  'No deployment proceeds unless authentication, resident CRUD, user CRUD, medication workflows, notifications, Print Center, reporting, tests, and production build pass',
  'Tenant isolation, role permissions, audit immutability, encrypted storage, backup restoration, and monitoring must be validated before go-live',
  'DigitalRX, SMS, email, push, FHIR/HL7, print/export, billing, and AI integrations require production credentials, rate limits, retries, and alerting',
  'HIPAA security review, penetration testing, disaster recovery drills, and release candidate signoff are mandatory before production launch',
  'Administrator manuals, user manuals, API documentation, support playbooks, and go-live readiness certification must be complete'
];
