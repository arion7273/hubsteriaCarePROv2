import { render, screen } from '@testing-library/react';
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

    expect(screen.getByText(/DigitalRX Integration Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Pharmacy Connectivity/i)).toBeInTheDocument();
    expect(screen.queryByText(/Family Portal/i)).not.toBeInTheDocument();
  });

  it('shows the enterprise hierarchy including the future T2.5 regional role', () => {
    render(<App />);

    expect(screen.getByText(/Master Administrator/i)).toBeInTheDocument();
    expect(screen.getByText(/Organization Administrator/i)).toBeInTheDocument();
    expect(screen.getByText(/Regional Administrator/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Facility Administrator/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Permission-Based Staff/i)).toBeInTheDocument();
  });
});
