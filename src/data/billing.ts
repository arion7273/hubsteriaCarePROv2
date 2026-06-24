export type BillingStatus = 'Draft' | 'Posted' | 'Paid' | 'Overdue' | 'Refunded';
export type AgingBucket = 'Current' | '30 Days' | '60 Days' | '90+ Days';

export type BillingMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ChargeItem = {
  type: string;
  resident: string;
  amount: string;
  frequency: string;
  status: BillingStatus;
};

export type InvoiceItem = {
  invoice: string;
  resident: string;
  balance: string;
  dueDate: string;
  status: BillingStatus;
};

export type PaymentActivity = {
  type: 'Payment' | 'Credit' | 'Refund';
  resident: string;
  amount: string;
  method: string;
  posted: string;
};

export type AgingReportItem = {
  bucket: AgingBucket;
  balance: string;
  accounts: string;
};

export const billingMetrics: BillingMetric[] = [
  { label: 'Occupancy Revenue', value: '$482k', detail: 'Current monthly resident revenue' },
  { label: 'Outstanding Balances', value: '$74.2k', detail: 'Across open invoices' },
  { label: 'Collection Tracking', value: '91%', detail: 'Collected this billing cycle' },
  { label: 'Aging 90+', value: '$8.4k', detail: 'Requires administrator review' }
];

export const chargeItems: ChargeItem[] = [
  {
    type: 'Recurring Charge',
    resident: 'Maria Alvarez',
    amount: '$5,400',
    frequency: 'Monthly',
    status: 'Posted'
  },
  {
    type: 'Level of Care Billing',
    resident: 'Maria Alvarez',
    amount: '$850',
    frequency: 'Monthly',
    status: 'Posted'
  },
  {
    type: 'Move-In Charge',
    resident: 'James Bennett',
    amount: '$1,200',
    frequency: 'One-Time',
    status: 'Draft'
  },
  {
    type: 'Ancillary Service',
    resident: 'Linda Chen',
    amount: '$95',
    frequency: 'Weekly',
    status: 'Posted'
  }
];

export const invoiceItems: InvoiceItem[] = [
  {
    invoice: 'INV-1042',
    resident: 'Maria Alvarez',
    balance: '$6,250',
    dueDate: 'Jul 1, 2026',
    status: 'Posted'
  },
  {
    invoice: 'INV-1043',
    resident: 'James Bennett',
    balance: '$1,200',
    dueDate: 'Jul 5, 2026',
    status: 'Draft'
  },
  {
    invoice: 'INV-1007',
    resident: 'Linda Chen',
    balance: '$2,480',
    dueDate: 'Jun 1, 2026',
    status: 'Overdue'
  }
];

export const paymentActivity: PaymentActivity[] = [
  {
    type: 'Payment',
    resident: 'Maria Alvarez',
    amount: '$5,400',
    method: 'ACH',
    posted: 'Today, 10:12 AM'
  },
  {
    type: 'Credit',
    resident: 'James Bennett',
    amount: '$150',
    method: 'Service adjustment',
    posted: 'Yesterday, 3:42 PM'
  },
  {
    type: 'Refund',
    resident: 'Linda Chen',
    amount: '$95',
    method: 'Card refund',
    posted: 'Jun 22, 2026'
  }
];

export const agingReport: AgingReportItem[] = [
  { bucket: 'Current', balance: '$52.1k', accounts: '41 accounts' },
  { bucket: '30 Days', balance: '$13.7k', accounts: '9 accounts' },
  { bucket: '60 Days', balance: '$6.0k', accounts: '4 accounts' },
  { bucket: '90+ Days', balance: '$8.4k', accounts: '3 accounts' }
];

export const billingOperations = [
  'Recurring Charges',
  'Level of Care Billing',
  'Move-In Charges',
  'Move-Out Charges',
  'Ancillary Services',
  'Invoices',
  'Statements',
  'Payments',
  'Credits',
  'Refunds'
];

export const billingIntegrationRequirements = [
  'Resident Command Center displays billing events, statements, balances, payment activity, and level-of-care billing history',
  'Family Portal shows billing information only when responsible-party and payer permissions allow access',
  'Print Center Pro exports invoices, statements, receipts, aging reports, and revenue summaries',
  'Notification Center Pro sends statement notices, overdue balance reminders, payment confirmations, and document requests',
  'All charges, invoices, statements, payments, credits, refunds, and billing adjustments create immutable audit records'
];
