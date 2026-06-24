export type WorkflowStatus = 'Active' | 'Draft' | 'Paused';

export type WorkflowMetric = {
  label: string;
  value: string;
  detail: string;
};

export type WorkflowTemplate = {
  name: string;
  trigger: string;
  condition: string;
  action: string;
  status: WorkflowStatus;
};

export type AutomationActivity = {
  workflow: string;
  event: string;
  result: string;
  timestamp: string;
};

export const workflowMetrics: WorkflowMetric[] = [
  { label: 'Active Workflows', value: '22', detail: 'Across clinical, operations, billing' },
  { label: 'Actions Today', value: '184', detail: 'Automated tasks and notifications' },
  { label: 'Paused Workflows', value: '3', detail: 'Awaiting administrator review' },
  { label: 'Audit Events', value: '412', detail: 'Immutable automation activity' }
];

export const workflowBuilderParts = [
  'Trigger',
  'Condition',
  'Action',
  'Template',
  'Audit Trail',
  'Notification Route',
  'Task Creation',
  'Family Visibility Rule'
];

export const workflowTemplates: WorkflowTemplate[] = [
  {
    name: 'Medication Refused Escalation',
    trigger: 'Medication Refused',
    condition: 'Resident is high risk or refusal count exceeds threshold',
    action: 'Notify Administrator',
    status: 'Active'
  },
  {
    name: 'Assessment Due Task',
    trigger: 'Assessment Due',
    condition: 'Due within 72 hours',
    action: 'Create Task',
    status: 'Active'
  },
  {
    name: 'Incident Family Notification',
    trigger: 'Incident Created',
    condition: 'Severity approved for family visibility',
    action: 'Notify Family',
    status: 'Draft'
  },
  {
    name: 'Refill Running Low',
    trigger: 'Refill Running Low',
    condition: 'Supply below configured threshold',
    action: 'Notify Pharmacy',
    status: 'Active'
  }
];

export const automationExamples = [
  'Medication Refused -> Notify Administrator',
  'Assessment Due -> Create Task',
  'Incident Created -> Notify Family',
  'Refill Running Low -> Notify Pharmacy'
];

export const automationActivity: AutomationActivity[] = [
  {
    workflow: 'Medication Refused Escalation',
    event: 'Maria Alvarez refused Lisinopril',
    result: 'Administrator notified by in-app and SMS',
    timestamp: 'Today, 8:16 AM'
  },
  {
    workflow: 'Assessment Due Task',
    event: 'Fall Risk Assessment due in 72 hours',
    result: 'Task created for Wellness Director',
    timestamp: 'Today, 7:30 AM'
  },
  {
    workflow: 'Refill Running Low',
    event: 'Lisinopril supply below threshold',
    result: 'Pharmacy notification queued',
    timestamp: 'Yesterday, 5:02 PM'
  }
];

export const workflowIntegrationRequirements = [
  'Configuration Center owns workflow templates, triggers, conditions, actions, feature toggles, and permissions',
  'Notification Center Pro executes workflow notification actions with routing, escalation, and delivery tracking',
  'Resident Command Center shows resident-specific workflow activity, generated tasks, and communication history',
  'Workflow actions can create tasks, notify families, notify pharmacies, update review queues, and request documents',
  'Every automation trigger, condition result, action, failure, pause, and administrator override creates immutable audit records'
];
