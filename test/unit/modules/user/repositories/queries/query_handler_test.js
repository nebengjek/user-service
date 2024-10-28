const sinon = require('sinon');
const assert = require('assert');
const queryHandler = require('../../../../../../src/modules/user/repositories/queries/query_handler');
const User = require('../../../../../../src/modules/user/repositories/queries/domain');

describe('User-queryHandler', () => {

  const resultOne = {
    err: null,
    message: '',
    data: {
      userId: '0e4e2d82-199f-49a7-9fae-33ef138d4726',
      isDeleted: false,
    },
    code: 200
  };

  describe('getUser', () => {

    it('should return success get User', async () => {
      sinon.stub(User.prototype, 'viewUser').resolves(resultOne);

      const rs = await queryHandler.getUser();

      assert.notEqual(rs.data, null);
      assert.equal(rs.code, 200);

      User.prototype.viewUser.restore();
    });
  });


});
