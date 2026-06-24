export type CourseStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Expiring';

export type AcademyMetric = {
  label: string;
  value: string;
  detail: string;
};

export type TrainingResource = {
  title: string;
  type: 'Knowledge Base' | 'Video' | 'Interactive Walkthrough';
  audience: string;
  status: CourseStatus;
};

export type LearningPath = {
  role: string;
  courses: string[];
  progress: string;
};

export type Certification = {
  name: string;
  holder: string;
  status: CourseStatus;
  expires: string;
};

export const academyMetrics: AcademyMetric[] = [
  { label: 'Completed Courses', value: '1,284', detail: 'Across active employees' },
  { label: 'Training Progress', value: '78%', detail: 'Average completion by role' },
  { label: 'Expiring Certifications', value: '19', detail: 'Due within 30 days' },
  { label: 'AI Help Searches', value: '342', detail: 'This week' }
];

export const trainingResources: TrainingResource[] = [
  {
    title: 'How do I document a medication refusal?',
    type: 'Knowledge Base',
    audience: 'Medication Managers',
    status: 'Completed'
  },
  {
    title: 'Mobile med pass walkthrough',
    type: 'Interactive Walkthrough',
    audience: 'Nurses and Medication Managers',
    status: 'In Progress'
  },
  {
    title: 'Incident documentation fundamentals',
    type: 'Video',
    audience: 'Caregivers and Facility Administrators',
    status: 'Completed'
  },
  {
    title: 'Family Portal communication standards',
    type: 'Knowledge Base',
    audience: 'Wellness Directors',
    status: 'Not Started'
  }
];

export const learningPaths: LearningPath[] = [
  {
    role: 'Caregiver',
    courses: ['ADL documentation', 'Task completion', 'Shift handoff', 'Incident basics'],
    progress: '82%'
  },
  {
    role: 'Medication Manager',
    courses: ['Med pass', 'PRN follow-up', 'Controlled counts', 'Barcode verification'],
    progress: '74%'
  },
  {
    role: 'Facility Administrator',
    courses: ['Compliance dashboard', 'Survey readiness', 'Notifications', 'Print Center'],
    progress: '88%'
  },
  {
    role: 'Family Member',
    courses: ['Family Portal overview', 'Secure messaging', 'Document signatures'],
    progress: '61%'
  }
];

export const certifications: Certification[] = [
  {
    name: 'Medication Administration Safety',
    holder: 'Nurse Jamal Reed',
    status: 'Completed',
    expires: 'Sep 15, 2026'
  },
  {
    name: 'Dementia Care Essentials',
    holder: 'Caregiver Lead',
    status: 'Expiring',
    expires: 'Jul 12, 2026'
  },
  {
    name: 'Incident Reporting Compliance',
    holder: 'Facility Administrator',
    status: 'Completed',
    expires: 'Dec 1, 2026'
  }
];

export const aiHelpExamples = [
  {
    question: 'How do I document a medication refusal?',
    answer: 'Open the resident med pass card, select Refused, document the reason, notify the nurse if required, and save the audit record.'
  },
  {
    question: 'How do I complete a fall incident report?',
    answer: 'Open Incidents, choose Fall, complete the report, attach witness notes, document root cause, assign corrective action, and print the packet if needed.'
  },
  {
    question: 'How do I send a family update?',
    answer: 'Open the resident communication panel, select family messaging, choose an approved update, verify visibility permissions, and send.'
  }
];

export const academyIntegrationRequirements = [
  'Configuration Center owns role-based learning paths, required courses, certification rules, and expiration windows',
  'Notification Center Pro alerts staff and administrators when required training or certifications are due or expiring',
  'Help guidance links directly to workflow pages such as eMAR, incidents, ADLs, family messaging, and billing',
  'Executive and facility dashboards surface training completion and expiring certification metrics',
  'All course completions, certification changes, AI help searches, and training assignments create immutable audit records'
];
