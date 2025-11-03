// javascript
const assert = require('assert');
const sinon = require('sinon');

const commonHelper = require('all-in-one');
const command = require('../../../../../../src/modules/user/repositories/commands/command');
const query = require('../../../../../../src/modules/user/repositories/queries/query');
const jwtAuth = require('../../../../../../src/auth/jwt_auth_helper');
const User = require('../../../../../../src/modules/user/repositories/commands/domain');
const common = require('../../../../../../src/modules/user/utils/common');

describe('User-domain', () => {
  let sandbox;
  const payload = {
    username: 'email@gmail.com',
    password: 'assessment123'
  };

  const db = { setCollection: sinon.stub() };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // silence logs and control wrapper outputs
    sandbox.stub(commonHelper, 'log');
    // ensure Wrapper exists and methods can be stubbed
    if (!commonHelper.Wrapper) commonHelper.Wrapper = {};
    sandbox.stub(commonHelper.Wrapper, 'data').callsFake((d) => ({ data: d || null, err: null }));
    sandbox.stub(commonHelper.Wrapper, 'error').callsFake((e) => ({ data: null, err: e || 'error' }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('generateCredential', () => {
    it('should generate jwt token when credentials valid', async () => {
      const userRecord = {
        userId: 'u-1',
        email: 'email@gmail.com',
        password: 'enc:pwd',
        isConfirmed: true
      };
      // query returns data array with userRecord
      sandbox.stub(query.prototype, 'findOneUser').resolves({ err: null, data: [userRecord] });
      // decrypt returns plain password matching payload.password
      sandbox.stub(commonHelper, 'decryptWithIV').resolves(payload.password);
      // jwt returns access token
      const accessToken = 'token-abc';
      sandbox.stub(jwtAuth, 'generateToken').resolves(accessToken);

      const user = new User(db);

      const expectedWrapper = { data: { accessToken }, err: null };
      // override Wrapper.data to return expected shape (already stubbed in beforeEach, but ensure same shape)
      commonHelper.Wrapper.data.withArgs({ accessToken }).returns(expectedWrapper);

      const res = await user.generateCredential(payload);

      assert.deepEqual(res, expectedWrapper);
      // ensure decrypt was called with stored password, algorithm and key are passed by domain; we only check it was called
      assert(commonHelper.decryptWithIV.calledOnce);
      assert(jwtAuth.generateToken.calledOnce);
      // cleanup
      query.prototype.findOneUser.restore();
      commonHelper.decryptWithIV.restore();
      jwtAuth.generateToken.restore();
    });

    it('should return error when findOneUser returns err', async () => {
      sandbox.stub(query.prototype, 'findOneUser').resolves({ err: 'notfound' });
      const user = new User(db);

      const res = await user.generateCredential(payload);

      assert.notEqual(res.err, null);
      assert(commonHelper.log.called);
      query.prototype.findOneUser.restore();
    });

    it('should return error when password is invalid', async () => {
      const userRecord = { userId: 'u-2', password: 'enc:pwd' };
      sandbox.stub(query.prototype, 'findOneUser').resolves({ err: null, data: [userRecord] });
      // decrypt returns something different than payload.password
      sandbox.stub(commonHelper, 'decryptWithIV').resolves('wrong-password');

      const user = new User(db);
      const res = await user.generateCredential(payload);

      assert.notEqual(res.err, null);
      assert(commonHelper.log.called);
      query.prototype.findOneUser.restore();
      commonHelper.decryptWithIV.restore();
    });
  });

  describe('registerUser', () => {
    it('should register user successfully when not exists', async () => {
      // ensure filter returns an object (domain uses it)
      sandbox.stub(common, 'filterEmailOrMobileNumber').returns({ email: 'email@gmail.com' });
      // no existing user
      sandbox.stub(query.prototype, 'findOneUser').resolves({ data: null });
      // encrypt returns encrypted password
      const encrypted = 'enc-val';
      sandbox.stub(commonHelper, 'encryptWithIV').resolves(encrypted);
      // make insertOneUser resolve with { data: { email }, err: null }
      sandbox.stub(command.prototype, 'insertOneUser').resolves({ data: { email: 'email@gmail.com' }, err: null });

      const user = new User(db);

      // ensure Wrapper.data returns a known payload
      const wrapperSuccess = { data: { email: 'email@gmail.com' }, err: null };
      commonHelper.Wrapper.data.withArgs().returns(wrapperSuccess);

      // use a copy of payload so domain.delete doesn't mutate shared object in other tests
      const input = Object.assign({}, payload);
      const res = await user.registerUser(input);

      assert.deepEqual(res, wrapperSuccess);
      // insertOneUser should be called once and the argument should include encrypted password and a userId
      assert(command.prototype.insertOneUser.calledOnce);
      const insertArg = command.prototype.insertOneUser.firstCall.args[0];
      assert.equal(insertArg.email, 'email@gmail.com');
      assert.equal(insertArg.password, encrypted);
      assert.ok(typeof insertArg.userId === 'string' && insertArg.userId.length > 0);

      common.filterEmailOrMobileNumber.restore();
      query.prototype.findOneUser.restore();
      commonHelper.encryptWithIV.restore();
      command.prototype.insertOneUser.restore();
    });

    it('should return error when user already exists', async () => {
      sandbox.stub(common, 'filterEmailOrMobileNumber').returns({ email: 'email@gmail.com' });
      sandbox.stub(query.prototype, 'findOneUser').resolves({ data: { email: 'email@gmail.com' } });

      const user = new User(db);
      const res = await user.registerUser(Object.assign({}, payload));

      assert.notEqual(res.err, null);
      assert(commonHelper.log.called);

      common.filterEmailOrMobileNumber.restore();
      query.prototype.findOneUser.restore();
    });

    it('should return error when insertOneUser reports error', async () => {
      sandbox.stub(common, 'filterEmailOrMobileNumber').returns({ email: 'email@gmail.com' });
      sandbox.stub(query.prototype, 'findOneUser').resolves({ data: null });
      sandbox.stub(commonHelper, 'encryptWithIV').resolves('enc');
      sandbox.stub(command.prototype, 'insertOneUser').resolves({ data: null, err: 'DBERR' });

      const user = new User(db);
      const res = await user.registerUser(Object.assign({}, payload));

      assert.notEqual(res.err, null);
      assert(commonHelper.log.called);

      common.filterEmailOrMobileNumber.restore();
      query.prototype.findOneUser.restore();
      commonHelper.encryptWithIV.restore();
      command.prototype.insertOneUser.restore();
    });
  });
});