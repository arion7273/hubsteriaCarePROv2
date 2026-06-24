export type SearchCategory = 'Resident' | 'Staff' | 'Incident' | 'Assessment' | 'Medication' | 'Task' | 'Report';

export type SearchRecord = {
  category: SearchCategory;
  title: string;
  description: string;
  location: string;
  action: string;
};

export type ProductivityDashboard = {
  role: 'T1 Master' | 'T2 Organization' | 'T3 Facility';
  widgets: string[];
  shortcuts: string[];
};

export const productivitySearchIndex: SearchRecord[] = [
  {
    category: 'Resident',
    title: 'Maria Alvarez',
    description: 'Room 214B, Memory Care, Fall Risk, active Resident Command Center.',
    location: 'Resident Command Center',
    action: 'Open Resident'
  },
  {
    category: 'Staff',
    title: 'Nurse Jamal Reed',
    description: 'Medication manager on day shift with eMAR access.',
    location: 'Facility Staff',
    action: 'View Staff Profile'
  },
  {
    category: 'Incident',
    title: 'Resolved wandering alert',
    description: 'Door alert reviewed for Maria Alvarez; no injury reported.',
    location: 'Incident Center',
    action: 'Open Incident'
  },
  {
    category: 'Assessment',
    title: 'Fall risk reassessment due',
    description: 'Quarterly review queued for Wellness Director approval.',
    location: 'Assessment Center',
    action: 'Start Assessment'
  },
  {
    category: 'Medication',
    title: 'Lisinopril 10mg',
    description: 'Morning medication pass completed with no adverse reaction.',
    location: 'eMAR',
    action: 'Open Medication'
  },
  {
    category: 'Task',
    title: 'Evening redirection cueing',
    description: 'Memory care intervention assigned to evening shift.',
    location: 'Task Center',
    action: 'Open Task'
  },
  {
    category: 'Report',
    title: 'Medication compliance dashboard',
    description: 'Facility medication completion, late meds, refusals, and missed medication trends.',
    location: 'Reports',
    action: 'Open Report'
  }
];

export const commandCapabilities = [
  'Search Resident',
  'Create Resident',
  'Create Incident',
  'Create Assessment',
  'Open Reports',
  'Start Med Pass',
  'Print Resident Packet',
  'Review Notifications'
];

export const pinnedActions = [
  'Add Resident',
  'Start Assessment',
  'Log Incident',
  'Open Med Pass',
  'Print Face Sheet',
  'Send Facility Announcement'
];

export const favorites = [
  {
    label: 'Maria Alvarez',
    type: 'Resident',
    note: 'Pinned for active memory care follow-up'
  },
  {
    label: 'Medication Compliance',
    type: 'Report',
    note: 'Daily administrator review'
  },
  {
    label: 'Survey Readiness',
    type: 'Dashboard',
    note: 'Compliance leadership favorite'
  },
  {
    label: 'DigitalRX Sync Queue',
    type: 'Integration',
    note: 'Pharmacy connection monitoring'
  }
];

export const personalizedDashboards: ProductivityDashboard[] = [
  {
    role: 'T1 Master',
    widgets: ['Platform Health', 'MRR/ARR', 'API Health', 'Feature Registry', 'Global Audit Activity'],
    shortcuts: ['Create Organization', 'Manage Subscription', 'Open System Health']
  },
  {
    role: 'T2 Organization',
    widgets: ['Facility Ranking', 'Occupancy', 'Revenue', 'Survey Readiness', 'Training Completion'],
    shortcuts: ['Create Facility', 'Invite T3 Administrator', 'Open Organization Reports']
  },
  {
    role: 'T3 Facility',
    widgets: ['Med Pass Completion', 'Tasks Due', 'Incidents', 'Staff On Shift', 'Family Messages'],
    shortcuts: ['Add Resident', 'Log Incident', 'Start Assessment']
  }
];
