export type PrintFormat = 'PDF' | 'CSV' | 'Excel';

export type PrintCapability = {
  format: PrintFormat;
  purpose: string;
  defaultUse: string;
};

export type PrintTemplate = {
  name: string;
  module: string;
  format: PrintFormat;
  status: 'Active' | 'Draft';
  includes: string[];
};

export type BatchPrintJob = {
  name: string;
  scope: string;
  records: string;
  output: PrintFormat;
  status: 'Ready' | 'Scheduled' | 'Preview Required';
};

export const printCapabilities: PrintCapability[] = [
  {
    format: 'PDF',
    purpose: 'Resident packets, assessments, care plans, incidents, medication records, and official reports.',
    defaultUse: 'Regulatory and clinical printouts'
  },
  {
    format: 'CSV',
    purpose: 'Operational exports for audits, reconciliation, analysis, and migration support.',
    defaultUse: 'Fast tabular data export'
  },
  {
    format: 'Excel',
    purpose: 'Administrator-friendly workbooks with filtering, multi-sheet reports, and financial exports.',
    defaultUse: 'Office analysis and billing workflows'
  }
];

export const templateBuilderFeatures = [
  'Headers',
  'Footers',
  'Logos',
  'Signatures',
  'QR Codes',
  'Barcodes',
  'Conditional Content',
  'Preview Before Printing',
  'Save Templates',
  'CRUD Templates',
  'Batch Printing'
];

export const printTemplates: PrintTemplate[] = [
  {
    name: 'Resident Face Sheet',
    module: 'Resident Command Center',
    format: 'PDF',
    status: 'Active',
    includes: ['Photo', 'Demographics', 'Contacts', 'Allergies', 'Risk Indicators', 'QR Code']
  },
  {
    name: 'Medication Administration Record',
    module: 'eMAR',
    format: 'PDF',
    status: 'Draft',
    includes: ['Resident Banner', 'Medication Orders', 'Signatures', 'Refusals', 'Barcode']
  },
  {
    name: 'Assessment Summary Export',
    module: 'Assessments',
    format: 'Excel',
    status: 'Draft',
    includes: ['Scores', 'Review Dates', 'Assigned Staff', 'Care Plan Suggestions']
  },
  {
    name: 'Incident Register',
    module: 'Incidents',
    format: 'CSV',
    status: 'Active',
    includes: ['Incident Type', 'Resident', 'Severity', 'Resolution', 'Audit Link']
  }
];

export const batchPrintJobs: BatchPrintJob[] = [
  {
    name: 'Survey Readiness Packet',
    scope: 'Facility',
    records: '86 residents',
    output: 'PDF',
    status: 'Preview Required'
  },
  {
    name: 'Monthly Medication Audit',
    scope: 'Facility eMAR',
    records: '1,284 med actions',
    output: 'Excel',
    status: 'Ready'
  },
  {
    name: 'Organization Incident Export',
    scope: '18 facilities',
    records: '214 incidents',
    output: 'CSV',
    status: 'Scheduled'
  }
];

export const printPreview = {
  template: 'Resident Face Sheet',
  resident: 'Maria Alvarez',
  pageCount: 4,
  watermark: 'Preview',
  lastGenerated: 'Today, 9:18 AM',
  validation: ['Logo present', 'Signature block present', 'QR code scannable', 'No missing required fields']
};

export const printIntegrationRequirements = [
  'Every major record can route to Print Center Pro through a module-owned print action',
  'Templates support tenant branding by organization and facility',
  'Preview is required before final print, export, or batch generation',
  'Print actions create immutable audit records with user, timestamp, resident, facility, and template',
  'Future modules must register printable records in the feature registry before release'
];
