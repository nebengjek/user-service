const sinon = require('sinon');
const { expect } = require('chai');
const httpMocks = require('node-mocks-http');
const commonHelper = require('all-in-one');
const userHandler = require('../../../../../src/modules/user/handlers/api_handler');
const commandHandler = require('../../../../../src/modules/user/repositories/commands/command_handler');
const queryHandler = require('../../../../../src/modules/user/repositories/queries/query_handler');


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
    commandStub = sinon.stub(commandHandler, 'loginUser');
    commandStub.resolves({
      err: 'user not found',
      data: null
    });
  });

  afterEach(() => {
    commandStub.restore();
  });

  describe('loginUser', () => {
    it('should cover error validation', async() => {
      await userHandler.loginUser(req, res);
    });
    it('should return user not found', async() => {
      sinon.stub(commonHelper, 'isValidPayload').resolves({
        err: null,
        data: {}
      });
      await userHandler.loginUser(req, res);
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
      await userHandler.loginUser(req, res);
      commonHelper.isValidPayload.restore();
    });
  });
  
  describe('getUser', () => {
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return error response', async () => {
      req.userMeta = {
        userId: 1
      };
      sinon.stub(queryHandler, 'getUser').returns(resultError);
  
      await userHandler.getUser(req, res);
  
      expect(res.statusCode).to.not.equal(200);
    });
  
    it('should return success response', async () => {
      req.userMeta = {
        userId: 1
      };
      sinon.stub(queryHandler, 'getUser').returns(resultSuccess);
  
      await userHandler.getUser(req, res);
      
      expect(res.statusCode).to.equal(200);
    });
  });
  

  describe('registerUser', () => {
    it('should return error validation', () => {
      userHandler.registerUser(req, res);
    });
    it('should return success', () => {
      sinon.stub(commonHelper, 'isValidPayload').resolves({
        err: null,
        data: {}
      });
      sinon.stub(commandHandler, 'registerUser').resolves({
        err: null,
        data: {}
      });
      userHandler.registerUser(req, res);
      commonHelper.isValidPayload.restore();
      commandHandler.registerUser.restore();
    });
  });
});
