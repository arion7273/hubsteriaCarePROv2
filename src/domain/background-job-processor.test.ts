import { describe, expect, it, vi } from 'vitest';
import { BackendFoundationService, createInMemoryBackendRepositories, processBackgroundJobs, type User } from '.';

const t1User: User = {
  id: 'user-master',
  email: 'b094650@gmail.com',
  roleTier: 'T1',
  facilityIds: [],
  permissions: [],
  status: 'active'
};

function createService() {
  const ids = ['job-1', 'audit-job-1', 'job-2', 'audit-job-2', 'audit-complete-1', 'audit-fail-2'];
  const repositories = createInMemoryBackendRepositories();
  const service = new BackendFoundationService(
    repositories,
    () => ids.shift() ?? 'fallback-id',
    () => new Date('2026-06-24T01:00:00.000Z')
  );

  return { repositories, service };
}

describe('processBackgroundJobs', () => {
  it('leases jobs, dispatches handlers, and completes successful jobs', async () => {
    const { repositories, service } = createService();
    const handler = vi.fn(async () => undefined);
    const job = await service.enqueuePrintJob(
      { user: t1User },
      {
        template: 'Resident Packet',
        format: 'pdf',
        recordIds: ['resident-1']
      }
    );

    const result = await processBackgroundJobs({
      service,
      context: { user: t1User },
      handlers: { print: handler },
      limit: 1
    });

    expect(result).toEqual({
      leased: 1,
      succeeded: [job.id],
      failed: []
    });
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ id: job.id, status: 'processing' }));
    await expect(repositories.backgroundJobs.getById(job.id)).resolves.toMatchObject({ status: 'succeeded' });
  });

  it('fails jobs without handlers and moves exhausted jobs to dead letter', async () => {
    const { repositories, service } = createService();
    const job = await service.enqueueBackgroundJob(
      { user: t1User },
      {
        type: 'digitalrx_sync',
        priority: 'critical',
        payload: { event: 'refill_updated' },
        maxAttempts: 1,
        availableAt: '2026-06-24T01:00:00.000Z'
      }
    );

    const result = await processBackgroundJobs({
      service,
      context: { user: t1User },
      handlers: {},
      limit: 1
    });

    expect(result).toEqual({
      leased: 1,
      succeeded: [],
      failed: [{ id: job.id, error: 'No handler registered for job type digitalrx_sync' }]
    });
    await expect(repositories.backgroundJobs.getById(job.id)).resolves.toMatchObject({
      status: 'dead_letter',
      lastError: 'No handler registered for job type digitalrx_sync'
    });
  });
});
