import type { HttpMethod } from './http';

export type StructuredApiLog = {
  timestamp: string;
  level: 'info' | 'error';
  requestId: string;
  method: HttpMethod | string;
  path: string;
  status: number;
  durationMs: number;
  sessionPresent: boolean;
};

export type ApiMetricsSnapshot = {
  requestsTotal: number;
  errorsTotal: number;
  latencyMs: {
    count: number;
    average: number;
    max: number;
  };
  backgroundJobs: {
    queued: number;
    processing: number;
    failed: number;
    deadLetter: number;
  };
};

export type ApiMetricsRecorder = {
  recordRequest(input: { status: number; durationMs: number }): void;
  snapshot(): ApiMetricsSnapshot;
};

export type ErrorTracker = {
  captureException(error: unknown, context: { requestId: string; path: string; method: string }): void;
};

export function createInMemoryMetricsRecorder(): ApiMetricsRecorder {
  let requestsTotal = 0;
  let errorsTotal = 0;
  let latencyTotal = 0;
  let latencyMax = 0;

  return {
    recordRequest({ status, durationMs }) {
      requestsTotal += 1;
      latencyTotal += durationMs;
      latencyMax = Math.max(latencyMax, durationMs);
      if (status >= 500) {
        errorsTotal += 1;
      }
    },
    snapshot() {
      return {
        requestsTotal,
        errorsTotal,
        latencyMs: {
          count: requestsTotal,
          average: requestsTotal ? Number((latencyTotal / requestsTotal).toFixed(2)) : 0,
          max: latencyMax
        },
        backgroundJobs: {
          queued: 0,
          processing: 0,
          failed: 0,
          deadLetter: 0
        }
      };
    }
  };
}

export function createConsoleStructuredLogger() {
  return (entry: StructuredApiLog) => {
    const log = entry.level === 'error' ? console.error : console.info;
    log(JSON.stringify(entry));
  };
}

export function createPlaceholderErrorTracker(enabled: boolean): ErrorTracker {
  return {
    captureException(error, context) {
      if (!enabled) {
        return;
      }

      console.error(JSON.stringify({
        level: 'error',
        event: 'error_tracking_placeholder',
        requestId: context.requestId,
        path: context.path,
        method: context.method,
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };
}
