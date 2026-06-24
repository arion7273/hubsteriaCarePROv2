import type { BackendFoundationService } from './backend-service';
import type { AccessContext, BackgroundJob } from './types';

export type BackgroundJobHandler = (job: BackgroundJob) => Promise<void>;

export type BackgroundJobHandlerRegistry = Partial<Record<BackgroundJob['type'], BackgroundJobHandler>>;

export type BackgroundJobProcessingResult = {
  leased: number;
  succeeded: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
};

export async function processBackgroundJobs(input: {
  service: BackendFoundationService;
  context: AccessContext;
  handlers: BackgroundJobHandlerRegistry;
  limit: number;
}): Promise<BackgroundJobProcessingResult> {
  const leasedJobs = await input.service.leaseQueuedJobs(input.context, input.limit);
  const result: BackgroundJobProcessingResult = {
    leased: leasedJobs.length,
    succeeded: [],
    failed: []
  };

  for (const job of leasedJobs) {
    const handler = input.handlers[job.type];

    try {
      if (!handler) {
        throw new Error(`No handler registered for job type ${job.type}`);
      }

      await handler(job);
      await input.service.completeBackgroundJob(input.context, job.id);
      result.succeeded.push(job.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown job handler error';
      await input.service.failBackgroundJob(input.context, job.id, message);
      result.failed.push({ id: job.id, error: message });
    }
  }

  return result;
}
