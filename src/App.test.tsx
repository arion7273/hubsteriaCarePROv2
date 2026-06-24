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
    expect(screen.getByText('Survey Readiness')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'T3 Facility' }));
    expect(screen.getByText('Current Residents')).toBeInTheDocument();
    expect(screen.getByText('Med Pass Completion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log Incident' })).toBeInTheDocument();
  });

  it('filters roadmap milestones through global search', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/Global search/i), 'DigitalRX');

    const roadmap = screen.getByRole('region', { name: /Phase 0 -> Phase 1/i });

    expect(within(roadmap).getByText(/DigitalRX Integration Hub/i)).toBeInTheDocument();
    expect(within(roadmap).getByText(/Pharmacy Connectivity/i)).toBeInTheDocument();
    expect(within(roadmap).queryByText(/Family Portal/i)).not.toBeInTheDocument();
  });

  it('shows the enterprise hierarchy including the future T2.5 regional role', () => {
    render(<App />);

    expect(screen.getByText(/Master Administrator/i)).toBeInTheDocument();
    expect(screen.getByText(/Organization Administrator/i)).toBeInTheDocument();
    expect(screen.getByText(/Regional Administrator/i)).toBeInTheDocument();
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
    expect(screen.getByText('eMAR')).toBeInTheDocument();
    expect(screen.getAllByText('Notification Center Pro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Print Center Pro').length).toBeGreaterThan(0);
  });
});
