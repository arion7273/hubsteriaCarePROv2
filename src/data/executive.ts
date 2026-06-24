export type ExecutiveMetric = {
  label: string;
  value: string;
  detail: string;
};

export type FacilityHealth = {
  facility: string;
  occupancy: string;
  medicationCompliance: string;
  incidents: string;
  surveyReadiness: string;
  healthScore: string;
};

export type ExecutiveScore = {
  label: string;
  score: string;
  detail: string;
};

export const executiveMetrics: ExecutiveMetric[] = [
  { label: 'Occupancy', value: '92%', detail: 'Across 18 facilities' },
  { label: 'Revenue', value: '$1.84M', detail: 'Monthly recurring revenue' },
  { label: 'Medication Compliance', value: '97.8%', detail: 'Enterprise med pass completion' },
  { label: 'Incidents', value: '214', detail: '42 need leadership review' },
  { label: 'Assessments', value: '91%', detail: 'On-time completion' },
  { label: 'Staffing', value: '96%', detail: 'Shift coverage' },
  { label: 'Training', value: '78%', detail: 'Role learning completion' },
  { label: 'Billing', value: '91%', detail: 'Collection tracking' }
];

export const executiveScores: ExecutiveScore[] = [
  {
    label: 'Survey Readiness Score',
    score: '91',
    detail: 'Incident packets, assessments, signatures, and medication records'
  },
  {
    label: 'Compliance Score',
    score: '94',
    detail: 'Late meds, missing documentation, open incidents, and expiring orders'
  },
  {
    label: 'Facility Health Score',
    score: '89',
    detail: 'Composite of operations, staffing, billing, training, and resident risk'
  }
];

export const facilityPerformance: FacilityHealth[] = [
  {
    facility: 'Cedar Grove Assisted Living',
    occupancy: '94%',
    medicationCompliance: '98%',
    incidents: '18',
    surveyReadiness: '93',
    healthScore: '91'
  },
  {
    facility: 'Pine Ridge Memory Care',
    occupancy: '89%',
    medicationCompliance: '96%',
    incidents: '27',
    surveyReadiness: '88',
    healthScore: '86'
  },
  {
    facility: 'Northstar Group Home',
    occupancy: '97%',
    medicationCompliance: '99%',
    incidents: '6',
    surveyReadiness: '96',
    healthScore: '95'
  }
];

export const executiveDrilldowns = [
  'Multi-facility occupancy view',
  'Revenue and outstanding balances',
  'Medication compliance by facility',
  'Incident trends and corrective actions',
  'Assessment completion and care plan reviews',
  'Staffing coverage and training alerts',
  'Billing aging and collection tracking',
  'Survey readiness packet status'
];

export const executiveIntegrationRequirements = [
  'T1 and T2 administrators can view multi-facility performance while T3 users remain facility-scoped',
  'Executive dashboards aggregate medication compliance, incidents, assessments, staffing, training, billing, occupancy, and survey readiness',
  'Notification Center Pro escalates enterprise risk trends and facility health alerts',
  'Print Center Pro exports executive packets, facility rankings, survey readiness summaries, and board reports',
  'All executive dashboard access, drilldowns, exports, and score changes create immutable audit records'
];
