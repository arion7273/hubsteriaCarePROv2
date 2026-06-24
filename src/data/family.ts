export type FamilyAccessLevel = 'Allowed' | 'Limited' | 'Blocked';
export type FamilyNotificationType = 'Medication Update' | 'Incident Alert' | 'Appointment' | 'Document Request';

export type FamilyMetric = {
  label: string;
  value: string;
  detail: string;
};

export type FamilyDashboardCard = {
  title: string;
  summary: string;
  visibility: FamilyAccessLevel;
};

export type FamilyMessage = {
  subject: string;
  resident: string;
  participants: string;
  status: string;
  lastActivity: string;
};

export type FamilyNotification = {
  type: FamilyNotificationType;
  resident: string;
  message: string;
  channel: string;
};

export const familyMetrics: FamilyMetric[] = [
  { label: 'Family Users', value: '248', detail: 'Across active residents' },
  { label: 'Unread Family Messages', value: '5', detail: 'Need staff response' },
  { label: 'Document Requests', value: '12', detail: 'Awaiting upload or signature' },
  { label: 'Portal Read Rate', value: '92%', detail: 'Last 30 days' }
];

export const familyDashboardCards: FamilyDashboardCard[] = [
  {
    title: 'Resident Overview',
    summary: 'Photo, room, care level, preferred name, and high-level care status.',
    visibility: 'Allowed'
  },
  {
    title: 'Care Updates',
    summary: 'Approved care notes, ADL summaries, wellness updates, and staff-approved highlights.',
    visibility: 'Allowed'
  },
  {
    title: 'Documents',
    summary: 'Shared forms, uploaded records, signature requests, and family-visible files.',
    visibility: 'Limited'
  },
  {
    title: 'Messages',
    summary: 'Secure family communication with staff and care leadership.',
    visibility: 'Allowed'
  },
  {
    title: 'Appointments',
    summary: 'Upcoming provider, family visit, transportation, and care review appointments.',
    visibility: 'Allowed'
  },
  {
    title: 'Billing',
    summary: 'Statements, balances, payment links, and payer communication when permitted.',
    visibility: 'Limited'
  }
];

export const familyMessages: FamilyMessage[] = [
  {
    subject: 'Weekly care update request',
    resident: 'Maria Alvarez',
    participants: 'Elena Alvarez, Wellness Director',
    status: 'Needs Reply',
    lastActivity: 'Today, 1:15 PM'
  },
  {
    subject: 'Appointment transportation confirmation',
    resident: 'James Bennett',
    participants: 'Family Member, Front Desk',
    status: 'Read',
    lastActivity: 'Today, 11:05 AM'
  },
  {
    subject: 'Document signature follow-up',
    resident: 'Linda Chen',
    participants: 'Responsible Party, Facility Administrator',
    status: 'Unread',
    lastActivity: 'Yesterday, 4:45 PM'
  }
];

export const familyNotifications: FamilyNotification[] = [
  {
    type: 'Medication Update',
    resident: 'Maria Alvarez',
    message: 'Medication refusal summary approved for family visibility.',
    channel: 'In-App and Email'
  },
  {
    type: 'Incident Alert',
    resident: 'Maria Alvarez',
    message: 'Resolved wandering alert approved for family notification.',
    channel: 'In-App, Email, SMS'
  },
  {
    type: 'Appointment',
    resident: 'James Bennett',
    message: 'Transportation appointment scheduled for Friday.',
    channel: 'In-App and Email'
  },
  {
    type: 'Document Request',
    resident: 'Linda Chen',
    message: 'Updated consent form requires responsible-party signature.',
    channel: 'In-App and Email'
  }
];

export const familyPermissionRules = [
  'Family members only see residents they are explicitly linked to',
  'Clinical notes require staff approval before family visibility',
  'Billing access depends on responsible-party and payer permissions',
  'Incident alerts require configured severity and approval rules',
  'All family portal views, messages, document access, and notification delivery create audit records'
];

export const familyIntegrationRequirements = [
  'Communication Center powers secure family messaging and read receipts',
  'Notification Center Pro sends family medication updates, incident alerts, appointments, and document requests',
  'Resident Command Center controls which resident updates, documents, and timeline events become family-visible',
  'Configuration Center owns family portal permissions, branding, notification rules, and document access policies',
  'Print Center Pro exports family-visible document packets, billing statements, and communication summaries'
];
