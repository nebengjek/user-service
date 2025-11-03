// javascript
const assert = require('assert');
const sinon = require('sinon');

const Query = require('../../../../../../src/modules/driver/repositories/queries/query');

describe('Query repository', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function createDbMock() {
    return {
      preparedQuery: sandbox.stub()
    };
  }

  describe('findOneUser', () => {
    it('should return error wrapper when no parameters provided', async () => {
      const db = createDbMock();
      const query = new Query(db);

      const res = await query.findOneUser({});
      assert.ok(res.err, 'expected an error object when no params provided');
    });

    it('should query by email when email param provided', async () => {
      const db = createDbMock();
      const email = 'a@b.com';
      const expected = { err: null, data: [{ email }] };
      db.preparedQuery.resolves(expected);

      const q = new Query(db);
      const res = await q.findOneUser({ email });

      assert.ok(db.preparedQuery.calledOnce, 'preparedQuery should be called once');
      const [sql, values] = db.preparedQuery.firstCall.args;
      assert.ok(sql.includes('WHERE'), 'SQL should contain WHERE clause');
      assert.ok(sql.includes('email = ?'), 'SQL should contain email condition');
      assert.ok(sql.includes('LIMIT 1'), 'SQL should contain LIMIT 1');
      assert.deepEqual(values, [email], 'values should contain email only');
      assert.strictEqual(res.data, expected.data[0]);
    });

    it('should query by mobileNumber when mobileNumber param provided', async () => {
      const db = createDbMock();
      const mobileNumber = '081234';
      const expected = { err: null, data: [{ mobile_number: mobileNumber }] };
      db.preparedQuery.resolves(expected);

      const q = new Query(db);
      const res = await q.findOneUser({ mobileNumber });

      assert.ok(db.preparedQuery.calledOnce);
      const [sql, values] = db.preparedQuery.firstCall.args;
      assert.ok(sql.includes('mobile_number = ?'));
      assert.deepEqual(values, [mobileNumber]);
      assert.strictEqual(res.data, expected.data[0]);
    });

    it('should query by userId when userId param provided', async () => {
      const db = createDbMock();
      const userId = 'u-123';
      const expected = { err: null, data: [{ user_id: userId }] };
      db.preparedQuery.resolves(expected);

      const q = new Query(db);
      const res = await q.findOneUser({ userId });

      assert.ok(db.preparedQuery.calledOnce);
      const [sql, values] = db.preparedQuery.firstCall.args;
      assert.ok(sql.includes('user_id = ?'));
      assert.deepEqual(values, [userId]);
      assert.strictEqual(res.data, expected.data[0]);
    });

    it('should build WHERE with multiple conditions when multiple params provided', async () => {
      const db = createDbMock();
      const email = 'x@y.com';
      const mobileNumber = '081000';
      const expected = { err: null, data: [{ email, mobile_number: mobileNumber }] };
      db.preparedQuery.resolves(expected);

      const q = new Query(db);
      const res = await q.findOneUser({ email, mobileNumber });

      assert.ok(db.preparedQuery.calledOnce);
      const [sql, values] = db.preparedQuery.firstCall.args;
      assert.ok(sql.includes('mobile_number = ?') && sql.includes('email = ?'));
      assert.deepEqual(values, [mobileNumber, email]);
      assert.strictEqual(res.data, expected.data[0]);
    });

    it('should propagate error when preparedQuery rejects', async () => {
      const db = createDbMock();
      const email = 'err@x';
      const err = new Error('DB FAIL');
      db.preparedQuery.rejects(err);

      const q = new Query(db);
      try {
        await q.findOneUser({ email });
        assert.fail('Expected findOneUser to throw');
      } catch (e) {
        assert.strictEqual(e, err);
      }
    });
  });

  describe('findById', () => {
    it('should query by id and return result', async () => {
      const db = createDbMock();
      const id = '65cb2250a10d1f8be67f5517';
      const expected = { err: null, data: [{ userId: id }] };
      db.preparedQuery.resolves(expected);

      const q = new Query(db);
      const res = await q.findById(id);

      assert.ok(db.preparedQuery.calledOnce);
      const [sql, values] = db.preparedQuery.firstCall.args;
      assert.ok(sql.includes('WHERE user_id = ?'), 'SQL should contain user_id condition');
      assert.deepEqual(values, [id]);
      assert.strictEqual(res, expected);
    });

    it('should propagate error when preparedQuery rejects in findById', async () => {
      const db = createDbMock();
      const id = 'id-err';
      const err = new Error('DBERR');
      db.preparedQuery.rejects(err);

      const q = new Query(db);
      try {
        await q.findById(id);
        assert.fail('Expected findById to throw');
      } catch (e) {
        assert.strictEqual(e, err);
      }
    });
  });
});