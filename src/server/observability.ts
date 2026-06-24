import type { ServerConfig } from './config';
import { createConsoleStructuredLogger, createInMemoryMetricsRecorder, createPlaceholderErrorTracker } from '../api/observability';

export type ObservabilityStatus = {
  monitoringConfigured: boolean;
  errorTrackingConfigured: boolean;
  releaseVersion: string;
};

export function initializeObservability(config: ServerConfig): ObservabilityStatus {
  const status: ObservabilityStatus = {
    monitoringConfigured: Boolean(config.monitoringEndpoint),
    errorTrackingConfigured: Boolean(config.errorTrackingDsn),
    releaseVersion: config.releaseVersion ?? 'unknown'
  };

  // Production deployments can replace these placeholders with real SDK clients.
  console.info('HubsteriaCarePRO observability hooks', {
    monitoringConfigured: status.monitoringConfigured,
    errorTrackingConfigured: status.errorTrackingConfigured,
    releaseVersion: status.releaseVersion
  });

  return status;
}

export function createRuntimeObservability(config: ServerConfig) {
  const status = initializeObservability(config);

  return {
    status,
    metrics: createInMemoryMetricsRecorder(),
    structuredLogger: createConsoleStructuredLogger(),
    errorTracker: createPlaceholderErrorTracker(status.errorTrackingConfigured)
  };
}
