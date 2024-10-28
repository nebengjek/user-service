const assert = require('assert');
const sinon = require('sinon');

const commonHelper = require('all-in-one');
const command = require('../../../../../../src/modules/driver/repositories/commands/command');
const query = require('../../../../../../src/modules/driver/repositories/queries/query');
const jwtAuth = require('../../../../../../src/auth/jwt_auth_helper');
const User = require('../../../../../../src/modules/driver/repositories/commands/domain');
const common = require('../../../../../../src/modules/driver/utils/common');

describe('User-domain', () => {

  const queryResult = {
    'err': null,
    'data': {
      '_id': '5bac53b45ea76b1e9bd58e1c',
      'email': 'email@gmail.com',
      'password': '3d3811045545be3a9e91e2352f9c668a:50aa9b313ef3365801335297c09c13f0',
      'isConfirmed': true
    },
    'message': 'Your Request Has Been Processed',
    'code': 200
  };

  const payload = {
    'username': 'email@gmail.com',
    'password': 'assessment123'
  };

  const db = {
    setCollection: sinon.stub()
  };

  const user = new User(db);

  const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';

  beforeEach(() => {
    sinon.stub(commonHelper, 'log');
  });

  afterEach(() => {
    commonHelper.log.restore();
  });

  describe('generateCredential', () => {

    it('should generate jwt token', async() => {
      sinon.stub(query.prototype, 'findOneUser').resolves(queryResult);
      sinon.stub(commonHelper, 'decryptWithIV').returns(payload.password);
      sinon.stub(jwtAuth, 'generateToken').resolves(accessToken);

      const res = await user.generateCredential(payload);
      assert.notEqual(res, null);
      assert.deepEqual(res, {
        data: {
          accessToken
        },
        err: null
      });
      query.prototype.findOneUser.restore();
      commonHelper.decryptWithIV.restore();
      jwtAuth.generateToken.restore();
    });

    it('should return error', async() => {
      sinon.stub(query.prototype, 'findOneUser').resolves({ err: 'err'});

      const res = await user.generateCredential(payload);
      assert.notEqual(res.err, null);

      query.prototype.findOneUser.restore();

    });

    it('should return user invalid', async() => {
      
      delete queryResult.data.isConfirmed;
      sinon.stub(query.prototype, 'findOneUser').resolves(queryResult);
      sinon.stub(commonHelper, 'decryptWithIV').returns(queryResult.password);

      const res = await user.generateCredential(payload);
      assert.notEqual(res.err, null);

      commonHelper.decryptWithIV.restore();
      query.prototype.findOneUser.restore();
    });
  });

  describe('register', () => {

    it('should success register', async() => {
      sinon.stub(query.prototype, 'findOneUser').resolves({ data: null});
      sinon.stub(command.prototype, 'insertOneUser').resolves(queryResult);
      sinon.stub(commonHelper, 'encryptWithIV').resolves(queryResult);

      const res = await user.registerDriver(payload);

      assert.equal(res.data.email, 'email@gmail.com');
      commonHelper.encryptWithIV.restore();
      query.prototype.findOneUser.restore();
      command.prototype.insertOneUser.restore();
    });

    it('should return error', async() => {
      sinon.stub(common, 'filterEmailOrMobileNumber').resolves({email: 'email@gmail.com'});

      sinon.stub(query.prototype, 'findOneUser').resolves(queryResult);

      const res = await user.registerDriver(payload);
      assert.notEqual(res.err, null);
      common.filterEmailOrMobileNumber.restore();
      query.prototype.findOneUser.restore();
    });
  });

});
