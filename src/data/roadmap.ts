export type PhaseStatus = 'foundation' | 'planned' | 'future';

export type Phase = {
  id: string;
  title: string;
  status: PhaseStatus;
  summary: string;
  milestone: string;
  deliverables: string[];
};

export const foundationPhases: Phase[] = [
  {
    id: '0',
    title: 'Master Global Rules',
    status: 'foundation',
    milestone: 'Global Protocol',
    summary:
      'Permanent mobile-first, performance-first, audit, HIPAA, registry, notification, print, and command-center standards.',
    deliverables: [
      'Responsive design rules for desktop, laptop, iPad, tablets, iPhone, and Android phones',
      'Performance budgets for dashboards, resident search, and medication actions',
      'Regression gates for authentication, resident CRUD, user CRUD, medications, notifications, print, and reports',
      'Immutable audit logging and tenant-isolation standards'
    ]
  },
  {
    id: '1',
    title: 'Multi-Tenant Foundation',
    status: 'foundation',
    milestone: 'Tenant Core',
    summary:
      'T1, T2, T3, role, permission, organization, facility, user, audit, and feature-registry architecture.',
    deliverables: [
      'Organization, facility, user, role, permission, audit log, and feature registry models',
      'Login, logout, MFA, password reset, and session-management blueprint',
      'Master Admin, Organization Admin, and Facility Admin dashboards',
      'Tenant-isolated data access and role-based authorization'
    ]
  },
  {
    id: '1.5',
    title: 'Enterprise Hierarchy, Dashboards & Master Consoles',
    status: 'foundation',
    milestone: 'Enterprise Command Layer',
    summary:
      'Unlimited organizations and facilities with T1 -> T2 -> future T2.5 -> T3 -> employee hierarchy.',
    deliverables: [
      'Master Console with platform health, revenue, compliance, integrations, and activity widgets',
      'Organization Command Center with facility performance, occupancy, billing, and survey readiness',
      'Facility Command Center with residents, med pass, tasks, incidents, staff, and compliance alerts',
      'Universal organization/facility switcher with strict scope enforcement'
    ]
  },
  {
    id: '2',
    title: 'Resident Command Center',
    status: 'foundation',
    milestone: 'Resident Hub',
    summary:
      'Primary resident workspace connecting demographics, contacts, diagnoses, allergies, documents, timeline, and all future clinical modules.',
    deliverables: [
      'Resident profile and top banner',
      'Quick action bar for notes, assessments, incidents, medications, tasks, uploads, and print',
      'Resident timeline for notes, assessments, medication activity, incidents, care plans, billing, and documents',
      'Required access path for every future module'
    ]
  },
  {
    id: '3',
    title: 'User Experience & Productivity Layer',
    status: 'foundation',
    milestone: 'Productivity Core',
    summary:
      'Global search, command bar, quick actions, favorites, dark mode, and personalized role dashboards.',
    deliverables: [
      'Ctrl+K command bar',
      'Global search across residents, staff, incidents, assessments, medications, and tasks',
      'Pinned actions and favorites',
      'Role-specific personalized dashboards'
    ]
  },
  {
    id: '4',
    title: 'Notification Center Pro',
    status: 'foundation',
    milestone: 'Enterprise Notifications',
    summary:
      'In-app, email, SMS, and push notification platform with templates, rules, routing, escalation, and tracking.',
    deliverables: [
      'Notification templates and rules',
      'Routing and escalation engine',
      'Delivery, read, and history tracking',
      'Role-based targeting for all future modules'
    ]
  },
  {
    id: '5',
    title: 'Print Center Pro',
    status: 'foundation',
    milestone: 'Enterprise Print Engine',
    summary:
      'PDF, CSV, Excel, batch printing, template builder, previews, logos, signatures, QR codes, and barcodes.',
    deliverables: [
      'Print template CRUD',
      'Headers, footers, branding, signatures, conditional content, QR codes, and barcodes',
      'Preview and batch printing',
      'Print integration contract for every future module'
    ]
  },
  {
    id: '5.5',
    title: 'Configuration Center',
    status: 'foundation',
    milestone: 'Administration Control Room',
    summary:
      'Centralized configuration for permissions, templates, settings, branding, feature toggles, integrations, and workflow rules.',
    deliverables: [
      'Roles and permissions management',
      'Assessment, incident, notification, print, and workflow template settings',
      'DigitalRX, facility, branding, and feature-toggle settings',
      'Centralized settings surface to prevent scattered administration'
    ]
  }
];

export const clinicalOperationsPhases: Phase[] = [
  {
    id: '6',
    title: 'Assessments & Care Plans Engine',
    status: 'foundation',
    milestone: 'Clinical Planning',
    summary:
      'Assessment dashboards, templates, categories, scheduler, scoring, review queue, care plans, signatures, and care plan suggestions.',
    deliverables: ['Assessments', 'Care plans', 'Scoring rules', 'Print and notification integration']
  },
  {
    id: '7',
    title: 'Tasks, ADLs & Services',
    status: 'foundation',
    milestone: 'Caregiver Workflows',
    summary:
      'Task management, ADL tracking, service plans, missed-task engine, shift dashboard, and one-tap mobile completion.',
    deliverables: ['ADLs', 'Recurring tasks', 'Shift dashboard', 'Mobile completion']
  },
  {
    id: '8',
    title: 'eMAR & Medication Management',
    status: 'foundation',
    milestone: 'Medication Safety',
    summary:
      'Medication orders, med pass, PRNs, controlled substances, barcode scanning, alerts, compliance, and mobile med pass mode.',
    deliverables: ['Med pass', 'PRNs', 'Controlled substances', 'Medication alerts']
  },
  {
    id: '9',
    title: 'DigitalRX Integration Hub',
    status: 'foundation',
    milestone: 'Pharmacy Connectivity',
    summary:
      'DigitalRX connection settings, pharmacy inbox, medication sync, resident matching, refill tracking, and webhook events.',
    deliverables: ['REST connector', 'FHIR-ready architecture', 'Pharmacy inbox', 'Sync auditing']
  },
  {
    id: '10',
    title: 'Incidents & Compliance Center',
    status: 'foundation',
    milestone: 'Compliance Operations',
    summary:
      'Incident workflows, investigations, root cause analysis, corrective actions, compliance dashboard, and survey readiness.',
    deliverables: ['Incidents', 'Compliance dashboard', 'Fix-this-issue links', 'Survey readiness']
  }
];

export const enterprisePhases: Phase[] = [
  {
    id: '11',
    title: 'Communication Center',
    status: 'foundation',
    milestone: 'Secure Messaging',
    summary: 'Staff, family, provider messaging, shift handoff, announcements, read receipts, and notification integration.',
    deliverables: ['Messaging', 'Shift handoff', 'Announcements', 'Read receipts']
  },
  {
    id: '12',
    title: 'Family Portal',
    status: 'future',
    milestone: 'Family Transparency',
    summary: 'Family dashboards, care updates, documents, messages, appointments, billing, and role-based notifications.',
    deliverables: ['Family dashboard', 'Secure messaging', 'Document access', 'Family notifications']
  },
  {
    id: '13',
    title: 'Billing & Financial Operations',
    status: 'future',
    milestone: 'Revenue Operations',
    summary: 'Recurring charges, level-of-care billing, invoices, statements, payments, aging, and revenue dashboards.',
    deliverables: ['Charges', 'Invoices', 'Payments', 'Aging reports']
  },
  {
    id: '14',
    title: 'Workflow Automation Engine',
    status: 'future',
    milestone: 'No-Code Automation',
    summary: 'Trigger, condition, action automation with templates and complete audit tracking.',
    deliverables: ['Workflow builder', 'Templates', 'Automation audit', 'Cross-module actions']
  },
  {
    id: '15',
    title: 'Hubsteria Academy',
    status: 'future',
    milestone: 'Training & Guidance',
    summary: 'Knowledge base, videos, walkthroughs, role learning paths, certifications, and AI help assistant.',
    deliverables: ['Training center', 'Certifications', 'Learning paths', 'AI help']
  },
  {
    id: '16',
    title: 'Help Desk & Support Center',
    status: 'future',
    milestone: 'Support Operations',
    summary: 'Ticketing, screenshots, screen recording support, knowledge linking, remote assistance, and analytics.',
    deliverables: ['Tickets', 'Uploads', 'Knowledge linking', 'Support analytics']
  },
  {
    id: '17',
    title: 'Executive Command Center',
    status: 'future',
    milestone: 'Executive Intelligence',
    summary: 'Occupancy, revenue, medication compliance, incidents, assessments, staffing, training, billing, and health scores.',
    deliverables: ['Executive dashboards', 'Health scores', 'Multi-facility view', 'Survey readiness score']
  },
  {
    id: '18',
    title: 'AI Assistant & Insights Layer',
    status: 'future',
    milestone: 'AI Insights',
    summary: 'Resident summaries, compliance risk detection, family update drafts, and system knowledge assistant.',
    deliverables: ['Resident summaries', 'Compliance assistant', 'Family drafts', 'Knowledge assistant']
  },
  {
    id: '19',
    title: 'Performance & Scalability',
    status: 'future',
    milestone: 'Scale Foundation',
    summary: 'Caching, queues, optimized search, database indexing, lazy loading, infinite scroll, offline mobile, and load testing.',
    deliverables: ['Caching', 'Queues', 'Optimized search', 'Load testing']
  },
  {
    id: '20',
    title: 'Production Hardening & Enterprise Readiness',
    status: 'future',
    milestone: 'Enterprise Release',
    summary: 'HIPAA review, penetration testing, backups, disaster recovery, HA, monitoring, error tracking, regression suite, and manuals.',
    deliverables: ['Security review', 'Monitoring', 'Deployment pipeline', 'Go-live certification']
  }
];

export const allPhases = [...foundationPhases, ...clinicalOperationsPhases, ...enterprisePhases];
