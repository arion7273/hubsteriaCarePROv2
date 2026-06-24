export type IncidentStatus = 'Open' | 'Investigating' | 'Corrective Action' | 'Resolved';
export type ComplianceSeverity = 'Critical' | 'Warning' | 'Info';

export type IncidentMetric = {
  label: string;
  value: string;
  detail: string;
};

export type IncidentRecord = {
  type: string;
  resident: string;
  status: IncidentStatus;
  severity: ComplianceSeverity;
  nextStep: string;
};

export type ComplianceItem = {
  issue: string;
  severity: ComplianceSeverity;
  facility: string;
  resolutionLink: string;
};

export const incidentMetrics: IncidentMetric[] = [
  { label: 'Open Incidents', value: '214', detail: '42 need review' },
  { label: 'Corrective Actions', value: '18', detail: '6 due this week' },
  { label: 'Survey Readiness', value: '91', detail: 'Facility readiness score' },
  { label: 'Compliance Alerts', value: '27', detail: 'Critical and warning items' }
];

export const incidentTypes = [
  'Falls',
  'Injuries',
  'Medication Errors',
  'Behavioral Events',
  'Elopement',
  'Infection Events'
];

export const incidentWorkflow = [
  'Incident Report',
  'Investigation',
  'Root Cause Analysis',
  'Corrective Action',
  'Resolution'
];

export const incidentRecords: IncidentRecord[] = [
  {
    type: 'Fall',
    resident: 'Maria Alvarez',
    status: 'Investigating',
    severity: 'Warning',
    nextStep: 'Complete witness statement and fall risk update'
  },
  {
    type: 'Medication Error',
    resident: 'James Bennett',
    status: 'Corrective Action',
    severity: 'Critical',
    nextStep: 'Supervisor review and medication workflow retraining'
  },
  {
    type: 'Behavioral Event',
    resident: 'Linda Chen',
    status: 'Open',
    severity: 'Info',
    nextStep: 'Add care plan follow-up note'
  },
  {
    type: 'Elopement',
    resident: 'Maria Alvarez',
    status: 'Resolved',
    severity: 'Critical',
    nextStep: 'Verify corrective action effectiveness'
  }
];

export const complianceItems: ComplianceItem[] = [
  {
    issue: 'Missing Assessments',
    severity: 'Warning',
    facility: 'Cedar Grove Assisted Living',
    resolutionLink: 'Open assessment review queue'
  },
  {
    issue: 'Missing Signatures',
    severity: 'Warning',
    facility: 'Cedar Grove Assisted Living',
    resolutionLink: 'Open signature follow-up'
  },
  {
    issue: 'Expired Orders',
    severity: 'Critical',
    facility: 'Cedar Grove Assisted Living',
    resolutionLink: 'Open medication order renewal'
  },
  {
    issue: 'Late Medications',
    severity: 'Critical',
    facility: 'Cedar Grove Assisted Living',
    resolutionLink: 'Open eMAR compliance dashboard'
  },
  {
    issue: 'Missing Documentation',
    severity: 'Warning',
    facility: 'Cedar Grove Assisted Living',
    resolutionLink: 'Open documentation exceptions'
  }
];

export const surveyReadinessChecklist = [
  'Incident reports complete',
  'Investigations reviewed',
  'Root cause analysis documented',
  'Corrective action assigned',
  'Resolution signed',
  'Required notifications sent',
  'Print packet ready'
];

export const incidentIntegrationRequirements = [
  'Resident Command Center displays incidents, investigations, corrective actions, compliance items, and survey readiness history',
  'Notification Center Pro alerts administrators for severe incidents, missing documentation, overdue corrective actions, and survey risk',
  'Print Center Pro exports incident reports, investigation packets, root cause analysis, corrective actions, and survey readiness binders',
  'Configuration Center owns incident types, severity rules, notification routes, corrective action templates, and survey readiness settings',
  'All incident creation, updates, investigations, corrective actions, resolutions, and fix-this-issue actions create immutable audit records'
];
