const sinon = require('sinon');
const assert = require('assert');
const commandHandler = require('../../../../../../src/modules/driver/repositories/commands/command_handler');
const User = require('../../../../../../src/modules/driver/repositories/commands/domain');

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

      const rs = await commandHandler.loginDriver(payload);

      assert.notEqual(rs.data, null);
      assert.equal(rs.code, 200);

      User.prototype.generateCredential.restore();
    });
  });

  describe('register', () => {

    it('should info success register', async() => {
      sinon.stub(User.prototype, 'registerDriver').resolves(data);

      const rs = await commandHandler.registerDriver(payload);

      assert.notEqual(rs.data, null);
      assert.equal(rs.code, 200);

      User.prototype.registerDriver.restore();
    });
  });
  
  describe('updateDataDriver', () => {

    it('should info success updateDataDriver', async() => {
      sinon.stub(User.prototype, 'updateDataDriver').resolves(data);

      const rs = await commandHandler.updateDataDriver(payload);

      assert.notEqual(rs.data, null);
      assert.equal(rs.code, 200);

      User.prototype.updateDataDriver.restore();
    });
  });
});
