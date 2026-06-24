export type RoleScope = 'platform' | 'organization' | 'regional' | 'facility' | 'resident';

export type RoleDefinition = {
  tier: string;
  name: string;
  scope: RoleScope;
  description: string;
  canView: string[];
  permissions: string[];
  invitations: string[];
  restrictions?: string[];
};

export type DashboardMetric = {
  label: string;
  value: string;
  trend: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
};

export type FeatureRegistryItem = {
  featureName: string;
  module: string;
  status: 'registered' | 'planned' | 'gated';
  dependencies: string[];
  version: string;
};

export const masterBootstrapAccount = {
  email: 'b094650@gmail.com',
  credentialSource: 'deployment secret',
  note:
    'The initial T1 account is represented without storing a plain-text password in the client application.'
};

export const hierarchy: RoleDefinition[] = [
  {
    tier: 'T1',
    name: 'Master Administrator',
    scope: 'platform',
    description: 'Full HubsteriaCarePRO platform command authority across every tenant and system surface.',
    canView: [
      'All organizations',
      'All facilities',
      'All users and employees',
      'All residents',
      'Billing and subscriptions',
      'Platform audit logs',
      'System health and API health'
    ],
    permissions: [
      'CRUD organizations, facilities, users, employees, T2 administrators, and T3 administrators',
      'Suspend organizations and facilities',
      'Deactivate users',
      'Transfer ownership',
      'Manage subscription plans',
      'Manage global settings',
      'View global reports and platform analytics',
      'Access Master Console'
    ],
    invitations: ['T2 Administrators', 'T3 Administrators', 'Employees']
  },
  {
    tier: 'T2',
    name: 'Organization Administrator',
    scope: 'organization',
    description: 'Organization-level command authority across all facilities within one tenant organization.',
    canView: [
      'Assigned organization',
      'Facilities under organization',
      'Employees',
      'Residents',
      'Billing',
      'Compliance'
    ],
    permissions: [
      'CRUD facilities',
      'CRUD employees',
      'CRUD T3 administrators',
      'CRUD residents',
      'Manage organization settings',
      'View organization reports and analytics'
    ],
    invitations: ['T3 Administrators', 'Employees'],
    restrictions: [
      'Cannot view other organizations',
      'Cannot modify T1 accounts',
      'Cannot access global platform settings'
    ]
  },
  {
    tier: 'T2.5',
    name: 'Regional Administrator',
    scope: 'regional',
    description: 'Future disabled role for regional directors overseeing grouped facilities inside an organization.',
    canView: ['Assigned region', 'Assigned facilities', 'Regional employees', 'Regional residents', 'Regional compliance'],
    permissions: [
      'View regional analytics',
      'Coordinate assigned facility performance',
      'Manage regional workflows when enabled'
    ],
    invitations: ['Facility Administrators', 'Employees'],
    restrictions: ['Disabled initially until larger organization rollout requires regional hierarchy']
  },
  {
    tier: 'T3',
    name: 'Facility Administrator',
    scope: 'facility',
    description: 'Facility command authority for single-site operations and daily care management.',
    canView: [
      'Facility residents',
      'Facility employees',
      'Facility compliance',
      'Facility operations',
      'Family messages',
      'Open tickets'
    ],
    permissions: [
      'CRUD residents',
      'CRUD employees',
      'Manage facility settings',
      'Assign staff',
      'Manage daily operations'
    ],
    invitations: ['Employees', 'Caregivers', 'Nurses', 'Medication Managers'],
    restrictions: ['Cannot access other facilities', 'Cannot access organization administration', 'Cannot access platform administration']
  },
  {
    tier: 'Employee',
    name: 'Permission-Based Staff',
    scope: 'resident',
    description: 'Nurses, caregivers, medication managers, billing, providers, family members, residents, and support staff.',
    canView: ['Only records allowed by assigned permissions and facility scope'],
    permissions: [
      'Permission-driven access to residents, tasks, ADLs, eMAR, notes, communication, billing, training, and support'
    ],
    invitations: [],
    restrictions: ['No default cross-facility access', 'No default administrative access']
  }
];

export const masterConsoleMetrics: DashboardMetric[] = [
  { label: 'Organizations', value: '128', trend: '+12 this quarter', tone: 'primary' },
  { label: 'Facilities', value: '642', trend: '98.9% online', tone: 'success' },
  { label: 'Residents', value: '38.4k', trend: 'search target <1s', tone: 'primary' },
  { label: 'Medication Compliance', value: '97.8%', trend: '+1.6%', tone: 'success' },
  { label: 'Open Incidents', value: '214', trend: '42 need review', tone: 'warning' },
  { label: 'System Health', value: '99.99%', trend: 'API healthy', tone: 'success' },
  { label: 'MRR', value: '$1.84M', trend: '+8.2%', tone: 'primary' },
  { label: 'DigitalRX Health', value: '99.3%', trend: '6 sync warnings', tone: 'warning' }
];

export const organizationMetrics: DashboardMetric[] = [
  { label: 'Facility Count', value: '18', trend: '3 regions', tone: 'primary' },
  { label: 'Resident Count', value: '1,246', trend: '92% occupancy', tone: 'success' },
  { label: 'Employee Count', value: '518', trend: '41 on shift', tone: 'primary' },
  { label: 'Assessments Due', value: '32', trend: '11 overdue', tone: 'warning' },
  { label: 'Medication Compliance', value: '98.1%', trend: 'above target', tone: 'success' },
  { label: 'Survey Readiness', value: '91', trend: '+4 points', tone: 'success' }
];

export const facilityMetrics: DashboardMetric[] = [
  { label: 'Current Residents', value: '86', trend: '4 admissions today', tone: 'primary' },
  { label: 'Med Pass Completion', value: '94%', trend: '7 pending', tone: 'warning' },
  { label: 'Tasks Due', value: '128', trend: '21 overdue', tone: 'warning' },
  { label: 'Staff On Shift', value: '23', trend: '2 callouts', tone: 'danger' },
  { label: 'Family Messages', value: '17', trend: '5 unread', tone: 'primary' },
  { label: 'Open Tickets', value: '4', trend: '1 escalated', tone: 'warning' }
];

export const featureRegistry: FeatureRegistryItem[] = [
  {
    featureName: 'Tenant Isolation Guard',
    module: 'Security & Access',
    status: 'registered',
    dependencies: ['Organizations', 'Facilities', 'Roles', 'Permissions'],
    version: '0.1.0'
  },
  {
    featureName: 'Audit Log Contract',
    module: 'Compliance',
    status: 'registered',
    dependencies: ['Users', 'Facilities', 'Organizations'],
    version: '0.1.0'
  },
  {
    featureName: 'Resident Command Center Access Rule',
    module: 'Resident Core',
    status: 'registered',
    dependencies: ['Resident Profile', 'Timeline', 'Quick Actions'],
    version: '0.1.0'
  },
  {
    featureName: 'Notification Center Integration',
    module: 'Platform Services',
    status: 'registered',
    dependencies: ['Templates', 'Rules', 'Delivery Tracking'],
    version: '0.1.0'
  },
  {
    featureName: 'Print Center Integration',
    module: 'Platform Services',
    status: 'registered',
    dependencies: ['Templates', 'Preview', 'Batch Printing'],
    version: '0.1.0'
  },
  {
    featureName: 'Global Search and Command Bar',
    module: 'Productivity System',
    status: 'registered',
    dependencies: ['Residents', 'Staff', 'Incidents', 'Assessments', 'Medications', 'Tasks', 'Reports'],
    version: '0.1.0'
  },
  {
    featureName: 'Favorites and Pinned Actions',
    module: 'Productivity System',
    status: 'registered',
    dependencies: ['Users', 'Roles', 'Personalized Dashboards'],
    version: '0.1.0'
  },
  {
    featureName: 'Dark Mode',
    module: 'Design System',
    status: 'registered',
    dependencies: ['Responsive Design Tokens', 'Accessibility Standards'],
    version: '0.1.0'
  },
  {
    featureName: 'Notification Rules and Escalation',
    module: 'Notification Center Pro',
    status: 'registered',
    dependencies: ['Templates', 'Routing', 'Role Targeting', 'Delivery Tracking'],
    version: '0.1.0'
  },
  {
    featureName: 'Notification Delivery and Read Tracking',
    module: 'Notification Center Pro',
    status: 'registered',
    dependencies: ['In-App', 'Email', 'SMS', 'Push'],
    version: '0.1.0'
  },
  {
    featureName: 'Print Template Builder',
    module: 'Print Center Pro',
    status: 'registered',
    dependencies: ['Headers', 'Footers', 'Logos', 'Signatures', 'QR Codes', 'Barcodes', 'Conditional Content'],
    version: '0.1.0'
  },
  {
    featureName: 'Print Preview and Batch Printing',
    module: 'Print Center Pro',
    status: 'registered',
    dependencies: ['PDF', 'CSV', 'Excel', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Configuration Center',
    module: 'Administration',
    status: 'registered',
    dependencies: ['Roles', 'Permissions', 'Templates', 'Feature Toggles', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Feature Toggle Registry',
    module: 'Configuration Center',
    status: 'registered',
    dependencies: ['Tenant Isolation Guard', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Assessment Builder',
    module: 'Assessments & Care Plans',
    status: 'registered',
    dependencies: ['Configuration Center', 'Resident Command Center', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Care Plan Center',
    module: 'Assessments & Care Plans',
    status: 'registered',
    dependencies: ['Assessment Builder', 'Notification Center Integration', 'Print Center Integration'],
    version: '0.1.0'
  },
  {
    featureName: 'Task and ADL Tracking',
    module: 'Tasks, ADLs & Services',
    status: 'registered',
    dependencies: ['Resident Command Center', 'Configuration Center', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Missed Task Engine',
    module: 'Tasks, ADLs & Services',
    status: 'registered',
    dependencies: ['Notification Center Integration', 'Task and ADL Tracking'],
    version: '0.1.0'
  },
  {
    featureName: 'Medication Orders and Med Pass',
    module: 'eMAR & Medication Management',
    status: 'registered',
    dependencies: ['Resident Command Center', 'Notification Center Integration', 'Print Center Integration'],
    version: '0.1.0'
  },
  {
    featureName: 'PRN Controlled Substance and Barcode Safety',
    module: 'eMAR & Medication Management',
    status: 'registered',
    dependencies: ['Medication Orders and Med Pass', 'Audit Log Contract', 'Configuration Center'],
    version: '0.1.0'
  },
  {
    featureName: 'DigitalRX Connector',
    module: 'DigitalRX Integration Hub',
    status: 'registered',
    dependencies: ['Configuration Center', 'Medication Orders and Med Pass', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Pharmacy Inbox and Resident Matching',
    module: 'DigitalRX Integration Hub',
    status: 'registered',
    dependencies: ['DigitalRX Connector', 'Resident Command Center', 'Notification Center Integration'],
    version: '0.1.0'
  },
  {
    featureName: 'Incident Workflow Engine',
    module: 'Incidents & Compliance Center',
    status: 'registered',
    dependencies: ['Resident Command Center', 'Notification Center Integration', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Compliance and Survey Readiness',
    module: 'Incidents & Compliance Center',
    status: 'registered',
    dependencies: ['Incident Workflow Engine', 'Print Center Integration', 'Configuration Center'],
    version: '0.1.0'
  },
  {
    featureName: 'Secure Messaging and Shift Handoff',
    module: 'Communication Center',
    status: 'registered',
    dependencies: ['Resident Command Center', 'Notification Center Integration', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Announcements and Read Receipts',
    module: 'Communication Center',
    status: 'registered',
    dependencies: ['Secure Messaging and Shift Handoff', 'Configuration Center'],
    version: '0.1.0'
  },
  {
    featureName: 'Family Portal Dashboard',
    module: 'Family Portal',
    status: 'registered',
    dependencies: ['Resident Command Center', 'Role-Based Permissions', 'Configuration Center'],
    version: '0.1.0'
  },
  {
    featureName: 'Family Messaging and Notifications',
    module: 'Family Portal',
    status: 'registered',
    dependencies: ['Communication Center', 'Notification Center Integration', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Billing Charges Invoices and Payments',
    module: 'Billing & Financial Operations',
    status: 'registered',
    dependencies: ['Resident Command Center', 'Family Portal', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Aging Reports and Revenue Dashboard',
    module: 'Billing & Financial Operations',
    status: 'registered',
    dependencies: ['Billing Charges Invoices and Payments', 'Print Center Integration'],
    version: '0.1.0'
  },
  {
    featureName: 'Workflow Automation Builder',
    module: 'Workflow Automation Engine',
    status: 'registered',
    dependencies: ['Configuration Center', 'Notification Center Integration', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Automation Templates and Audit',
    module: 'Workflow Automation Engine',
    status: 'registered',
    dependencies: ['Workflow Automation Builder', 'Resident Command Center', 'Task and ADL Tracking'],
    version: '0.1.0'
  },
  {
    featureName: 'Training Center and Learning Paths',
    module: 'Hubsteria Academy',
    status: 'registered',
    dependencies: ['Configuration Center', 'User Roles', 'Notification Center Integration'],
    version: '0.1.0'
  },
  {
    featureName: 'Certifications and AI Help',
    module: 'Hubsteria Academy',
    status: 'registered',
    dependencies: ['Training Center and Learning Paths', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Help Desk Ticket System',
    module: 'Help Desk & Support Center',
    status: 'registered',
    dependencies: ['Notification Center Integration', 'Hubsteria Academy', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Remote Assistance and Support Analytics',
    module: 'Help Desk & Support Center',
    status: 'registered',
    dependencies: ['Help Desk Ticket System', 'Configuration Center'],
    version: '0.1.0'
  },
  {
    featureName: 'Executive Command Center',
    module: 'Executive Command Center',
    status: 'registered',
    dependencies: ['Role-Aware Dashboards', 'Tenant Isolation Guard', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'Facility Health and Survey Readiness Scores',
    module: 'Executive Command Center',
    status: 'registered',
    dependencies: ['Incidents & Compliance Center', 'Billing & Financial Operations', 'Hubsteria Academy'],
    version: '0.1.0'
  },
  {
    featureName: 'AI Resident Summary and Compliance Assistant',
    module: 'AI Assistant & Insights Layer',
    status: 'registered',
    dependencies: ['Resident Command Center', 'Incidents & Compliance Center', 'Audit Log Contract'],
    version: '0.1.0'
  },
  {
    featureName: 'AI Family Drafts and Knowledge Assistant',
    module: 'AI Assistant & Insights Layer',
    status: 'registered',
    dependencies: ['Family Portal', 'Hubsteria Academy', 'Configuration Center'],
    version: '0.1.0'
  }
];

export const auditRequirements = ['Create', 'Update', 'Delete', 'Suspend', 'Activate', 'Invite', 'Transfer'];

export const globalRules = [
  'Mobile-first forever across pages, dashboards, modals, reports, workflows, and print screens',
  'No horizontal scrolling; responsive grids, card layouts, large typography, and touch-friendly controls',
  'Dashboard target under 2 seconds, resident search under 1 second, medication actions under 1 second',
  'Regression protection for authentication, residents, users, medications, notifications, printing, and reports',
  'HIPAA privacy with strict organization, facility, role, and permission boundaries',
  'Connector architecture for DigitalRX, HL7, FHIR, REST APIs, and webhooks'
];
