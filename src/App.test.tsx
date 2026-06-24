import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('HubsteriaCarePRO foundation', () => {
  it('renders the brand, global protocol, and bootstrap account without exposing a plain-text password', () => {
    render(<App />);

    expect(screen.getAllByText(/HubsteriaCarePRO/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Master global protocol/i)).toBeInTheDocument();
    expect(screen.getByText('b094650@gmail.com')).toBeInTheDocument();
    expect(screen.getByText(/without storing a plain-text password/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ariana1617/i)).not.toBeInTheDocument();
  });

  it('switches between T1, T2, and T3 role-aware dashboards', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('Organizations')).toBeInTheDocument();
    expect(screen.getByText('DigitalRX Health')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'T2 Organization' }));
    expect(screen.getByText('Facility Count')).toBeInTheDocument();
    expect(screen.getAllByText('Survey Readiness').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'T3 Facility' }));
    expect(screen.getByText('Current Residents')).toBeInTheDocument();
    expect(screen.getAllByText('Med Pass Completion').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Log Incident' }).length).toBeGreaterThan(0);
  });

  it('filters roadmap milestones through global search', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: /Global search/i }), 'DigitalRX');

    const roadmap = screen.getByRole('region', { name: /Phase 0 -> Phase 1/i });

    expect(within(roadmap).getByText(/DigitalRX Integration Hub/i)).toBeInTheDocument();
    expect(within(roadmap).getByText(/Pharmacy Connectivity/i)).toBeInTheDocument();
    expect(within(roadmap).queryByText(/Family Portal/i)).not.toBeInTheDocument();
  });

  it('shows the enterprise hierarchy including the future T2.5 regional role', () => {
    render(<App />);

    expect(screen.getAllByText(/Master Administrator/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Organization Administrator/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Regional Administrator/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Facility Administrator/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Permission-Based Staff/i)).toBeInTheDocument();
  });

  it('renders the Phase 2 Resident Command Center with resident context and required actions', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Resident Command Center' })).toBeInTheDocument();
    expect(screen.getAllByText('Maria Alvarez').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Room 214B/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Fall Risk')).toBeInTheDocument();
    expect(screen.getByText('Allergy: Penicillin')).toBeInTheDocument();

    ['Add Note', 'Add Assessment', 'Add Incident', 'Add Medication', 'Add Task', 'Upload Document', 'Print'].forEach(
      (action) => {
        expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
      }
    );
  });

  it('connects profile sections, timeline records, and future modules back to the resident', () => {
    render(<App />);

    [
      'Demographics',
      'Contacts',
      'Insurance',
      'Physicians',
      'Diagnoses',
      'Allergies',
      'Documents',
      'Timeline'
    ].forEach((section) => {
      expect(screen.getAllByText(section).length).toBeGreaterThan(0);
    });

    [
      'Medication Activity',
      'Note',
      'Assessment',
      'Incident',
      'Care Plan',
      'Billing Event',
      'Document'
    ].forEach((eventType) => {
      expect(screen.getAllByText(eventType).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/Future modules connect here first/i)).toBeInTheDocument();
    expect(screen.getAllByText('eMAR').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Notification Center Pro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Print Center Pro').length).toBeGreaterThan(0);
  });

  it('renders Phase 3 productivity surfaces with command capabilities, pinned actions, and favorites', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Productivity System' })).toBeInTheDocument();
    expect(screen.getByText('Command Bar')).toBeInTheDocument();
    expect(screen.getByText('Search Resident')).toBeInTheDocument();
    expect(screen.getByText('Create Incident')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Med Pass' })).toBeInTheDocument();
    expect(screen.getAllByText('Medication Compliance').length).toBeGreaterThan(0);
    expect(screen.getByText('DigitalRX Sync Queue')).toBeInTheDocument();
  });

  it('searches across productivity records from the global command bar', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: /Global search/i }), 'Lisinopril');

    const results = screen.getByLabelText('Global search results');
    expect(within(results).getByText('Medication')).toBeInTheDocument();
    expect(within(results).getByText('Lisinopril 10mg')).toBeInTheDocument();
    expect(within(results).getByText('eMAR')).toBeInTheDocument();
    expect(within(results).getByRole('button', { name: 'Open Medication' })).toBeInTheDocument();
  });

  it('supports dark mode and role-personalized dashboard content', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Use Dark Mode' }));
    expect(screen.getByRole('button', { name: 'Use Light Mode' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'T3 Facility' }));
    expect(screen.getAllByText('Staff On Shift').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Start Assessment' }).length).toBeGreaterThan(0);
  });

  it('renders Phase 4 Notification Center Pro channels, templates, and routing rules', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Notification Center Pro' })).toBeInTheDocument();
    ['In-App', 'Email', 'SMS', 'Push'].forEach((channel) => {
      expect(screen.getAllByText(channel).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('Medication Refused').length).toBeGreaterThan(0);
    expect(screen.getAllByText('DigitalRX Sync Warning').length).toBeGreaterThan(0);
    expect(screen.getByText('Critical med refusal escalation')).toBeInTheDocument();
    expect(screen.getByText(/Escalate by SMS if unread after 10 minutes/i)).toBeInTheDocument();
  });

  it('tracks notification delivery history and required future module integration contract', () => {
    render(<App />);

    const history = screen.getByLabelText('Notification history');
    expect(within(history).getAllByText('Delivered').length).toBeGreaterThan(0);
    expect(within(history).getAllByText('Escalated').length).toBeGreaterThan(0);
    expect(within(history).getByText(/Medication Manager/i)).toBeInTheDocument();

    expect(screen.getByText(/Every major event can generate in-app, email, SMS, or push notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Notification rules remain tenant-scoped/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivery tracking records queued, delivered, read, failed, and escalated states/i)).toBeInTheDocument();
  });

  it('renders Phase 5 Print Center Pro formats, template builder, and preview validation', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Print Center Pro' })).toBeInTheDocument();
    ['PDF', 'CSV', 'Excel'].forEach((format) => {
      expect(screen.getAllByText(format).length).toBeGreaterThan(0);
    });

    const builder = screen.getByLabelText('Template builder features');
    ['Headers', 'Footers', 'Logos', 'Signatures', 'QR Codes', 'Barcodes', 'Conditional Content'].forEach((feature) => {
      expect(within(builder).getByText(feature)).toBeInTheDocument();
    });

    const preview = screen.getByLabelText('Print preview');
    expect(within(preview).getByText('Maria Alvarez')).toBeInTheDocument();
    expect(within(preview).getByText('QR code scannable')).toBeInTheDocument();
    expect(within(preview).getByText('No missing required fields')).toBeInTheDocument();
  });

  it('tracks print templates, batch jobs, and required module integration contract', () => {
    render(<App />);

    expect(screen.getAllByText('Resident Face Sheet').length).toBeGreaterThan(0);
    expect(screen.getByText('Medication Administration Record')).toBeInTheDocument();
    expect(screen.getAllByText('Incident Register').length).toBeGreaterThan(0);

    const batchJobs = screen.getByLabelText('Batch print jobs');
    expect(within(batchJobs).getByText('Survey Readiness Packet')).toBeInTheDocument();
    expect(within(batchJobs).getByText('Monthly Medication Audit')).toBeInTheDocument();
    expect(within(batchJobs).getByText('Preview Required')).toBeInTheDocument();

    expect(screen.getByText(/Every major record can route to Print Center Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/Preview is required before final print, export, or batch generation/i)).toBeInTheDocument();
    expect(screen.getByText(/Print actions create immutable audit records/i)).toBeInTheDocument();
  });

  it('renders Phase 5.5 Configuration Center centralized administration areas', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Configuration Center' })).toBeInTheDocument();
    [
      'Roles & Permissions',
      'Assessment Templates',
      'Incident Types',
      'Notification Rules',
      'Print Templates',
      'Workflow Templates',
      'DigitalRX Settings',
      'Facility Settings',
      'Branding'
    ].forEach((area) => {
      expect(screen.getAllByText(area).length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Permission matrix')).toBeInTheDocument();
    expect(screen.getByText('API endpoint')).toBeInTheDocument();
    expect(screen.getByText('Feature toggles')).toBeInTheDocument();
  });

  it('tracks configuration feature toggles, audit events, and guardrails', () => {
    render(<App />);

    const toggles = screen.getByLabelText('Feature toggles');
    expect(within(toggles).getByText('Regional Administrator T2.5')).toBeInTheDocument();
    expect(within(toggles).getByText('DigitalRX Pharmacy Hub')).toBeInTheDocument();
    expect(within(toggles).getAllByText('Pilot').length).toBeGreaterThan(0);

    const audit = screen.getByLabelText('Configuration audit events');
    expect(within(audit).getByText('Medication Refused notification route')).toBeInTheDocument();
    expect(within(audit).getByText('Resident Face Sheet print template')).toBeInTheDocument();

    expect(screen.getByText(/Settings are centralized so clinical modules do not scatter administration/i)).toBeInTheDocument();
    expect(screen.getByText(/Every configuration change creates an immutable audit log record/i)).toBeInTheDocument();
    expect(screen.getByText(/Feature toggles support safe rollout, pilots, and future enterprise expansion/i)).toBeInTheDocument();
  });

  it('renders Phase 6 Assessments & Care Plans clinical engine', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Assessments & Care Plans Engine' })).toBeInTheDocument();
    expect(screen.getAllByText('Assessments Due').length).toBeGreaterThan(0);

    const types = screen.getByLabelText('Assessment types');
    ['Initial Assessment', 'Move-In Assessment', 'Fall Risk Assessment', 'Medication Assessment', 'Custom Assessments'].forEach(
      (type) => {
        expect(within(types).getByText(type)).toBeInTheDocument();
      }
    );

    expect(screen.getAllByText('Fall Risk Assessment').length).toBeGreaterThan(0);
    expect(screen.getByText(/Quarterly and after incident/i)).toBeInTheDocument();
    expect(screen.getAllByText('Move-In Assessment').length).toBeGreaterThan(0);
  });

  it('supports assessment builder controls, care plans, suggestions, and integration hooks', () => {
    render(<App />);

    const builder = screen.getByLabelText('Assessment builder controls');
    ['Questions', 'Sections', 'Conditional Logic', 'Scoring Rules', 'Required Fields', 'Electronic Signatures'].forEach(
      (control) => {
        expect(within(builder).getByText(control)).toBeInTheDocument();
      }
    );

    expect(screen.getByText('Reduce fall risk during evening shift')).toBeInTheDocument();
    expect(screen.getByText(/Outcome: No falls for 30 consecutive days/i)).toBeInTheDocument();

    const suggestions = screen.getByLabelText('Auto care plan suggestions');
    expect(within(suggestions).getByText('Add supervised transfers during evening shift')).toBeInTheDocument();
    expect(within(suggestions).getAllByText('High').length).toBeGreaterThan(0);

    const reviewQueue = screen.getByLabelText('Assessment review queue');
    expect(within(reviewQueue).getByText('Maria Alvarez')).toBeInTheDocument();
    expect(within(reviewQueue).getByText(/Wellness Director/i)).toBeInTheDocument();

    expect(screen.getByText(/Resident Command Center displays active care plans/i)).toBeInTheDocument();
    expect(screen.getByText(/Print Center Pro generates assessment reports, care plans, and progress reports/i)).toBeInTheDocument();
    expect(screen.getByText(/Notification Center Pro alerts staff when assessments are due/i)).toBeInTheDocument();
  });

  it('renders Phase 7 Tasks ADLs and Services caregiver workflows', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Tasks, ADLs & Services' })).toBeInTheDocument();
    expect(screen.getAllByText('Open Tasks').length).toBeGreaterThan(0);

    const taskTypesRegion = screen.getByLabelText('Task types');
    ['One-Time', 'Daily', 'Weekly', 'Monthly', 'Custom Recurring'].forEach((type) => {
      expect(within(taskTypesRegion).getByText(type)).toBeInTheDocument();
    });

    const adls = screen.getByLabelText('ADL categories');
    ['Bathing', 'Grooming', 'Dressing', 'Toileting', 'Ambulation', 'Feeding', 'Transfers', 'Medication Reminders'].forEach(
      (adl) => {
        expect(within(adls).getByText(adl)).toBeInTheDocument();
      }
    );

    const tasks = screen.getByLabelText('Caregiver tasks');
    expect(within(tasks).getByText('Breakfast ADL documentation')).toBeInTheDocument();
    expect(within(tasks).getByText('Weekly shower assistance')).toBeInTheDocument();
    expect(within(tasks).getAllByText('Unassigned').length).toBeGreaterThan(0);
  });

  it('supports service plans, missed task engine, shift dashboard, and mobile completion', () => {
    render(<App />);

    expect(screen.getByText('Memory care evening support')).toBeInTheDocument();
    expect(screen.getByText('Transfer assistance')).toBeInTheDocument();
    expect(screen.getByText(/Detect missed tasks when completion is not recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/Notify assigned staff, then escalate to shift lead/i)).toBeInTheDocument();

    const shift = screen.getByLabelText('Shift dashboard');
    expect(within(shift).getByText('Assigned Residents')).toBeInTheDocument();
    expect(within(shift).getAllByText('Overdue Tasks').length).toBeGreaterThan(0);

    expect(screen.getByText('Tap complete')).toBeInTheDocument();
    expect(screen.getByText('Save with audit trail')).toBeInTheDocument();
    expect(screen.getByText(/Resident Command Center displays service plans, open tasks, ADL history/i)).toBeInTheDocument();
    expect(screen.getByText(/Notification Center Pro alerts staff for late, missed, overdue, and unassigned tasks/i)).toBeInTheDocument();
  });

  it('renders Phase 8 eMAR medication orders and med pass actions', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'eMAR & Medication Management' })).toBeInTheDocument();
    expect(screen.getAllByText('Med Pass Completion').length).toBeGreaterThan(0);

    const orders = screen.getByLabelText('Medication orders');
    ['Lisinopril', 'Acetaminophen', 'Memantine', 'Warfarin'].forEach((medication) => {
      expect(within(orders).getByText(medication)).toBeInTheDocument();
    });
    expect(within(orders).getByText('Hold pending INR review')).toBeInTheDocument();

    const medPass = screen.getByLabelText('Med pass residents');
    expect(within(medPass).getByText('Maria Alvarez')).toBeInTheDocument();
    ['Given', 'Refused', 'Held', 'Resident Absent', 'Not Available'].forEach((action) => {
      expect(within(medPass).getAllByRole('button', { name: action }).length).toBeGreaterThan(0);
    });
  });

  it('supports PRNs controlled substances barcode alerts compliance and medication integrations', () => {
    render(<App />);

    expect(screen.getByText('Track PRN reason before administration')).toBeInTheDocument();
    expect(screen.getByText('Witness signatures')).toBeInTheDocument();
    expect(screen.getByText('Scan resident wristband or profile barcode')).toBeInTheDocument();

    const alerts = screen.getByLabelText('Medication alerts');
    ['Allergies', 'Interactions', 'Duplicates', 'Expiring Orders', 'Late Medications', 'Missed Medications', 'Refusals'].forEach(
      (alert) => {
        expect(within(alerts).getByText(alert)).toBeInTheDocument();
      }
    );

    const compliance = screen.getByLabelText('Medication compliance items');
    expect(within(compliance).getByText('Late medication review')).toBeInTheDocument();
    expect(within(compliance).getByText('Refusal trend')).toBeInTheDocument();

    expect(screen.getByText(/Large resident cards, high-contrast actions, barcode-ready verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Resident Command Center displays medication orders, med pass activity/i)).toBeInTheDocument();
    expect(screen.getByText(/Print Center Pro exports medication administration records/i)).toBeInTheDocument();
  });

  it('renders Phase 9 DigitalRX connection settings pharmacy inbox and medication sync', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'DigitalRX Integration Hub' })).toBeInTheDocument();
    expect(screen.getByText('https://api.digitalrx.example/v1')).toBeInTheDocument();
    expect(screen.getByText('Stored in secure connector vault')).toBeInTheDocument();
    expect(screen.getAllByText('Connected').length).toBeGreaterThan(0);

    const inbox = screen.getByLabelText('Pharmacy inbox');
    expect(within(inbox).getByText('Medication Order')).toBeInTheDocument();
    expect(within(inbox).getByText('Medication Change')).toBeInTheDocument();
    expect(within(inbox).getByText('Discontinued Order')).toBeInTheDocument();
    expect(within(inbox).getByText(/Memantine 5mg/)).toBeInTheDocument();

    const syncFields = screen.getByLabelText('Medication sync fields');
    ['Medication Name', 'Strength', 'Frequency', 'Route', 'Start Date', 'End Date'].forEach((field) => {
      expect(within(syncFields).getByText(field)).toBeInTheDocument();
    });
  });

  it('supports DigitalRX resident matching refill tracking events and integration contract', () => {
    render(<App />);

    expect(screen.getByText(/Match by resident name, date of birth, facility, and room/i)).toBeInTheDocument();
    expect(screen.getByText(/Prevent medication import until resident match is confirmed/i)).toBeInTheDocument();

    const refills = screen.getByLabelText('Refill tracking');
    expect(within(refills).getByText('Hydralazine 25mg')).toBeInTheDocument();
    expect(within(refills).getByText('Requested')).toBeInTheDocument();
    expect(within(refills).getByText('Delivered')).toBeInTheDocument();

    const events = screen.getByLabelText('DigitalRX events');
    ['order_created', 'order_updated', 'order_discontinued', 'refill_updated'].forEach((event) => {
      expect(within(events).getByText(event)).toBeInTheDocument();
    });

    expect(screen.getByText(/DigitalRX remains the pharmacy source of truth/i)).toBeInTheDocument();
    expect(screen.getByText(/Connector architecture supports REST APIs, FHIR-ready mapping, webhooks/i)).toBeInTheDocument();
    expect(screen.getByText(/All connector actions, matches, imports, updates, discontinuations, refills, and errors/i)).toBeInTheDocument();
  });

  it('renders Phase 10 incident types workflow and incident register', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Incidents & Compliance Center' })).toBeInTheDocument();
    expect(screen.getAllByText('Open Incidents').length).toBeGreaterThan(0);

    const types = screen.getByLabelText('Incident types');
    ['Falls', 'Injuries', 'Medication Errors', 'Behavioral Events', 'Elopement', 'Infection Events'].forEach((type) => {
      expect(within(types).getByText(type)).toBeInTheDocument();
    });

    const workflow = screen.getByLabelText('Incident workflow');
    ['Incident Report', 'Investigation', 'Root Cause Analysis', 'Corrective Action', 'Resolution'].forEach((step) => {
      expect(within(workflow).getByText(step)).toBeInTheDocument();
    });

    const records = screen.getByLabelText('Incident records');
    expect(within(records).getByText('Medication Error')).toBeInTheDocument();
    expect(within(records).getByText(/Supervisor review and medication workflow retraining/i)).toBeInTheDocument();
  });

  it('supports compliance dashboard fix links survey readiness and incident integrations', () => {
    render(<App />);

    const compliance = screen.getByLabelText('Compliance items');
    ['Missing Assessments', 'Missing Signatures', 'Expired Orders', 'Late Medications', 'Missing Documentation'].forEach((issue) => {
      expect(within(compliance).getByText(issue)).toBeInTheDocument();
    });
    expect(within(compliance).getByRole('button', { name: 'Open medication order renewal' })).toBeInTheDocument();
    expect(within(compliance).getByRole('button', { name: 'Open eMAR compliance dashboard' })).toBeInTheDocument();

    const survey = screen.getByLabelText('Survey readiness checklist');
    expect(within(survey).getByText('Incident reports complete')).toBeInTheDocument();
    expect(within(survey).getByText('Print packet ready')).toBeInTheDocument();

    expect(screen.getByText(/Resident Command Center displays incidents, investigations, corrective actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Print Center Pro exports incident reports, investigation packets/i)).toBeInTheDocument();
    expect(screen.getByText(/All incident creation, updates, investigations, corrective actions/i)).toBeInTheDocument();
  });

  it('renders Phase 11 Communication Center messaging and shift handoff workflows', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Communication Center' })).toBeInTheDocument();
    expect(screen.getAllByText('Unread Messages').length).toBeGreaterThan(0);

    const threads = screen.getByLabelText('Message threads');
    expect(within(threads).getByText('Evening med pass coverage')).toBeInTheDocument();
    expect(within(threads).getByText('Maria Alvarez care update')).toBeInTheDocument();
    expect(within(threads).getByText('Warfarin hold clarification')).toBeInTheDocument();
    expect(within(threads).getByText('Escalated')).toBeInTheDocument();

    const handoffs = screen.getByLabelText('Shift handoffs');
    expect(within(handoffs).getByText('Maria Alvarez')).toBeInTheDocument();
    expect(within(handoffs).getByText(/Monitor wandering cues and complete evening redirection task/i)).toBeInTheDocument();
    expect(within(handoffs).getByText('Pending')).toBeInTheDocument();
  });

  it('supports announcements read receipts and communication integrations', () => {
    render(<App />);

    const announcements = screen.getByLabelText('Facility announcements');
    expect(within(announcements).getByText('Emergency weather alert')).toBeInTheDocument();
    expect(within(announcements).getByText('Medication policy update')).toBeInTheDocument();
    expect(within(announcements).getByText('91% read')).toBeInTheDocument();

    expect(screen.getByText(/Notification Center Pro sends in-app, email, SMS, and push notices/i)).toBeInTheDocument();
    expect(screen.getByText(/Resident Command Center displays resident-linked messages/i)).toBeInTheDocument();
    expect(screen.getByText(/All messages, announcements, handoffs, read receipts, escalations, and edits/i)).toBeInTheDocument();
  });

  it('renders Phase 12 Family Portal dashboard messaging and visibility controls', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Family Portal' })).toBeInTheDocument();
    expect(screen.getAllByText('Family Users').length).toBeGreaterThan(0);

    const dashboard = screen.getByLabelText('Family dashboard cards');
    ['Resident Overview', 'Care Updates', 'Documents', 'Messages', 'Appointments', 'Billing'].forEach((card) => {
      expect(within(dashboard).getByText(card)).toBeInTheDocument();
    });
    expect(within(dashboard).getAllByText('Limited').length).toBeGreaterThan(0);

    const messages = screen.getByLabelText('Family messages');
    expect(within(messages).getByText('Weekly care update request')).toBeInTheDocument();
    expect(within(messages).getByText('Document signature follow-up')).toBeInTheDocument();
    expect(within(messages).getByText('Needs Reply')).toBeInTheDocument();
  });

  it('supports family notifications permissions and integration contracts', () => {
    render(<App />);

    const notifications = screen.getByLabelText('Family notifications');
    ['Medication Update', 'Incident Alert', 'Appointment', 'Document Request'].forEach((type) => {
      expect(within(notifications).getByText(type)).toBeInTheDocument();
    });
    expect(within(notifications).getByText(/Updated consent form requires responsible-party signature/i)).toBeInTheDocument();

    expect(screen.getByText(/Family members only see residents they are explicitly linked to/i)).toBeInTheDocument();
    expect(screen.getByText(/Clinical notes require staff approval before family visibility/i)).toBeInTheDocument();
    expect(screen.getByText(/Billing access depends on responsible-party and payer permissions/i)).toBeInTheDocument();

    expect(screen.getByText(/Communication Center powers secure family messaging and read receipts/i)).toBeInTheDocument();
    expect(screen.getByText(/Notification Center Pro sends family medication updates, incident alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/Resident Command Center controls which resident updates, documents, and timeline events become family-visible/i)).toBeInTheDocument();
  });

  it('renders Phase 13 Billing Center operations charges and invoices', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Billing & Financial Operations' })).toBeInTheDocument();
    expect(screen.getByText('Occupancy Revenue')).toBeInTheDocument();
    expect(screen.getByText('Outstanding Balances')).toBeInTheDocument();

    const operations = screen.getByLabelText('Billing operations');
    ['Recurring Charges', 'Level of Care Billing', 'Move-In Charges', 'Move-Out Charges', 'Ancillary Services', 'Invoices', 'Statements', 'Payments', 'Credits', 'Refunds'].forEach(
      (operation) => {
        expect(within(operations).getByText(operation)).toBeInTheDocument();
      }
    );

    const charges = screen.getByLabelText('Charge items');
    expect(within(charges).getByText('Level of Care Billing')).toBeInTheDocument();
    expect(within(charges).getByText('Move-In Charge')).toBeInTheDocument();

    const invoices = screen.getByLabelText('Invoices');
    expect(within(invoices).getByText('INV-1042')).toBeInTheDocument();
    expect(within(invoices).getByText('INV-1007')).toBeInTheDocument();
    expect(within(invoices).getByText('Overdue')).toBeInTheDocument();
  });

  it('supports billing payments aging reports and integration contracts', () => {
    render(<App />);

    const payments = screen.getByLabelText('Payment activity');
    expect(within(payments).getByText('Payment')).toBeInTheDocument();
    expect(within(payments).getByText('Credit')).toBeInTheDocument();
    expect(within(payments).getByText('Refund')).toBeInTheDocument();

    const aging = screen.getByLabelText('Aging report');
    ['Current', '30 Days', '60 Days', '90+ Days'].forEach((bucket) => {
      expect(within(aging).getByText(bucket)).toBeInTheDocument();
    });

    expect(screen.getByText(/Resident Command Center displays billing events, statements, balances/i)).toBeInTheDocument();
    expect(screen.getByText(/Family Portal shows billing information only when responsible-party and payer permissions allow access/i)).toBeInTheDocument();
    expect(screen.getByText(/Print Center Pro exports invoices, statements, receipts, aging reports/i)).toBeInTheDocument();
    expect(screen.getByText(/All charges, invoices, statements, payments, credits, refunds, and billing adjustments/i)).toBeInTheDocument();
  });

  it('renders Phase 14 Workflow Automation builder templates and examples', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Workflow Automation Engine' })).toBeInTheDocument();
    expect(screen.getByText('Active Workflows')).toBeInTheDocument();

    const builder = screen.getByLabelText('Workflow builder parts');
    ['Trigger', 'Condition', 'Action', 'Template', 'Audit Trail', 'Notification Route', 'Task Creation'].forEach((part) => {
      expect(within(builder).getByText(part)).toBeInTheDocument();
    });

    const templates = screen.getByLabelText('Workflow templates');
    expect(within(templates).getByText('Medication Refused Escalation')).toBeInTheDocument();
    expect(within(templates).getByText('Assessment Due Task')).toBeInTheDocument();
    expect(within(templates).getByText('Incident Family Notification')).toBeInTheDocument();
    expect(within(templates).getAllByText('Refill Running Low').length).toBeGreaterThan(0);

    const examples = screen.getByLabelText('Automation examples');
    expect(within(examples).getByText('Medication Refused -> Notify Administrator')).toBeInTheDocument();
    expect(within(examples).getByText('Assessment Due -> Create Task')).toBeInTheDocument();
  });

  it('tracks automation activity and workflow integration requirements', () => {
    render(<App />);

    const activity = screen.getByLabelText('Automation activity');
    expect(within(activity).getByText('Maria Alvarez refused Lisinopril')).toBeInTheDocument();
    expect(within(activity).getByText('Task created for Wellness Director')).toBeInTheDocument();
    expect(within(activity).getByText('Pharmacy notification queued')).toBeInTheDocument();

    expect(screen.getByText(/Configuration Center owns workflow templates, triggers, conditions, actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Notification Center Pro executes workflow notification actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Workflow actions can create tasks, notify families, notify pharmacies/i)).toBeInTheDocument();
    expect(screen.getByText(/Every automation trigger, condition result, action, failure, pause/i)).toBeInTheDocument();
  });

  it('renders Phase 15 Hubsteria Academy training resources and learning paths', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Hubsteria Academy' })).toBeInTheDocument();
    expect(screen.getByText('Completed Courses')).toBeInTheDocument();
    expect(screen.getByText('Expiring Certifications')).toBeInTheDocument();

    const resources = screen.getByLabelText('Training resources');
    expect(within(resources).getByText('How do I document a medication refusal?')).toBeInTheDocument();
    expect(within(resources).getByText('Mobile med pass walkthrough')).toBeInTheDocument();
    expect(within(resources).getByText('Incident documentation fundamentals')).toBeInTheDocument();

    const paths = screen.getByLabelText('Learning paths');
    ['Caregiver', 'Medication Manager', 'Facility Administrator', 'Family Member'].forEach((role) => {
      expect(within(paths).getByText(role)).toBeInTheDocument();
    });
    expect(within(paths).getByText('ADL documentation')).toBeInTheDocument();
    expect(within(paths).getByText('Barcode verification')).toBeInTheDocument();
  });

  it('tracks Academy certifications AI help and integration requirements', () => {
    render(<App />);

    const certs = screen.getByLabelText('Certifications');
    expect(within(certs).getByText('Medication Administration Safety')).toBeInTheDocument();
    expect(within(certs).getByText('Dementia Care Essentials')).toBeInTheDocument();
    expect(within(certs).getByText('Expiring')).toBeInTheDocument();

    const aiHelp = screen.getByLabelText('AI help examples');
    expect(within(aiHelp).getByText('How do I document a medication refusal?')).toBeInTheDocument();
    expect(within(aiHelp).getByText(/Open the resident med pass card, select Refused/i)).toBeInTheDocument();

    expect(screen.getByText(/Configuration Center owns role-based learning paths/i)).toBeInTheDocument();
    expect(screen.getByText(/Notification Center Pro alerts staff and administrators when required training/i)).toBeInTheDocument();
    expect(screen.getByText(/All course completions, certification changes, AI help searches/i)).toBeInTheDocument();
  });

  it('renders Phase 16 Help Desk tickets capabilities and knowledge links', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Help Desk & Support Center' })).toBeInTheDocument();
    expect(screen.getByText('Open Tickets')).toBeInTheDocument();
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument();

    const tickets = screen.getByLabelText('Support tickets');
    expect(within(tickets).getByText('HD-1043')).toBeInTheDocument();
    expect(within(tickets).getByText('Barcode scan mismatch')).toBeInTheDocument();
    expect(within(tickets).getByText('Critical')).toBeInTheDocument();

    const capabilities = screen.getByLabelText('Support capabilities');
    ['Ticket System', 'Screenshot Uploads', 'Screen Recording Support', 'Knowledge Base Linking', 'Remote Assistance'].forEach(
      (capability) => {
        expect(within(capabilities).getByText(capability)).toBeInTheDocument();
      }
    );

    const knowledge = screen.getByLabelText('Support knowledge links');
    expect(within(knowledge).getByText('How to troubleshoot barcode scan mismatch')).toBeInTheDocument();
    expect(within(knowledge).getByText(/HD-1043/)).toBeInTheDocument();
  });

  it('supports remote assistance guardrails and support integrations', () => {
    render(<App />);

    expect(screen.getByText(/Support staff must request permission before remote assistance begins/i)).toBeInTheDocument();
    expect(screen.getByText(/Screen recordings and screenshots are attached only to authorized support tickets/i)).toBeInTheDocument();
    expect(screen.getByText(/Notification Center Pro alerts requesters and assigned support staff/i)).toBeInTheDocument();
    expect(screen.getByText(/Hubsteria Academy links relevant knowledge base articles/i)).toBeInTheDocument();
    expect(screen.getByText(/All support tickets, screenshots, screen recordings, knowledge links/i)).toBeInTheDocument();
  });

  it('renders Phase 17 Executive Command Center metrics scores and drilldowns', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'Executive Command Center' })).toBeInTheDocument();
    ['Occupancy', 'Revenue', 'Medication Compliance', 'Incidents', 'Assessments', 'Staffing', 'Training', 'Billing'].forEach(
      (metric) => {
        expect(screen.getAllByText(metric).length).toBeGreaterThan(0);
      }
    );

    const scores = screen.getByLabelText('Executive scores');
    expect(within(scores).getByText('Survey Readiness Score')).toBeInTheDocument();
    expect(within(scores).getByText('Compliance Score')).toBeInTheDocument();
    expect(within(scores).getByText('Facility Health Score')).toBeInTheDocument();

    const drilldowns = screen.getByLabelText('Executive drilldowns');
    expect(within(drilldowns).getByText('Multi-facility occupancy view')).toBeInTheDocument();
    expect(within(drilldowns).getByText('Survey readiness packet status')).toBeInTheDocument();
  });

  it('tracks executive multi-facility performance and integration requirements', () => {
    render(<App />);

    const facilities = screen.getByLabelText('Facility performance');
    expect(within(facilities).getByText('Cedar Grove Assisted Living')).toBeInTheDocument();
    expect(within(facilities).getByText('Pine Ridge Memory Care')).toBeInTheDocument();
    expect(within(facilities).getByText('Northstar Group Home')).toBeInTheDocument();

    expect(screen.getByText(/T1 and T2 administrators can view multi-facility performance/i)).toBeInTheDocument();
    expect(screen.getByText(/Executive dashboards aggregate medication compliance, incidents, assessments/i)).toBeInTheDocument();
    expect(screen.getByText(/Print Center Pro exports executive packets, facility rankings/i)).toBeInTheDocument();
    expect(screen.getByText(/All executive dashboard access, drilldowns, exports, and score changes/i)).toBeInTheDocument();
  });

  it('renders Phase 18 AI resident summaries and compliance insights', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 2, name: 'AI Assistant & Insights Layer' })).toBeInTheDocument();
    expect(screen.getByText('Resident Summaries')).toBeInTheDocument();
    expect(screen.getByText('Compliance Risks')).toBeInTheDocument();

    const summaries = screen.getByLabelText('AI resident summaries');
    expect(within(summaries).getByText('Maria Alvarez')).toBeInTheDocument();
    expect(within(summaries).getByText(/stable medication adherence with two refusals/i)).toBeInTheDocument();
    expect(within(summaries).getByText('Medication Trends')).toBeInTheDocument();

    const insights = screen.getByLabelText('AI compliance insights');
    expect(within(insights).getByText('Missing fall risk reassessment signature')).toBeInTheDocument();
    expect(within(insights).getByText('Incident corrective action overdue')).toBeInTheDocument();
    expect(within(insights).getAllByText('High').length).toBeGreaterThan(0);
  });

  it('supports AI family drafts knowledge answers and integration guardrails', () => {
    render(<App />);

    const drafts = screen.getByLabelText('AI family update drafts');
    expect(within(drafts).getByText('Weekly care update')).toBeInTheDocument();
    expect(within(drafts).getByText(/Needs Wellness Director approval/i)).toBeInTheDocument();

    const knowledge = screen.getByLabelText('AI knowledge answers');
    expect(within(knowledge).getByText('How do I prepare a survey readiness packet?')).toBeInTheDocument();
    expect(within(knowledge).getByText(/Open Survey Readiness, resolve critical compliance items/i)).toBeInTheDocument();

    expect(screen.getByText(/AI resident summaries use resident timeline, medication trends/i)).toBeInTheDocument();
    expect(screen.getByText(/AI family update drafts must require staff approval/i)).toBeInTheDocument();
    expect(screen.getByText(/All AI suggestions, generated drafts, approvals, edits, dismissals/i)).toBeInTheDocument();
  });
});
