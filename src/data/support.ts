export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Customer' | 'Resolved';

export type SupportMetric = {
  label: string;
  value: string;
  detail: string;
};

export type SupportTicket = {
  ticket: string;
  category: 'Clinical' | 'Medication' | 'Billing' | 'Technical';
  subject: string;
  requester: string;
  priority: TicketPriority;
  status: TicketStatus;
};

export type KnowledgeLink = {
  article: string;
  linkedTicket: string;
  module: string;
};

export const supportMetrics: SupportMetric[] = [
  { label: 'Open Tickets', value: '42', detail: 'Across clinical, medication, billing, technical' },
  { label: 'Avg Response Time', value: '18m', detail: 'First response SLA' },
  { label: 'Resolved Today', value: '31', detail: 'Support throughput' },
  { label: 'Satisfaction', value: '96%', detail: 'Post-resolution survey' }
];

export const supportTickets: SupportTicket[] = [
  {
    ticket: 'HD-1042',
    category: 'Clinical',
    subject: 'Assessment scoring question',
    requester: 'Wellness Director',
    priority: 'Medium',
    status: 'Open'
  },
  {
    ticket: 'HD-1043',
    category: 'Medication',
    subject: 'Barcode scan mismatch',
    requester: 'Medication Manager',
    priority: 'High',
    status: 'In Progress'
  },
  {
    ticket: 'HD-1044',
    category: 'Billing',
    subject: 'Statement adjustment request',
    requester: 'Organization Administrator',
    priority: 'Low',
    status: 'Waiting on Customer'
  },
  {
    ticket: 'HD-1045',
    category: 'Technical',
    subject: 'Mobile login issue',
    requester: 'Caregiver',
    priority: 'Critical',
    status: 'Resolved'
  }
];

export const supportCapabilities = [
  'Ticket System',
  'Screenshot Uploads',
  'Screen Recording Support',
  'Knowledge Base Linking',
  'Remote Assistance',
  'Permission-Based Support Access',
  'Response Time Tracking',
  'Resolution Tracking',
  'Support Analytics Dashboard'
];

export const supportKnowledgeLinks: KnowledgeLink[] = [
  {
    article: 'How to troubleshoot barcode scan mismatch',
    linkedTicket: 'HD-1043',
    module: 'eMAR'
  },
  {
    article: 'How to adjust a resident statement',
    linkedTicket: 'HD-1044',
    module: 'Billing'
  },
  {
    article: 'How to reset mobile MFA',
    linkedTicket: 'HD-1045',
    module: 'Authentication'
  }
];

export const remoteAssistanceRules = [
  'Support staff must request permission before remote assistance begins',
  'Remote assistance sessions are tenant-scoped and role-limited',
  'Screen recordings and screenshots are attached only to authorized support tickets',
  'All support access, ticket changes, uploads, and remote assistance sessions create immutable audit records'
];

export const supportIntegrationRequirements = [
  'Notification Center Pro alerts requesters and assigned support staff for ticket updates, escalations, and resolution',
  'Hubsteria Academy links relevant knowledge base articles and walkthroughs to support tickets',
  'Configuration Center owns support categories, SLAs, remote assistance permissions, and escalation routing',
  'Executive dashboards surface response time, resolution time, ticket volume, and satisfaction analytics',
  'All support tickets, screenshots, screen recordings, knowledge links, and remote assistance sessions create immutable audit records'
];
