export type AssessmentStatus = 'Due' | 'In Progress' | 'Review' | 'Complete';

export type AssessmentMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AssessmentTemplate = {
  name: string;
  category: string;
  cadence: string;
  status: AssessmentStatus;
  sections: string[];
};

export type AssessmentBuilderControl = {
  name: string;
  description: string;
};

export type CarePlanItem = {
  goal: string;
  interventions: string[];
  outcome: string;
  reviewDate: string;
  assignedStaff: string;
};

export const assessmentMetrics: AssessmentMetric[] = [
  { label: 'Assessments Due', value: '32', detail: '11 overdue across active residents' },
  { label: 'In Review', value: '14', detail: 'Awaiting Wellness Director approval' },
  { label: 'Care Plans Active', value: '86', detail: 'Resident-linked interventions' },
  { label: 'Auto Suggestions', value: '24', detail: 'Generated from scored assessments' }
];

export const assessmentTypes = [
  'Initial Assessment',
  'Move-In Assessment',
  'Quarterly Assessment',
  'Annual Assessment',
  'Fall Risk Assessment',
  'Skin Assessment',
  'Nutrition Assessment',
  'Cognitive Assessment',
  'Behavioral Assessment',
  'Medication Assessment',
  'Custom Assessments'
];

export const assessmentTemplates: AssessmentTemplate[] = [
  {
    name: 'Fall Risk Assessment',
    category: 'Safety',
    cadence: 'Quarterly and after incident',
    status: 'Due',
    sections: ['Mobility', 'History of Falls', 'Assistive Devices', 'Environmental Risk', 'Scoring']
  },
  {
    name: 'Move-In Assessment',
    category: 'Admission',
    cadence: 'Once at move-in',
    status: 'In Progress',
    sections: ['Demographics', 'Care Needs', 'Diagnoses', 'Allergies', 'Signatures']
  },
  {
    name: 'Medication Assessment',
    category: 'Clinical',
    cadence: 'Monthly',
    status: 'Review',
    sections: ['Orders', 'Refusals', 'PRNs', 'Side Effects', 'Pharmacy Follow-Up']
  },
  {
    name: 'Nutrition Assessment',
    category: 'Wellness',
    cadence: 'Quarterly',
    status: 'Complete',
    sections: ['Diet', 'Weight Trend', 'Swallowing', 'Hydration', 'Interventions']
  }
];

export const assessmentBuilderControls: AssessmentBuilderControl[] = [
  {
    name: 'Questions',
    description: 'Build reusable single-select, multi-select, text, date, number, and signature questions.'
  },
  {
    name: 'Sections',
    description: 'Group questions into resident-friendly clinical sections with mobile card layouts.'
  },
  {
    name: 'Conditional Logic',
    description: 'Show follow-up questions or required notes based on previous answers.'
  },
  {
    name: 'Scoring Rules',
    description: 'Generate risk scores, review queues, and suggested care plan interventions.'
  },
  {
    name: 'Required Fields',
    description: 'Prevent incomplete submissions when clinical or regulatory fields are missing.'
  },
  {
    name: 'Electronic Signatures',
    description: 'Capture staff signatures and preserve immutable review history.'
  }
];

export const carePlanItems: CarePlanItem[] = [
  {
    goal: 'Reduce fall risk during evening shift',
    interventions: ['Escort to dining room', 'Keep walker within reach', 'Night light on after 7 PM'],
    outcome: 'No falls for 30 consecutive days',
    reviewDate: 'Jul 24, 2026',
    assignedStaff: 'Wellness Director'
  },
  {
    goal: 'Maintain nutrition and hydration',
    interventions: ['Offer fluids every 2 hours', 'Track meal intake', 'Notify nurse for intake below 50%'],
    outcome: 'Weight stable within 2 lbs',
    reviewDate: 'Jul 10, 2026',
    assignedStaff: 'Caregiver Lead'
  },
  {
    goal: 'Improve medication adherence',
    interventions: ['Explain medication purpose', 'Offer with preferred beverage', 'Document refusals immediately'],
    outcome: 'Refusals below 2 per month',
    reviewDate: 'Jul 18, 2026',
    assignedStaff: 'Medication Manager'
  }
];

export const autoCarePlanSuggestions = [
  {
    source: 'Fall Risk Assessment',
    suggestion: 'Add supervised transfers during evening shift',
    confidence: 'High'
  },
  {
    source: 'Nutrition Assessment',
    suggestion: 'Create hydration reminder task every 2 hours',
    confidence: 'Medium'
  },
  {
    source: 'Medication Assessment',
    suggestion: 'Notify nurse when PRN follow-up outcome is missing',
    confidence: 'High'
  }
];

export const assessmentReviewQueue = [
  {
    resident: 'Maria Alvarez',
    assessment: 'Fall Risk Assessment',
    due: 'Tomorrow',
    reviewer: 'Wellness Director'
  },
  {
    resident: 'James Bennett',
    assessment: 'Move-In Assessment',
    due: 'Today',
    reviewer: 'Facility Administrator'
  },
  {
    resident: 'Linda Chen',
    assessment: 'Medication Assessment',
    due: 'Overdue',
    reviewer: 'Medication Manager'
  }
];

export const assessmentIntegrationRequirements = [
  'Resident Command Center displays active care plans, upcoming reviews, assessment history, and care plan revisions',
  'Print Center Pro generates assessment reports, care plans, and progress reports',
  'Notification Center Pro alerts staff when assessments are due, care plan reviews are due, or assessments are incomplete',
  'Configuration Center owns assessment templates, sections, scoring, required fields, and electronic signatures',
  'All assessment and care plan revisions create immutable audit records'
];
