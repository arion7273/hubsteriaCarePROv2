import { describe, expect, it, vi } from 'vitest';
import { HubsteriaApiClient } from './api-client';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init
  });
}

describe('HubsteriaApiClient', () => {
  it('checks backend health', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com/', fetchImpl: fetchMock as unknown as typeof fetch });

    await expect(client.health()).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('http://api.example.com/healthz');
  });

  it('sends session headers, JSON bodies, and query params', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true, status: 200, data: [] }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com', fetchImpl: fetchMock as unknown as typeof fetch });

    await client.listResidents('session-1', 'org-1', 'facility-1');

    const [url, init] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];
    expect(url.toString()).toBe('http://api.example.com/residents?organizationId=org-1&facilityId=facility-1');
    expect(init).toMatchObject({
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'x-session-id': 'session-1'
      }
    });
  });

  it('posts login and create resident requests', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true, status: 200, data: {} }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com', fetchImpl: fetchMock as unknown as typeof fetch });

    await client.login('admin@example.com', 'password');
    await client.createResident('session-1', {
      organizationId: 'org-1',
      facilityId: 'facility-1',
      firstName: 'Maria',
      lastName: 'Alvarez'
    });

    const [, loginInit] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit];
    expect(loginInit.body).toBe(JSON.stringify({ email: 'admin@example.com', password: 'password' }));

    const [, residentInit] = fetchMock.mock.calls[1] as unknown as [URL, RequestInit];
    expect(residentInit).toMatchObject({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-session-id': 'session-1'
      },
      body: JSON.stringify({
        organizationId: 'org-1',
        facilityId: 'facility-1',
        firstName: 'Maria',
        lastName: 'Alvarez'
      })
    });
  });

  it('supports MFA organization facility and user workflow requests', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true, status: 200, data: {} }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com', fetchImpl: fetchMock as unknown as typeof fetch });

    await client.verifyMfa('session-1', 'challenge-1', '123456');
    await client.createOrganization('session-1', 'Northstar Senior Living');
    await client.createFacility('session-1', { organizationId: 'org-1', name: 'Cedar Grove' });
    await client.listOrganizations('session-1');
    await client.listFacilities('session-1', 'org-1');
    await client.listUsers('session-1', 'org-1');
    await client.createUser('session-1', {
      email: 'caregiver@example.com',
      roleTier: 'EMPLOYEE',
      organizationId: 'org-1',
      facilityIds: ['facility-1'],
      permissions: ['resident:read']
    });
    await client.logout('session-1');

    expect((fetchMock.mock.calls[0] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/auth/mfa/verify');
    expect((fetchMock.mock.calls[1] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/organizations');
    expect((fetchMock.mock.calls[2] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/facilities');
    expect((fetchMock.mock.calls[4] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/facilities?organizationId=org-1');
    expect((fetchMock.mock.calls[5] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/users?organizationId=org-1');
    expect((fetchMock.mock.calls[6] as unknown as [URL, RequestInit])[1].body).toBe(
      JSON.stringify({
        email: 'caregiver@example.com',
        roleTier: 'EMPLOYEE',
        organizationId: 'org-1',
        facilityIds: ['facility-1'],
        permissions: ['resident:read']
      })
    );
    expect((fetchMock.mock.calls[7] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/auth/logout');
    expect((fetchMock.mock.calls[7] as unknown as [URL, RequestInit])[1]).toMatchObject({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-session-id': 'session-1'
      }
    });
  });

  it('supports high-value clinical job and operational history workflow requests', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true, status: 200, data: [] }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com', fetchImpl: fetchMock as unknown as typeof fetch });

    await client.listAssessments('session-1', 'resident-1');
    await client.createCareTask('session-1', { residentId: 'resident-1', title: 'Follow up' });
    await client.listMedicationOrders('session-1', 'resident-1');
    await client.createIncident('session-1', { residentId: 'resident-1', type: 'fall' });
    await client.listBillingCharges('session-1', 'resident-1');
    await client.listBackgroundJobs('session-1', { organizationId: 'org-1', facilityId: 'facility-1', residentId: 'resident-1' });
    await client.listOperationalRecords('session-1', { organizationId: 'org-1', facilityId: 'facility-1', residentId: 'resident-1' });

    expect((fetchMock.mock.calls[0] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/assessments?residentId=resident-1');
    expect((fetchMock.mock.calls[1] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/tasks');
    expect((fetchMock.mock.calls[2] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/medication-orders?residentId=resident-1');
    expect((fetchMock.mock.calls[3] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/incidents');
    expect((fetchMock.mock.calls[4] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/billing/charges?residentId=resident-1');
    expect((fetchMock.mock.calls[5] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/background-jobs?organizationId=org-1&facilityId=facility-1&residentId=resident-1');
    expect((fetchMock.mock.calls[6] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/operational-records?organizationId=org-1&facilityId=facility-1&residentId=resident-1');
  });

  it('supports connected eMAR administration requests', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true, status: 201, data: {} }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com', fetchImpl: fetchMock as unknown as typeof fetch });

    await client.createMedicationOrder('session-1', { residentId: 'resident-1', medication: 'Lisinopril' });
    await client.recordMedicationAdministration('session-1', {
      organizationId: 'org-1',
      facilityId: 'facility-1',
      residentId: 'resident-1',
      medicationOrderId: 'med-order-1',
      action: 'given',
      prnEffectiveness: 'Effective',
      barcodeScanned: 'NDC-1',
      barcodeVerified: true,
      controlledSubstanceWitness: 'witness-1',
      controlledSubstanceCount: 28
    });
    await client.listMedicationAdministrations('session-1', 'resident-1');

    expect((fetchMock.mock.calls[0] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/medication-orders');
    expect((fetchMock.mock.calls[1] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/medication-administrations');
    expect((fetchMock.mock.calls[1] as unknown as [URL, RequestInit])[1].body).toContain('"barcodeVerified":true');
    expect((fetchMock.mock.calls[2] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/medication-administrations?residentId=resident-1');
  });

  it('supports clinical workflow requests', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ ok: true, status: 200, data: [] }));
    const client = new HubsteriaApiClient({ baseUrl: 'http://api.example.com', fetchImpl: fetchMock as unknown as typeof fetch });

    await client.listAssessments('session-1', 'resident-1');
    await client.createCareTask('session-1', {
      organizationId: 'org-1',
      facilityId: 'facility-1',
      residentId: 'resident-1',
      title: 'Breakfast ADL documentation'
    });
    await client.listMedicationOrders('session-1', 'resident-1');
    await client.createIncident('session-1', {
      organizationId: 'org-1',
      facilityId: 'facility-1',
      residentId: 'resident-1',
      type: 'fall'
    });
    await client.listBillingCharges('session-1', 'resident-1');

    expect((fetchMock.mock.calls[0] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/assessments?residentId=resident-1');
    expect((fetchMock.mock.calls[1] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/tasks');
    expect((fetchMock.mock.calls[2] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/medication-orders?residentId=resident-1');
    expect((fetchMock.mock.calls[3] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/incidents');
    expect((fetchMock.mock.calls[4] as unknown as [URL, RequestInit])[0].toString()).toBe('http://api.example.com/billing/charges?residentId=resident-1');
  });
});
