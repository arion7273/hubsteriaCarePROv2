import { createNodeApiServer } from '../api';
import { readServerConfig } from './config';
import { createRuntimeObservability } from './observability';
import { createRuntimeServices, seedDemoMasterAdmin } from './services';

const config = readServerConfig();
const observability = createRuntimeObservability(config);
const services = createRuntimeServices(config);
const server = createNodeApiServer(services, {
  metrics: observability.metrics,
  structuredLogger: observability.structuredLogger,
  errorTracker: observability.errorTracker,
  readiness: async () => ({
    ok: true,
    checks: {
      api: true,
      repositoryMode: config.repositoryMode,
      monitoringConfigured: String(observability.status.monitoringConfigured),
      errorTrackingConfigured: String(observability.status.errorTrackingConfigured)
    }
  })
});

if (config.repositoryMode === 'memory') {
  await seedDemoMasterAdmin(services);
}

server.listen(config.port, () => {
  console.log(`HubsteriaCarePRO API listening on port ${config.port}`);
});

async function shutdown() {
  server.close();
  await services.close?.();
}

process.on('SIGINT', () => {
  void shutdown().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  void shutdown().then(() => process.exit(0));
});
