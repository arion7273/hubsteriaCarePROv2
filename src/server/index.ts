import { createNodeApiServer } from '../api';
import { readServerConfig } from './config';
import { createRuntimeServices, seedDemoMasterAdmin } from './services';

const config = readServerConfig();
const services = createRuntimeServices(config);
const server = createNodeApiServer(services);

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
