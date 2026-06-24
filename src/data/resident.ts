export type ResidentRiskTone = 'warning' | 'danger' | 'success';

export type ResidentRisk = {
  label: string;
  tone: ResidentRiskTone;
};

export type ResidentProfileSection = {
  title: string;
  summary: string;
  fields: Array<{
    label: string;
    value: string;
  }>;
};

export type ResidentTimelineEvent = {
  type: 'Note' | 'Assessment' | 'Medication Activity' | 'Incident' | 'Care Plan' | 'Billing Event' | 'Document';
  title: string;
  detail: string;
  time: string;
};

export const residentCommandCenter = {
  name: 'Maria Alvarez',
  preferredName: 'Maria',
  room: '214B',
  age: 82,
  levelOfCare: 'Memory Care',
  facility: 'Cedar Grove Assisted Living',
  organization: 'Northstar Senior Living',
  photoInitials: 'MA',
  risks: [
    { label: 'Fall Risk', tone: 'danger' },
    { label: 'Wander Guard', tone: 'warning' },
    { label: 'Allergy: Penicillin', tone: 'danger' },
    { label: 'Diet: Mechanical Soft', tone: 'warning' }
  ] satisfies ResidentRisk[],
  quickActions: [
    'Add Note',
    'Add Assessment',
    'Add Incident',
    'Add Medication',
    'Add Task',
    'Upload Document',
    'Print'
  ],
  profileSections: [
    {
      title: 'Demographics',
      summary: 'Core identity, room, care level, and resident preferences.',
      fields: [
        { label: 'Date of Birth', value: '04/12/1944' },
        { label: 'Move-In Date', value: '09/18/2024' },
        { label: 'Primary Language', value: 'English' }
      ]
    },
    {
      title: 'Contacts',
      summary: 'Responsible parties, emergency contacts, family access, and preferred communication.',
      fields: [
        { label: 'Primary Contact', value: 'Elena Alvarez, Daughter' },
        { label: 'Phone', value: '(555) 014-2280' },
        { label: 'Family Portal', value: 'Enabled' }
      ]
    },
    {
      title: 'Insurance',
      summary: 'Coverage and payer information required for operations and billing.',
      fields: [
        { label: 'Primary', value: 'Medicare Advantage' },
        { label: 'Secondary', value: 'Private Pay' },
        { label: 'Billing Status', value: 'Current' }
      ]
    },
    {
      title: 'Physicians',
      summary: 'Primary care, specialists, pharmacy, and provider communication routes.',
      fields: [
        { label: 'Primary Physician', value: 'Dr. A. Patel' },
        { label: 'Pharmacy', value: 'DigitalRX Connected' },
        { label: 'Preferred Route', value: 'Secure Message' }
      ]
    },
    {
      title: 'Diagnoses',
      summary: 'Active diagnoses used by care planning, assessments, and clinical alerts.',
      fields: [
        { label: 'Primary', value: 'Alzheimer disease' },
        { label: 'Secondary', value: 'Hypertension' },
        { label: 'Mobility', value: 'Walker with supervision' }
      ]
    },
    {
      title: 'Allergies',
      summary: 'Medication and food allergies surfaced throughout eMAR and ordering workflows.',
      fields: [
        { label: 'Medication', value: 'Penicillin' },
        { label: 'Food', value: 'Shellfish' },
        { label: 'Alert Level', value: 'High' }
      ]
    },
    {
      title: 'Documents',
      summary: 'Consents, advance directives, physician orders, identification, and uploads.',
      fields: [
        { label: 'Advance Directive', value: 'On file' },
        { label: 'POLST', value: 'Needs review' },
        { label: 'Last Upload', value: 'Medication order PDF' }
      ]
    },
    {
      title: 'Timeline',
      summary: 'Unified clinical, operational, financial, and document history.',
      fields: [
        { label: 'Last Event', value: 'Medication given' },
        { label: 'Open Follow-Ups', value: '3' },
        { label: 'Print Ready', value: 'Yes' }
      ]
    }
  ] satisfies ResidentProfileSection[],
  timeline: [
    {
      type: 'Medication Activity',
      title: 'Morning medication pass completed',
      detail: 'Lisinopril 10mg given; no adverse reaction reported.',
      time: 'Today, 8:04 AM'
    },
    {
      type: 'Note',
      title: 'Caregiver shift note',
      detail: 'Resident ate 75% of breakfast and joined morning activities.',
      time: 'Today, 9:12 AM'
    },
    {
      type: 'Assessment',
      title: 'Fall risk reassessment due',
      detail: 'Quarterly review queued for Wellness Director approval.',
      time: 'Tomorrow'
    },
    {
      type: 'Incident',
      title: 'Resolved wandering alert',
      detail: 'Door alert reviewed, no injury, family notification not required.',
      time: 'Yesterday, 7:46 PM'
    },
    {
      type: 'Care Plan',
      title: 'Memory care intervention updated',
      detail: 'Added redirection cueing every evening shift.',
      time: 'Jun 21'
    },
    {
      type: 'Billing Event',
      title: 'Level of care review posted',
      detail: 'Billing center received updated care level documentation.',
      time: 'Jun 20'
    },
    {
      type: 'Document',
      title: 'Physician order uploaded',
      detail: 'New order is available for Print Center Pro and future DigitalRX matching.',
      time: 'Jun 19'
    }
  ] satisfies ResidentTimelineEvent[],
  moduleConnections: [
    'Assessments',
    'Care Plans',
    'eMAR',
    'ADLs',
    'Tasks',
    'Incidents',
    'Billing',
    'Documents',
    'Print Center Pro',
    'Notification Center Pro'
  ]
};
