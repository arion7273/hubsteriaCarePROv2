export type ConfigurationArea = {
  name: string;
  owner: string;
  scope: 'Platform' | 'Organization' | 'Facility' | 'Role-Based';
  settings: string[];
};

export type FeatureToggle = {
  name: string;
  module: string;
  status: 'Enabled' | 'Disabled' | 'Pilot';
  scope: string;
};

export type ConfigurationAuditEvent = {
  action: string;
  entity: string;
  actor: string;
  scope: string;
  timestamp: string;
};

export const configurationAreas: ConfigurationArea[] = [
  {
    name: 'Roles & Permissions',
    owner: 'T1 Master Administrator',
    scope: 'Role-Based',
    settings: ['Permission matrix', 'Role templates', 'Invite rules', 'Access boundaries']
  },
  {
    name: 'Assessment Templates',
    owner: 'Organization Administrator',
    scope: 'Organization',
    settings: ['Sections', 'Questions', 'Scoring', 'Required fields', 'Electronic signatures']
  },
  {
    name: 'Incident Types',
    owner: 'Facility Administrator',
    scope: 'Facility',
    settings: ['Fall', 'Injury', 'Medication error', 'Behavioral event', 'Elopement', 'Infection event']
  },
  {
    name: 'Notification Rules',
    owner: 'Organization Administrator',
    scope: 'Organization',
    settings: ['Templates', 'Routes', 'Escalations', 'Role targets', 'Delivery tracking']
  },
  {
    name: 'Print Templates',
    owner: 'Facility Administrator',
    scope: 'Facility',
    settings: ['Headers', 'Footers', 'Logos', 'Signatures', 'QR codes', 'Batch rules']
  },
  {
    name: 'Workflow Templates',
    owner: 'T1 Master Administrator',
    scope: 'Platform',
    settings: ['Triggers', 'Conditions', 'Actions', 'Audit requirements']
  },
  {
    name: 'DigitalRX Settings',
    owner: 'Organization Administrator',
    scope: 'Organization',
    settings: ['API endpoint', 'API key storage', 'Connection status', 'Last sync', 'Webhook events']
  },
  {
    name: 'Facility Settings',
    owner: 'Facility Administrator',
    scope: 'Facility',
    settings: ['Care levels', 'Rooms', 'Shift settings', 'Time zone', 'Default notifications']
  },
  {
    name: 'Branding',
    owner: 'Organization Administrator',
    scope: 'Organization',
    settings: ['Logo', 'Color palette', 'Print branding', 'Family portal identity']
  }
];

export const featureToggles: FeatureToggle[] = [
  {
    name: 'Regional Administrator T2.5',
    module: 'Enterprise Hierarchy',
    status: 'Disabled',
    scope: 'Prepared for future large operators'
  },
  {
    name: 'DigitalRX Pharmacy Hub',
    module: 'Integrations',
    status: 'Pilot',
    scope: 'Selected organizations only'
  },
  {
    name: 'AI Resident Summary',
    module: 'AI & Analytics',
    status: 'Disabled',
    scope: 'Future enterprise phase'
  },
  {
    name: 'Mobile Offline Mode',
    module: 'Performance & Scalability',
    status: 'Pilot',
    scope: 'Caregiver mobile workflows'
  }
];

export const configurationAuditEvents: ConfigurationAuditEvent[] = [
  {
    action: 'Updated',
    entity: 'Medication Refused notification route',
    actor: 'T1 Master Administrator',
    scope: 'Platform',
    timestamp: 'Today, 9:36 AM'
  },
  {
    action: 'Created',
    entity: 'Resident Face Sheet print template',
    actor: 'Facility Administrator',
    scope: 'Cedar Grove Assisted Living',
    timestamp: 'Today, 9:22 AM'
  },
  {
    action: 'Piloted',
    entity: 'DigitalRX Pharmacy Hub toggle',
    actor: 'Organization Administrator',
    scope: 'Northstar Senior Living',
    timestamp: 'Yesterday, 4:12 PM'
  }
];

export const configurationGuardrails = [
  'Settings are centralized so clinical modules do not scatter administration across separate pages',
  'Every configuration change creates an immutable audit log record',
  'Role and tenant scope determine who can view, create, update, or disable settings',
  'Feature toggles support safe rollout, pilots, and future enterprise expansion',
  'Notification, print, workflow, assessment, incident, and DigitalRX settings remain reusable by future modules'
];
