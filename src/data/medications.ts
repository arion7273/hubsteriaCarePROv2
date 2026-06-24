export type MedicationOrderStatus = 'Active' | 'Future' | 'PRN' | 'Discontinued' | 'Hold';
export type MedPassAction = 'Given' | 'Refused' | 'Held' | 'Resident Absent' | 'Not Available';

export type MedicationMetric = {
  label: string;
  value: string;
  detail: string;
};

export type MedicationOrder = {
  medication: string;
  status: MedicationOrderStatus;
  dosage: string;
  route: string;
  schedule: string;
  instructions: string;
};

export type MedPassResident = {
  resident: string;
  room: string;
  photo: string;
  medication: string;
  dosage: string;
  route: string;
  schedule: string;
  instructions: string;
  actions: MedPassAction[];
};

export const medicationMetrics: MedicationMetric[] = [
  { label: 'Med Pass Completion', value: '94%', detail: '7 administrations pending' },
  { label: 'Late Medications', value: '5', detail: 'Need nurse review' },
  { label: 'PRN Follow-Ups', value: '3', detail: 'Outcome documentation due' },
  { label: 'Controlled Count Alerts', value: '1', detail: 'Witness signature required' }
];

export const medicationOrders: MedicationOrder[] = [
  {
    medication: 'Lisinopril',
    status: 'Active',
    dosage: '10mg',
    route: 'PO',
    schedule: 'Daily at 8:00 AM',
    instructions: 'Hold if systolic BP is below 100'
  },
  {
    medication: 'Acetaminophen',
    status: 'PRN',
    dosage: '500mg',
    route: 'PO',
    schedule: 'Every 6 hours PRN pain',
    instructions: 'Document pain reason and follow-up outcome'
  },
  {
    medication: 'Memantine',
    status: 'Future',
    dosage: '5mg',
    route: 'PO',
    schedule: 'Starts tomorrow at 8:00 PM',
    instructions: 'Monitor dizziness and confusion'
  },
  {
    medication: 'Warfarin',
    status: 'Hold',
    dosage: '2mg',
    route: 'PO',
    schedule: 'Daily at 6:00 PM',
    instructions: 'Hold pending INR review'
  }
];

export const medPassResidents: MedPassResident[] = [
  {
    resident: 'Maria Alvarez',
    room: '214B',
    photo: 'MA',
    medication: 'Lisinopril',
    dosage: '10mg',
    route: 'PO',
    schedule: '8:00 AM',
    instructions: 'Check blood pressure before administration',
    actions: ['Given', 'Refused', 'Held', 'Resident Absent', 'Not Available']
  },
  {
    resident: 'James Bennett',
    room: '110A',
    photo: 'JB',
    medication: 'Acetaminophen',
    dosage: '500mg',
    route: 'PO',
    schedule: 'PRN',
    instructions: 'Record pain reason and reassess in 60 minutes',
    actions: ['Given', 'Refused', 'Held', 'Not Available']
  }
];

export const prnManagement = [
  'Track PRN reason before administration',
  'Require follow-up outcome within configured window',
  'Alert nurse when PRN outcome is missing',
  'Display PRN trend history in Resident Command Center'
];

export const controlledSubstanceChecks = [
  'Shift-start count',
  'Shift-end count',
  'Witness signatures',
  'Discrepancy alerts',
  'Immutable audit trail'
];

export const barcodeVerificationSteps = [
  'Scan resident wristband or profile barcode',
  'Scan medication package barcode',
  'Verify medication, dosage, route, resident, and schedule',
  'Block wrong resident or wrong medication action',
  'Record verification in audit trail'
];

export const medicationAlerts = [
  'Allergies',
  'Interactions',
  'Duplicates',
  'Expiring Orders',
  'Late Medications',
  'Missed Medications',
  'Refusals'
];

export const medicationComplianceItems = [
  {
    label: 'Late medication review',
    detail: '5 medications past scheduled window'
  },
  {
    label: 'Missed medication investigation',
    detail: '2 administrations need supervisor resolution'
  },
  {
    label: 'Refusal trend',
    detail: 'Maria Alvarez has 2 refusals this week'
  },
  {
    label: 'Expiring orders',
    detail: '3 orders expire within 7 days'
  }
];

export const medicationIntegrationRequirements = [
  'Resident Command Center displays medication orders, med pass activity, PRNs, alerts, refusals, and compliance history',
  'Notification Center Pro alerts nurses and administrators for late meds, missed meds, refusals, expiring orders, and controlled discrepancies',
  'Print Center Pro exports medication administration records, PRN reports, controlled substance logs, and compliance summaries',
  'Configuration Center owns medication schedules, PRN follow-up windows, alert rules, barcode settings, and controlled substance policies',
  'Every medication order, administration, refusal, hold, PRN outcome, count, witness signature, and discrepancy creates an immutable audit record'
];
