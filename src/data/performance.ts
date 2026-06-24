export type PerformanceStatus = 'Ready' | 'In Progress' | 'Planned';

export type PerformanceMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ScaleCapability = {
  name: string;
  status: PerformanceStatus;
  purpose: string;
};

export type LoadTestTarget = {
  scenario: string;
  target: string;
  status: PerformanceStatus;
};

export const performanceMetrics: PerformanceMetric[] = [
  { label: 'Dashboard Load', value: '<2s', detail: 'Foundation performance target' },
  { label: 'Resident Search', value: '<1s', detail: 'Global search target' },
  { label: 'Medication Actions', value: '<1s', detail: 'Med pass safety workflow' },
  { label: 'Scale Goal', value: '10k+', detail: 'Facilities and residents ready for expansion' }
];

export const scaleCapabilities: ScaleCapability[] = [
  {
    name: 'Caching',
    status: 'Ready',
    purpose: 'Cache dashboard, resident summary, search, and reference configuration data.'
  },
  {
    name: 'Background Processing',
    status: 'Ready',
    purpose: 'Move notifications, print jobs, imports, exports, and AI summaries out of request paths.'
  },
  {
    name: 'Queue System',
    status: 'Ready',
    purpose: 'Reliably process DigitalRX sync, SMS/email/push, batch printing, audit events, and automation actions.'
  },
  {
    name: 'Optimized Search',
    status: 'Ready',
    purpose: 'Support residents, staff, medications, incidents, reports, tickets, and documents from one command surface.'
  },
  {
    name: 'Database Indexing',
    status: 'Planned',
    purpose: 'Index tenant, organization, facility, resident, medication, task, notification, and audit dimensions.'
  },
  {
    name: 'Lazy Loading',
    status: 'Ready',
    purpose: 'Load module sections progressively to keep mobile dashboards fast.'
  },
  {
    name: 'Infinite Scroll',
    status: 'Ready',
    purpose: 'Handle long resident timelines, audit logs, communication threads, and report histories.'
  },
  {
    name: 'Offline-Friendly Mobile Support',
    status: 'Planned',
    purpose: 'Queue caregiver documentation actions safely during poor network connectivity.'
  }
];

export const loadTestTargets: LoadTestTarget[] = [
  {
    scenario: 'Executive dashboard multi-facility load',
    target: 'Under 2 seconds for 18-facility rollup',
    status: 'Ready'
  },
  {
    scenario: 'Resident search',
    target: 'Under 1 second across 50k residents',
    status: 'Ready'
  },
  {
    scenario: 'Medication action',
    target: 'Under 1 second for med pass action save',
    status: 'Ready'
  },
  {
    scenario: 'Batch print queue',
    target: 'Process 500 resident packets without blocking UI',
    status: 'In Progress'
  },
  {
    scenario: 'DigitalRX webhook burst',
    target: 'Handle 10k order/refill events per hour through queue workers',
    status: 'Planned'
  }
];

export const scalabilityArchitecture = [
  'Tenant-aware caching keys include organization, facility, role, permission, and resident scope',
  'Background workers process notifications, audit writes, pharmacy sync, print jobs, and AI generation',
  'Search indices are partitioned by tenant and filtered by facility permissions',
  'Lazy loaded modules keep mobile dashboards and Resident Command Center interactions fast',
  'Offline mobile actions are queued with conflict detection, audit replay, and supervisor review'
];

export const performanceIntegrationRequirements = [
  'Every module must preserve dashboard, resident search, and medication action performance budgets',
  'Regression tests and CI build must remain required before deployment',
  'Load testing covers dashboards, search, med pass, notifications, print queues, DigitalRX sync, and audit volume',
  'Monitoring and error tracking must expose slow queries, queue backlogs, failed jobs, and client-side performance regressions',
  'Scalability architecture must support thousands of facilities and tens of thousands of residents without cross-tenant leakage'
];
