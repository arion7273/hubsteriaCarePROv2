export type MessageAudience = 'Internal Staff' | 'Family' | 'Provider';
export type MessageStatus = 'Unread' | 'Read' | 'Needs Reply' | 'Escalated';
export type AnnouncementPriority = 'Routine' | 'Policy' | 'Emergency';

export type CommunicationMetric = {
  label: string;
  value: string;
  detail: string;
};

export type MessageThread = {
  audience: MessageAudience;
  subject: string;
  participants: string;
  status: MessageStatus;
  lastActivity: string;
};

export type ShiftHandoff = {
  resident: string;
  outgoingShift: string;
  incomingShift: string;
  note: string;
  readConfirmation: string;
};

export type FacilityAnnouncement = {
  title: string;
  priority: AnnouncementPriority;
  audience: string;
  readReceipts: string;
};

export const communicationMetrics: CommunicationMetric[] = [
  { label: 'Unread Messages', value: '17', detail: '5 family, 9 staff, 3 provider' },
  { label: 'Shift Handoffs', value: '12', detail: '4 awaiting read confirmation' },
  { label: 'Announcements', value: '3', detail: '1 emergency alert active' },
  { label: 'Read Receipts', value: '94%', detail: 'Across targeted communications' }
];

export const messageThreads: MessageThread[] = [
  {
    audience: 'Internal Staff',
    subject: 'Evening med pass coverage',
    participants: 'Nurse, Medication Manager, Facility Administrator',
    status: 'Needs Reply',
    lastActivity: 'Today, 2:15 PM'
  },
  {
    audience: 'Family',
    subject: 'Maria Alvarez care update',
    participants: 'Family Member, Wellness Director',
    status: 'Read',
    lastActivity: 'Today, 12:40 PM'
  },
  {
    audience: 'Provider',
    subject: 'Warfarin hold clarification',
    participants: 'Provider, Nurse, Pharmacy Liaison',
    status: 'Escalated',
    lastActivity: 'Today, 9:25 AM'
  }
];

export const shiftHandoffs: ShiftHandoff[] = [
  {
    resident: 'Maria Alvarez',
    outgoingShift: 'Day Shift',
    incomingShift: 'Evening Shift',
    note: 'Monitor wandering cues and complete evening redirection task.',
    readConfirmation: 'Confirmed by Evening Caregiver'
  },
  {
    resident: 'James Bennett',
    outgoingShift: 'Day Shift',
    incomingShift: 'Evening Shift',
    note: 'Transfer assist required before dinner; shower task reassigned.',
    readConfirmation: 'Pending'
  },
  {
    resident: 'Linda Chen',
    outgoingShift: 'Night Shift',
    incomingShift: 'Day Shift',
    note: 'Hydration rounds overdue twice overnight; review nutrition task plan.',
    readConfirmation: 'Confirmed by Caregiver Lead'
  }
];

export const facilityAnnouncements: FacilityAnnouncement[] = [
  {
    title: 'Emergency weather alert',
    priority: 'Emergency',
    audience: 'All facility staff',
    readReceipts: '91% read'
  },
  {
    title: 'Medication policy update',
    priority: 'Policy',
    audience: 'Nurses and medication managers',
    readReceipts: '87% read'
  },
  {
    title: 'Friday care team meeting',
    priority: 'Routine',
    audience: 'Care team',
    readReceipts: '76% read'
  }
];

export const communicationIntegrationRequirements = [
  'Notification Center Pro sends in-app, email, SMS, and push notices for unread messages, handoff read confirmations, and emergency announcements',
  'Resident Command Center displays resident-linked messages, family communications, provider threads, and shift handoff history',
  'Configuration Center owns communication permissions, announcement audiences, read receipt rules, and escalation settings',
  'Print Center Pro exports shift handoff summaries, communication logs, provider message packets, and announcement receipt reports',
  'All messages, announcements, handoffs, read receipts, escalations, and edits create immutable audit records'
];
