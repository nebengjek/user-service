const sinon = require('sinon');
const { expect } = require('chai');
const logger = require('all-in-one');
const mysqlConnectionPooling = require('../../../src/helpers/databases/mysql/connection');
const healthCheck = require('../../../src/app/health_check');

describe('healthCheck', () => {
  let sandbox;
  let server;
  let checkConnectionStatusStub;
  let logStub;
  let clock;
  const MAX_RETRIES = 3;
  const RETRY_INTERVAL = 5000;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    clock = sandbox.useFakeTimers();
    
    server = { 
      close: sandbox.stub().callsFake((cb) => {
        if (cb) cb();
        return Promise.resolve();
      })
    };

    checkConnectionStatusStub = sandbox.stub(mysqlConnectionPooling, 'checkConnectionStatus');
    logStub = sandbox.stub(logger, 'log');
    sandbox.stub(process, 'exit');
  });

  afterEach(() => {
    clock.restore();
    sandbox.restore();
  });

  it('should handle healthy service', async () => {
    checkConnectionStatusStub.resolves({ connected: true, message: 'Connection OK' });
    
    await healthCheck.checkServiceHealth(server);

    expect(logStub.calledWith(['INFO'], 'Database connection healthy.')).to.be.true;
    expect(server.close.called).to.be.false;
  });

  it('should handle unhealthy service and retry', async () => {
    checkConnectionStatusStub
      .onFirstCall().resolves({ connected: false, message: 'Connection lost' })
      .onSecondCall().resolves({ connected: true, message: 'Connection OK' });

    // Start health check
    const healthCheckPromise = healthCheck.checkServiceHealth(server);
    
    // Wait for first check to complete
    await Promise.resolve();

    // Verify first failure logs
    expect(logStub.firstCall).to.not.be.null;
    expect(logStub.firstCall.args).to.deep.equal([['Connection'], 'Database unhealthy: Connection lost']);
    
    // Verify retry message
    expect(logStub.secondCall).to.not.be.null;
    expect(logStub.secondCall.args[0]).to.equal('Retrying in 5 seconds...');

    // Advance timer and complete health check
    await clock.tickAsync(RETRY_INTERVAL);
    await healthCheckPromise;

    // Verify success logs
    expect(logStub.thirdCall).to.not.be.null;
    expect(logStub.thirdCall.args).to.deep.equal([['Connection'], 'Database reconnected successfully after retry.']);
    expect(checkConnectionStatusStub.callCount).to.equal(2);
    expect(server.close.called).to.be.false;
  });

  it('should handle consistently unhealthy service and shutdown', async function() {
    this.timeout(20000);
    checkConnectionStatusStub.resolves({ connected: false, message: 'Cannot connect' });

    // Start health check
    const healthCheckPromise = healthCheck.checkServiceHealth(server);
    
    // Wait for first check to complete
    await Promise.resolve();

    // Check each retry attempt
    for (let i = 0; i < MAX_RETRIES; i++) {
      const errorCallIndex = i * 2;
      const retryCallIndex = i * 2 + 1;

      expect(logStub.getCall(errorCallIndex)).to.not.be.null;
      expect(logStub.getCall(errorCallIndex).args).to.deep.equal(
        [['Connection'], 'Database unhealthy: Cannot connect']
      );

      expect(logStub.getCall(retryCallIndex)).to.not.be.null;
      expect(logStub.getCall(retryCallIndex).args[0]).to.equal('Retrying in 5 seconds...');
      
      await clock.tickAsync(RETRY_INTERVAL);
    }

    await healthCheckPromise;

    // Verify final state
    expect(logStub.lastCall).to.not.be.null;
    expect(logStub.lastCall.args).to.deep.equal(['Server closed. No longer accepting connections.']);
    expect(server.close.calledOnce).to.be.true;
    expect(process.exit.calledOnce).to.be.true;
  });
});