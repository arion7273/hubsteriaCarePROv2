export type TaskStatus = 'Due' | 'Overdue' | 'Complete' | 'Missed' | 'Unassigned';

export type TaskMetric = {
  label: string;
  value: string;
  detail: string;
};

export type TaskItem = {
  title: string;
  resident: string;
  type: string;
  schedule: string;
  assignedStaff: string;
  status: TaskStatus;
};

export type ServicePlan = {
  resident: string;
  service: string;
  schedule: string;
  assignedStaff: string;
  exceptions: string;
};

export const taskMetrics: TaskMetric[] = [
  { label: 'Open Tasks', value: '128', detail: 'Across caregiver and nurse workflows' },
  { label: 'Due Tasks', value: '43', detail: 'Next 4 hours' },
  { label: 'Overdue Tasks', value: '21', detail: 'Missed-task engine monitoring' },
  { label: 'Unassigned Tasks', value: '6', detail: 'Need supervisor assignment' }
];

export const taskTypes = ['One-Time', 'Daily', 'Weekly', 'Monthly', 'Custom Recurring'];

export const adlCategories = [
  'Bathing',
  'Grooming',
  'Dressing',
  'Toileting',
  'Ambulation',
  'Feeding',
  'Transfers',
  'Medication Reminders'
];

export const caregiverTasks: TaskItem[] = [
  {
    title: 'Breakfast ADL documentation',
    resident: 'Maria Alvarez',
    type: 'Daily',
    schedule: 'Today, 9:30 AM',
    assignedStaff: 'Caregiver Lead',
    status: 'Due'
  },
  {
    title: 'Evening redirection cueing',
    resident: 'Maria Alvarez',
    type: 'Daily',
    schedule: 'Today, 7:00 PM',
    assignedStaff: 'Evening Caregiver',
    status: 'Due'
  },
  {
    title: 'Weekly shower assistance',
    resident: 'James Bennett',
    type: 'Weekly',
    schedule: 'Today, 10:00 AM',
    assignedStaff: 'Unassigned',
    status: 'Unassigned'
  },
  {
    title: 'Hydration rounds',
    resident: 'Linda Chen',
    type: 'Custom Recurring',
    schedule: 'Every 2 hours',
    assignedStaff: 'Caregiver Team',
    status: 'Overdue'
  }
];

export const servicePlans: ServicePlan[] = [
  {
    resident: 'Maria Alvarez',
    service: 'Memory care evening support',
    schedule: 'Daily, 6:00 PM - 9:00 PM',
    assignedStaff: 'Evening Caregiver',
    exceptions: 'Notify Wellness Director if wandering cueing fails'
  },
  {
    resident: 'James Bennett',
    service: 'Transfer assistance',
    schedule: 'Daily before meals',
    assignedStaff: 'Caregiver Team',
    exceptions: 'Two-person assist when fatigued'
  },
  {
    resident: 'Linda Chen',
    service: 'Nutrition and hydration support',
    schedule: 'Meals and hydration rounds',
    assignedStaff: 'Caregiver Lead',
    exceptions: 'Escalate intake below 50%'
  }
];

export const missedTaskRules = [
  'Detect missed tasks when completion is not recorded by the grace period',
  'Detect late tasks when completion occurs after the scheduled window',
  'Detect unassigned tasks before shift start',
  'Notify assigned staff, then escalate to shift lead and facility administrator',
  'Audit task creation, reassignment, completion, exception, and missed-task resolution'
];

export const shiftDashboard = [
  {
    label: 'Assigned Residents',
    value: '12',
    detail: 'Caregiver mobile view'
  },
  {
    label: 'Open Tasks',
    value: '43',
    detail: 'Tap to filter due work'
  },
  {
    label: 'Due Tasks',
    value: '18',
    detail: 'Next 2 hours'
  },
  {
    label: 'Overdue Tasks',
    value: '5',
    detail: 'Escalation ready'
  }
];

export const mobileCompletionSteps = [
  'Open resident task card',
  'Tap complete',
  'Select ADL outcome or exception',
  'Add optional note or photo',
  'Save with audit trail'
];

export const taskIntegrationRequirements = [
  'Resident Command Center displays service plans, open tasks, ADL history, and missed-task exceptions',
  'Notification Center Pro alerts staff for late, missed, overdue, and unassigned tasks',
  'Print Center Pro exports service plans, task logs, ADL summaries, and exception reports',
  'Configuration Center owns ADL categories, task types, recurrence rules, shift settings, and exception reasons',
  'All task and ADL actions create immutable audit records'
];
