// FILEPATH: /Users/faridtriwicaksono/Documents/TELKOMSEL/DEV/assesment-project/user-service/test/unit/bin/app/health_check.test.js

const sinon = require('sinon');
const commonHelper = require('all-in-one');
const mongoConnectionPooling = require('../../../src/helpers/databases/mongodb/connection');
const healthCheck = require('../../../src/app/health_check');

describe('healthCheck', () => {
  let sandbox;
  let server;
  let mongoConnectionStub;
  let logStub;
  const MAX_RETRIES = 3;
  const RETRY_INTERVAL = 5000; // 5 seconds

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    server = { close: sandbox.stub() };
    mongoConnectionStub = sandbox.stub(mongoConnectionPooling, 'init');
    logStub = sandbox.stub(commonHelper, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should handle healthy service', async () => {
    mongoConnectionStub.resolves(true);

    await healthCheck.checkServiceHealth(server);

    sinon.assert.notCalled(logStub);
  });

  it('should handle unhealthy service and retry', async () => {
    mongoConnectionStub.resolves(false);

    await healthCheck.checkServiceHealth(server);

    sinon.assert.calledWith(logStub, `Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
  });

  it('should handle consistently unhealthy service and shutdown', async () => {
    mongoConnectionStub.resolves(false);
  
    const promises = [];

    for (let i = 0; i < MAX_RETRIES; i++) {
      promises.push(healthCheck.checkServiceHealth(server));
    }

    await Promise.all(promises);
  
    sinon.assert.calledWith(logStub, 'Service is consistently unhealthy. Restarting...');
    sinon.assert.calledOnce(server.close);
  });
  
});
