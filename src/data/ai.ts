export type AiInsightSeverity = 'Low' | 'Medium' | 'High';

export type AiMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AiResidentSummary = {
  resident: string;
  period: string;
  summary: string;
  highlights: string[];
};

export type AiComplianceInsight = {
  risk: string;
  severity: AiInsightSeverity;
  module: string;
  recommendation: string;
};

export type AiFamilyDraft = {
  resident: string;
  topic: string;
  draft: string;
  approval: string;
};

export type AiKnowledgeAnswer = {
  question: string;
  answer: string;
  module: string;
};

export const aiMetrics: AiMetric[] = [
  { label: 'Resident Summaries', value: '86', detail: 'Generated for active residents' },
  { label: 'Compliance Risks', value: '14', detail: 'Detected across survey readiness' },
  { label: 'Family Drafts', value: '22', detail: 'Awaiting staff approval' },
  { label: 'Knowledge Answers', value: '342', detail: 'Workflow help searches this week' }
];

export const aiResidentSummaries: AiResidentSummary[] = [
  {
    resident: 'Maria Alvarez',
    period: 'Last 30 Days',
    summary:
      'Maria had stable medication adherence with two refusals, one resolved wandering alert, nutrition intake above 70%, and an upcoming fall risk reassessment.',
    highlights: ['Medication Trends', 'Incidents', 'Assessments', 'Care Plan Updates']
  },
  {
    resident: 'James Bennett',
    period: 'Last 30 Days',
    summary:
      'James had one medication PRN pattern, a pending move-in assessment signature, and recurring transfer assistance tasks before meals.',
    highlights: ['PRN Trends', 'Tasks', 'Signatures', 'Service Plan']
  }
];

export const aiComplianceInsights: AiComplianceInsight[] = [
  {
    risk: 'Missing fall risk reassessment signature',
    severity: 'High',
    module: 'Assessments',
    recommendation: 'Route to Wellness Director and create same-day follow-up task.'
  },
  {
    risk: 'PRN follow-up outcome missing',
    severity: 'Medium',
    module: 'eMAR',
    recommendation: 'Notify medication manager and block shift close until outcome is recorded.'
  },
  {
    risk: 'Incident corrective action overdue',
    severity: 'High',
    module: 'Incidents',
    recommendation: 'Escalate to Facility Administrator and add survey readiness exception.'
  },
  {
    risk: 'Family document request unanswered',
    severity: 'Low',
    module: 'Family Portal',
    recommendation: 'Send reminder through Notification Center Pro.'
  }
];

export const aiFamilyDrafts: AiFamilyDraft[] = [
  {
    resident: 'Maria Alvarez',
    topic: 'Weekly care update',
    draft:
      'Maria participated in morning activities, maintained good meal intake, and staff continue to support evening redirection routines.',
    approval: 'Needs Wellness Director approval'
  },
  {
    resident: 'James Bennett',
    topic: 'Appointment reminder',
    draft:
      'Transportation has been scheduled for the upcoming provider appointment, and the care team will confirm pickup timing.',
    approval: 'Ready to send'
  }
];

export const aiKnowledgeAnswers: AiKnowledgeAnswer[] = [
  {
    question: 'How do I document a medication refusal?',
    answer: 'Open med pass, choose Refused, document reason, trigger notifications if required, and save the audit record.',
    module: 'eMAR'
  },
  {
    question: 'How do I prepare a survey readiness packet?',
    answer: 'Open Survey Readiness, resolve critical compliance items, preview the packet in Print Center Pro, then export.',
    module: 'Incidents & Compliance'
  },
  {
    question: 'How do I approve a family update draft?',
    answer: 'Open Family Portal drafts, review AI-generated text, confirm visibility permissions, then approve or edit before sending.',
    module: 'Family Portal'
  }
];

export const aiIntegrationRequirements = [
  'AI resident summaries use resident timeline, medication trends, incidents, assessments, care plans, tasks, and documents',
  'AI compliance assistant detects missing documentation, survey risks, medication risks, overdue reviews, and unresolved corrective actions',
  'AI family update drafts must require staff approval before family visibility or delivery',
  'AI knowledge assistant links to Hubsteria Academy, Help Desk, workflow pages, and module-specific guidance',
  'All AI suggestions, generated drafts, approvals, edits, dismissals, and user prompts create immutable audit records'
];
