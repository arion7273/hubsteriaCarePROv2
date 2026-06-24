export type NotificationChannel = 'In-App' | 'Email' | 'SMS' | 'Push';

export type NotificationTemplate = {
  name: string;
  module: string;
  channels: NotificationChannel[];
  audience: string;
  trigger: string;
};

export type NotificationRule = {
  name: string;
  condition: string;
  route: string;
  escalation: string;
  status: 'Active' | 'Draft';
};

export type DeliveryEvent = {
  event: string;
  resident: string;
  channel: NotificationChannel;
  recipient: string;
  deliveryStatus: 'Delivered' | 'Queued' | 'Escalated' | 'Read';
  timestamp: string;
};

export type NotificationMetric = {
  label: string;
  value: string;
  detail: string;
};

export const notificationChannels: Array<{
  channel: NotificationChannel;
  purpose: string;
  sla: string;
}> = [
  {
    channel: 'In-App',
    purpose: 'Primary authenticated staff notices, read receipts, workflow alerts, and dashboard badges.',
    sla: 'Immediate'
  },
  {
    channel: 'Email',
    purpose: 'Administrative summaries, family-approved communications, reports, and non-urgent follow-ups.',
    sla: '< 2 minutes'
  },
  {
    channel: 'SMS',
    purpose: 'Urgent operational escalations for nurses, caregivers, administrators, and on-call leadership.',
    sla: '< 30 seconds'
  },
  {
    channel: 'Push',
    purpose: 'Mobile caregiver and nurse alerts for med pass, ADL, incident, assessment, and task workflows.',
    sla: 'Immediate'
  }
];

export const notificationMetrics: NotificationMetric[] = [
  { label: 'Templates', value: '18', detail: 'Reusable across current and future modules' },
  { label: 'Active Rules', value: '12', detail: 'Role-targeted and tenant-scoped' },
  { label: 'Delivered Today', value: '1,284', detail: '99.2% successful delivery' },
  { label: 'Unread Critical', value: '7', detail: 'Escalation queue monitoring' }
];

export const notificationTemplates: NotificationTemplate[] = [
  {
    name: 'Assessment Due',
    module: 'Assessments',
    channels: ['In-App', 'Push', 'Email'],
    audience: 'Wellness Director, T3 Facility Administrator',
    trigger: 'Assessment due within 72 hours'
  },
  {
    name: 'Medication Refused',
    module: 'eMAR',
    channels: ['In-App', 'SMS', 'Push'],
    audience: 'Nurse, Medication Manager, Facility Administrator',
    trigger: 'Medication action marked Refused'
  },
  {
    name: 'Incident Created',
    module: 'Incidents',
    channels: ['In-App', 'Email', 'SMS'],
    audience: 'Facility Administrator, Organization Administrator',
    trigger: 'New incident submitted'
  },
  {
    name: 'DigitalRX Sync Warning',
    module: 'DigitalRX',
    channels: ['In-App', 'Email'],
    audience: 'Pharmacy Liaison, T1 Master Administrator',
    trigger: 'Connector sync exception detected'
  }
];

export const notificationRules: NotificationRule[] = [
  {
    name: 'Critical med refusal escalation',
    condition: 'Medication refused for high-risk resident',
    route: 'Nurse -> Medication Manager -> Facility Administrator',
    escalation: 'Escalate by SMS if unread after 10 minutes',
    status: 'Active'
  },
  {
    name: 'Assessment due routing',
    condition: 'Assessment due in 72 hours or overdue',
    route: 'Assigned reviewer -> Wellness Director',
    escalation: 'Escalate in-app and email daily until complete',
    status: 'Active'
  },
  {
    name: 'Incident leadership alert',
    condition: 'Fall, elopement, medication error, injury, or infection event',
    route: 'T3 Facility Administrator -> T2 Organization Administrator',
    escalation: 'Escalate by SMS for severe incidents',
    status: 'Active'
  },
  {
    name: 'Family portal digest',
    condition: 'Approved family-visible resident updates',
    route: 'Family member by resident permission',
    escalation: 'No escalation; weekly digest fallback',
    status: 'Draft'
  }
];

export const notificationHistory: DeliveryEvent[] = [
  {
    event: 'Medication Refused',
    resident: 'Maria Alvarez',
    channel: 'SMS',
    recipient: 'Medication Manager',
    deliveryStatus: 'Delivered',
    timestamp: 'Today, 8:14 AM'
  },
  {
    event: 'Assessment Due',
    resident: 'Maria Alvarez',
    channel: 'Push',
    recipient: 'Wellness Director',
    deliveryStatus: 'Read',
    timestamp: 'Today, 7:42 AM'
  },
  {
    event: 'DigitalRX Sync Warning',
    resident: 'N/A',
    channel: 'Email',
    recipient: 'T1 Master Administrator',
    deliveryStatus: 'Queued',
    timestamp: 'Today, 6:58 AM'
  },
  {
    event: 'Incident Created',
    resident: 'Maria Alvarez',
    channel: 'In-App',
    recipient: 'Facility Administrator',
    deliveryStatus: 'Escalated',
    timestamp: 'Yesterday, 7:50 PM'
  }
];

export const notificationIntegrationRequirements = [
  'Every major event can generate in-app, email, SMS, or push notifications',
  'Notification rules remain tenant-scoped by organization, facility, role, and resident permissions',
  'Delivery tracking records queued, delivered, read, failed, and escalated states',
  'Read tracking supports dashboards, reminders, and escalation rules',
  'Templates are reusable by future clinical, operations, billing, family, pharmacy, and support modules'
];
