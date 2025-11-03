// javascript
const sinon = require('sinon');
const assert = require('assert');

const commonHelper = require('all-in-one');
const User = require('../../../../../../src/modules/user/repositories/queries/domain');
const query = require('../../../../../../src/modules/user/repositories/queries/query');

describe('User-domain viewUser', () => {
  let sandbox;
  const db = { setCollection: sinon.stub() };
  let user;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    if (!commonHelper.Wrapper) commonHelper.Wrapper = {};
    sandbox.stub(commonHelper.Wrapper, 'data').callsFake((d) => ({ data: d || null, err: null }));
    sandbox.stub(commonHelper.Wrapper, 'error').callsFake((e) => ({ data: null, err: e || new Error('error') }));
    user = new User(db);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return user data without password and call wrapper.data', async () => {
    const queryResult = {
      err: null,
      data: [
        {
          _id: '65cb2250a10d1f8be67f5517',
          email: 'email@gmail.com',
          full_name: 'John Doe',
          password: 'encryptedpwd',
          referralCode: '',
          user_id: '5430e14f-21a7-4d63-85f8-9267e4211b6f',
          isConfirmed: true,
          isAdmin: true
        }
      ]
    };

    sandbox.stub(query.prototype, 'findOneUser').resolves(queryResult);

    const userId = '65cb2250a10d1f8be67f5517';
    const res = await user.viewUser(userId);

    assert.ok(commonHelper.Wrapper.data.calledOnce, 'Wrapper.data should be called once');
    const calledWith = commonHelper.Wrapper.data.firstCall.args[0];
    assert.strictEqual(calledWith.password, undefined, 'password should be removed before wrapping');
    assert.strictEqual(calledWith.email, 'email@gmail.com');
    assert.strictEqual(calledWith._id, '65cb2250a10d1f8be67f5517');

    // returned value should be the wrapper output
    assert.deepStrictEqual(res, { data: calledWith, err: null });

    query.prototype.findOneUser.restore();
  });

  it('should propagate exception when findOneUser throws', async () => {
    const error = new Error('Database error');
    sandbox.stub(query.prototype, 'findOneUser').rejects(error);

    const userId = '65cb2250a10d1f8be67f5517';
    try {
      await user.viewUser(userId);
      assert.fail('Expected error to be thrown');
    } catch (err) {
      assert.strictEqual(err, error);
    } finally {
      query.prototype.findOneUser.restore();
    }
  });

  it('should return wrapper.error when findOneUser returns err', async () => {
    const queryResult = { err: true, data: null };
    sandbox.stub(query.prototype, 'findOneUser').resolves(queryResult);

    const userId = '65cb2250a10d1f8be67f5517';
    const res = await user.viewUser(userId);

    assert.ok(commonHelper.Wrapper.error.calledOnce, 'Wrapper.error should be called once');
    assert.ok(res.err, 'expected an error in wrapper.error result');
    assert.strictEqual(res.err.message, 'Can not find user');

    query.prototype.findOneUser.restore();
  });
});