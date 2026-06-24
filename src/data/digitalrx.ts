export type PharmacyInboxStatus = 'New' | 'Matched' | 'Needs Review' | 'Synced' | 'Error';
export type RefillStatus = 'Requested' | 'Processing' | 'Shipped' | 'Delivered';

export type DigitalRxMetric = {
  label: string;
  value: string;
  detail: string;
};

export type PharmacyInboxItem = {
  type: string;
  resident: string;
  medication: string;
  status: PharmacyInboxStatus;
  received: string;
};

export type MedicationSyncField = {
  field: string;
  source: string;
  destination: string;
};

export const digitalRxConnection = {
  endpoint: 'https://api.digitalrx.example/v1',
  apiKeyStatus: 'Stored in secure connector vault',
  connectionStatus: 'Connected',
  lastSync: 'Today, 9:42 AM'
};

export const digitalRxMetrics: DigitalRxMetric[] = [
  { label: 'New Orders', value: '12', detail: 'Awaiting pharmacy inbox review' },
  { label: 'Medication Changes', value: '7', detail: 'Need resident matching confirmation' },
  { label: 'Refills', value: '18', detail: 'Processing, shipped, or delivered' },
  { label: 'Sync Errors', value: '3', detail: 'Connector queue needs attention' }
];

export const pharmacyInbox: PharmacyInboxItem[] = [
  {
    type: 'Medication Order',
    resident: 'Maria Alvarez',
    medication: 'Memantine 5mg',
    status: 'Matched',
    received: 'Today, 9:30 AM'
  },
  {
    type: 'Medication Change',
    resident: 'James Bennett',
    medication: 'Acetaminophen 500mg PRN',
    status: 'Needs Review',
    received: 'Today, 8:56 AM'
  },
  {
    type: 'Discontinued Order',
    resident: 'Linda Chen',
    medication: 'Warfarin 2mg',
    status: 'New',
    received: 'Today, 8:12 AM'
  },
  {
    type: 'Refill Update',
    resident: 'Maria Alvarez',
    medication: 'Lisinopril 10mg',
    status: 'Synced',
    received: 'Yesterday, 5:44 PM'
  }
];

export const medicationSyncFields: MedicationSyncField[] = [
  { field: 'Medication Name', source: 'DigitalRX order', destination: 'HubsteriaCarePRO eMAR' },
  { field: 'Strength', source: 'DigitalRX order', destination: 'Medication order dosage' },
  { field: 'Frequency', source: 'DigitalRX schedule', destination: 'Med pass schedule' },
  { field: 'Route', source: 'DigitalRX SIG', destination: 'Medication route' },
  { field: 'Start Date', source: 'DigitalRX effective date', destination: 'Order start date' },
  { field: 'End Date', source: 'DigitalRX stop date', destination: 'Order end date' }
];

export const residentMatchingRules = [
  'Match by resident name, date of birth, facility, and room',
  'Flag near matches for pharmacy inbox review',
  'Prevent medication import until resident match is confirmed',
  'Write all match decisions to immutable audit logs'
];

export const refillTracking = [
  { medication: 'Lisinopril 10mg', resident: 'Maria Alvarez', status: 'Delivered' as RefillStatus },
  { medication: 'Acetaminophen 500mg', resident: 'James Bennett', status: 'Shipped' as RefillStatus },
  { medication: 'Memantine 5mg', resident: 'Maria Alvarez', status: 'Processing' as RefillStatus },
  { medication: 'Hydralazine 25mg', resident: 'Linda Chen', status: 'Requested' as RefillStatus }
];

export const digitalRxEvents = ['order_created', 'order_updated', 'order_discontinued', 'refill_updated'];

export const digitalRxIntegrationRequirements = [
  'DigitalRX remains the pharmacy source of truth while HubsteriaCarePRO powers caregiver-facing eMAR workflows',
  'Connector architecture supports REST APIs, FHIR-ready mapping, webhooks, and future pharmacy systems',
  'Pharmacy inbox reviews incoming orders, medication changes, discontinued orders, refill updates, and sync errors',
  'Resident matching is required before medication sync can update eMAR orders',
  'All connector actions, matches, imports, updates, discontinuations, refills, and errors create immutable audit logs'
];
