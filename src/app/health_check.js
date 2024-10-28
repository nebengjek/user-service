
const logger = require('all-in-one');

const mongoConnectionPooling = require('../helpers/databases/mongodb/connection');

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

let retries = 0;

const shutdown = async (server) => {
  server.close(() => {
    logger.log('Server closed. No longer accepting connections.');

    // Perform cleanup tasks
    // For example, close database connections, release resources, etc.
    process.exit(0);
  });
};

const checkServiceHealth = async (server) => {
  const mongoConnection = await mongoConnectionPooling.init();
  if (!mongoConnection) {
    handleUnhealthyService(server);
    
  }
};

const handleUnhealthyService = async (server) => {
  if (retries < MAX_RETRIES) {
    retries++;
    logger.log(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
    await delay(RETRY_INTERVAL);
    checkServiceHealth(server);
  } else {
    logger.log('Service is consistently unhealthy. Restarting...');
    shutdown(server);
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Start the initial health check
module.exports = { checkServiceHealth };
