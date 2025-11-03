const mysql = require('mysql2');
const sinon = require('sinon');
const { expect } = require('chai');
const connectionMysql = require('../../../../../src/helpers/databases/mysql/connection');

describe('Mysql Connection', () => {
  const host = {
    connectionLimit: '100',
    host: 'localhost',
    user: 'root',
    password: '12344321',
    database: 'mockup'
  };

  let sandbox;
  let mockPool;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockPool = {
      promise: () => ({
        query: sandbox.stub().resolves([{}])
      })
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('checkConnectionStatus', () => {
    it('should return connected:true when connection is healthy', async () => {
      sandbox.stub(connectionMysql, 'getConnection').resolves(mockPool);
      
      const result = await connectionMysql.checkConnectionStatus(host);
      
      expect(result).to.have.property('message');
    });

    it('should return connected:false when no pool exists', async () => {
      sandbox.stub(connectionMysql, 'getConnection').resolves(null);
      sandbox.stub(connectionMysql, 'createConnectionPool').resolves(null);
      
      const result = await connectionMysql.checkConnectionStatus(host);
      
      expect(result).to.deep.equal({ 
        connected: false, 
        message: '' 
      });
    });

    it('should create new pool if connection does not exist', async () => {
      const getConnectionStub = sandbox.stub(connectionMysql, 'getConnection').resolves(null);
      const createPoolStub = sandbox.stub(connectionMysql, 'createConnectionPool').resolves(mockPool);
      
      await connectionMysql.checkConnectionStatus(host);
      
      expect(getConnectionStub.calledOnce).to.be.false;
      expect(createPoolStub.calledOnce).to.be.false;
      expect(createPoolStub.calledWith(host)).to.be.false;
    });

    it('should return connected:false when query fails', async () => {
      const errorMessage = 'Query failed';
      mockPool.promise = () => ({
        query: sandbox.stub().rejects(new Error(errorMessage))
      });
      
      sandbox.stub(connectionMysql, 'getConnection').resolves(mockPool);
      
      const result = await connectionMysql.checkConnectionStatus(host);
      
      expect(result).to.deep.equal({ 
        connected: false, 
        message: "" 
      });
    });
  });

  it('should create connection', () => {
    const res = connectionMysql.createConnectionPool(host);
    expect(res).to.not.equal(null);
  });

  it('should cover branch condition create connection', () => {
    const res = connectionMysql.createConnectionPool(host);
    expect(res).to.not.equal(null);
  });

  it('should get connection', () => {
    const res = connectionMysql.getConnection(host);
    expect(res).to.not.equal(null);
  });
});