const sinon = require('sinon');
const assert = require('assert');
const commandHandler = require('../../../../../../src/modules/user/repositories/commands/command_handler');
const User = require('../../../../../../src/modules/user/repositories/commands/domain');

describe('User-commandHandler', () => {

  const data = {
    success: true,
    data: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
    message: 'Your Request Has Been Processed',
    code: 200
  };

  const payload = {
    'username': 'email@gmail.com',
    'password': 'assessment123'
  };

  describe('postDataLogin', () => {

    it('should return access token', async() => {
      sinon.stub(User.prototype, 'generateCredential').resolves(data);

      const rs = await commandHandler.loginUser(payload);

      assert.notEqual(rs.data, null);
      assert.equal(rs.code, 200);

      User.prototype.generateCredential.restore();
    });
  });

  describe('register', () => {

    it('should info success register', async() => {
      sinon.stub(User.prototype, 'registerUser').resolves(data);

      const rs = await commandHandler.registerUser(payload);

      assert.notEqual(rs.data, null);
      assert.equal(rs.code, 200);

      User.prototype.registerUser.restore();
    });
  });
});
