const redis = require('redis');
const logger = require('../../utils/logger');
const connectionPool = [];

const createConnectionPool = async (config) => {
  const currConnection = connectionPool.findIndex(conf => conf.config.toString() === config.toString());
  if (currConnection === -1) {
    const client = redis.createClient({
      retry_strategy: function (options) {
        if (options.error) {
          if (options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error
            // and flush all commands with a individual errors
            logger.log('redis', 'The server refused the connection', 'error');
            return new Error('The server refused the connection');
          }
          if (options.error.code === 'ECONNRESET') {
            logger.log('redis', 'The server reset the connection', 'error');
            return new Error('The server reset the connection');
          }
          if (options.error.code === 'ETIMEDOUT') {
            logger.log('redis', 'The server timeouted the connection', 'error');
            return new Error('The server timeouted the connection');
          }
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          // End reconnecting after a specific timeout and flush all commands
          // with a individual error
          logger.log('redis', 'Retry time exhausted', 'error');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          // End reconnecting with built in error
          logger.log('redis', 'Retry attempt exceed', 'error');
          return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
      },
      ...config,
    });
    connectionPool.push({
      config,
      client
    });
    return connectionPool;
  }
  return currConnection;
};

const getConnection = async () => {
  return connectionPool;
};

module.exports = {
  createConnectionPool,
  getConnection
};
