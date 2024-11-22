const sinon = require('sinon');
const { expect } = require('chai');
const httpMocks = require('node-mocks-http');
const commonHelper = require('all-in-one');
const userHandler = require('../../../../../src/modules/driver/handlers/api_handler');
const commandHandler = require('../../../../../src/modules/driver/repositories/commands/command_handler');
const queryHandler = require('../../../../../src/modules/driver/repositories/queries/query_handler');


describe('User Api Handler', () => {

  let commandStub;
  const req = httpMocks.createRequest({});
  const res = httpMocks.createResponse({});
  
  const resultSuccess = {
    err: null,
    message: 'success',
    data: [],
    code: 200
  };

  const resultError = {
    err: {}
  };

  beforeEach(() => {
    commandStub = sinon.stub(commandHandler, 'loginDriver');
    commandStub.resolves({
      err: 'user not found',
      data: null
    });
  });

  afterEach(() => {
    commandStub.restore();
  });

  describe('loginDriver', () => {
    it('should cover error validation', async() => {
      await userHandler.loginDriver(req, res);
    });
    it('should return user not found', async() => {
      sinon.stub(commonHelper, 'isValidPayload').resolves({
        err: null,
        data: {}
      });
      await userHandler.loginDriver(req, res);
      commonHelper.isValidPayload.restore();
    });
    it('should return password invalid', async() => {
      sinon.stub(commonHelper, 'isValidPayload').resolves({
        err: null,
        data: {}
      });
      commandStub.resolves({
        err: 'password invalid!',
        data: null
      });
      await userHandler.loginDriver(req, res);
      commonHelper.isValidPayload.restore();
    });
  });
  
  describe('getDriver', () => {
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return error response', async () => {
      req.userMeta = {
        userId: 1
      };
      sinon.stub(queryHandler, 'getDriver').returns(resultError);
  
      await userHandler.getDriver(req, res);
  
      expect(res.statusCode).to.not.equal(200);
    });
  
    it('should return success response', async () => {
      req.userMeta = {
        userId: 1
      };
      sinon.stub(queryHandler, 'getDriver').returns(resultSuccess);
  
      await userHandler.getDriver(req, res);
      
      expect(res.statusCode).to.equal(200);
    });
  });
  

  describe('registerDriver', () => {
    it('should return error validation', () => {
      userHandler.registerDriver(req, res);
    });
    it('should return success', () => {
      sinon.stub(commonHelper, 'isValidPayload').resolves({
        err: null,
        data: {}
      });
      sinon.stub(commandHandler, 'registerDriver').resolves({
        err: null,
        data: {}
      });
      userHandler.registerDriver(req, res);
      commonHelper.isValidPayload.restore();
      commandHandler.registerDriver.restore();
    });
  });
  
  describe('updateDataDriver', () => {
    it('should return error validation', () => {
      userHandler.updateDataDriver(req, res);
    });
    it('should return success', () => {
      sinon.stub(commonHelper, 'isValidPayload').resolves({
        err: null,
        data: {}
      });
      sinon.stub(commandHandler, 'updateDataDriver').resolves({
        err: null,
        data: {}
      });
      userHandler.updateDataDriver(req, res);
      commonHelper.isValidPayload.restore();
      commandHandler.updateDataDriver.restore();
    });
  });
});
