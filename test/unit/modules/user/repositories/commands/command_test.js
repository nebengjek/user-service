// javascript
const { expect } = require('chai');
const sinon = require('sinon');
const Command = require('../../../../../../src/modules/user/repositories/commands/command');

describe('User-command', () => {
  let sandbox;
  let db;
  let command;
  let clock;

  // fixed timestamp -> 2020-01-01T00:00:00.000Z
  const FIXED_TS_ISO = '2020-01-01T00:00:00.000Z';
  const MYSQL_TIMESTAMP = '2020-01-01 00:00:00';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // freeze time so mysqlTimestamp is deterministic
    clock = sandbox.useFakeTimers(new Date(FIXED_TS_ISO).getTime());
    db = {
      preparedQuery: sandbox.stub()
    };
    command = new Command(db);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('insertOneUser', () => {
    it('should build correct INSERT SQL and params and return result on success', async () => {
      const mockPayload = {
        userId: 'u-123',
        fullName: 'John Doe',
        email: 'john@example.com',
        mobileNumber: '08123456789',
        password: 'hashedPwd'
      };

      const fakeResult = { affectedRows: 1, insertId: 42 };
      db.preparedQuery.resolves(fakeResult);

      const result = await command.insertOneUser(mockPayload);

      // verify returned value
      expect(result).to.equal(fakeResult);

      // verify preparedQuery called with expected SQL and params
      expect(db.preparedQuery.calledOnce).to.be.true;
      const [sql, params] = db.preparedQuery.firstCall.args;

      expect(sql).to.be.a('string');
      expect(sql).to.contain('INSERT INTO users (user_id, full_name, email, mobile_number, password, created_at, isMitra, isVerified, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      expect(params).to.be.an('array').with.lengthOf(9);

      expect(params[0]).to.equal(mockPayload.userId);
      expect(params[1]).to.equal(mockPayload.fullName);
      expect(params[2]).to.equal(mockPayload.email);
      expect(params[3]).to.equal(mockPayload.mobileNumber);
      expect(params[4]).to.equal(mockPayload.password);
      expect(params[5]).to.equal(MYSQL_TIMESTAMP);
      expect(params[6]).to.equal(false);
      expect(params[7]).to.equal(true);
      expect(params[8]).to.equal(true);
    });

    it('should propagate error when preparedQuery rejects', async () => {
      const mockPayload = {
        userId: 'u-err',
        fullName: 'Err',
        email: 'err@example.com',
        mobileNumber: '000',
        password: 'p'
      };
      const dbError = new Error('DB FAIL');
      db.preparedQuery.rejects(dbError);

      try {
        await command.insertOneUser(mockPayload);
        expect.fail('Expected insertOneUser to throw');
      } catch (err) {
        expect(err).to.equal(dbError);
      }
    });

    it('should handle empty payload and still call preparedQuery with undefined/null fields', async () => {
      const fakeResult = { affectedRows: 1 };
      db.preparedQuery.resolves(fakeResult);

      const result = await command.insertOneUser({});

      expect(result).to.equal(fakeResult);
      expect(db.preparedQuery.calledOnce).to.be.true;
      const [, params] = db.preparedQuery.firstCall.args;

      // userId and fullName undefined, email/mobileNumber become null, password undefined, timestamp and flags present
      expect(params[0]).to.equal(undefined);
      expect(params[1]).to.equal(undefined);
      expect(params[2]).to.equal(null);
      expect(params[3]).to.equal(null);
      expect(params[4]).to.equal(undefined);
      expect(params[5]).to.equal(MYSQL_TIMESTAMP);
      expect(params[6]).to.equal(false);
      expect(params[7]).to.equal(true);
      expect(params[8]).to.equal(true);
    });
  });

  describe('upsertOneUser', () => {
    it('should update using numeric/primitive param as user_id and return result', async () => {
      const params = 123; // primitive -> whereKey = 'user_id'
      // ensure insertion order: password then full_name
      const document = {
        password: 'newPass',
        full_name: 'New Name'
      };

      const fakeResult = { affectedRows: 1 };
      db.preparedQuery.resolves(fakeResult);

      const result = await command.upsertOneUser(params, document);

      expect(result).to.equal(fakeResult);
      expect(db.preparedQuery.calledOnce).to.be.true;

      const [sql, values] = db.preparedQuery.firstCall.args;

      // SQL should contain SET clause for keys in insertion order and updated_at and WHERE user_id = ?
      expect(sql).to.be.a('string');
      expect(sql).to.match(/UPDATE users SET\s+password = \?, full_name = \?, updated_at = \?\s+WHERE user_id = \?/);

      // values: [password, full_name, timestamp, whereValue]
      expect(values).to.be.an('array').with.lengthOf(4);
      expect(values[0]).to.equal(document.password);
      expect(values[1]).to.equal(document.full_name);
      expect(values[2]).to.equal(MYSQL_TIMESTAMP);
      expect(values[3]).to.equal(params);
    });

    it('should use params.user_id when params is object with user_id property', async () => {
      const params = { user_id: 'u-1' };
      const document = { password: 'p1' };
      const fakeResult = { affectedRows: 1 };
      db.preparedQuery.resolves(fakeResult);

      const result = await command.upsertOneUser(params, document);
      expect(result).to.equal(fakeResult);
      expect(db.preparedQuery.calledOnce).to.be.true;

      const [sql, values] = db.preparedQuery.firstCall.args;
      expect(sql).to.match(/WHERE user_id = \?/);
      expect(values[values.length - 1]).to.equal(params.user_id);
    });

    it('should use first key of params object when user_id not present', async () => {
      const params = { email: 'a@b.com', another: 'x' };
      const document = { password: 'pw' };
      const fakeResult = { affectedRows: 1 };
      db.preparedQuery.resolves(fakeResult);

      await command.upsertOneUser(params, document);

      expect(db.preparedQuery.calledOnce).to.be.true;
      const [sql, values] = db.preparedQuery.firstCall.args;
      // WHERE should use the first key (email) and last value should be the email value
      expect(sql).to.match(/WHERE email = \?/);
      expect(values[values.length - 1]).to.equal('a@b.com');
    });

    it('should return { affectedRows: 0 } and not call preparedQuery when document is empty', async () => {
      // preparedQuery should remain not called
      const res = await command.upsertOneUser({}, {});
      expect(res).to.deep.equal({ affectedRows: 0 });
      expect(db.preparedQuery.called).to.be.false;
    });

    it('should return { affectedRows: 0 } when document is null', async () => {
      const res = await command.upsertOneUser(null, null);
      expect(res).to.deep.equal({ affectedRows: 0 });
      expect(db.preparedQuery.called).to.be.false;
    });

    it('should propagate error when preparedQuery rejects during upsert', async () => {
      const params = { email: 'err@x' };
      const document = { password: 'p' };
      const dbError = new Error('UPSR_FAIL');
      db.preparedQuery.rejects(dbError);

      try {
        await command.upsertOneUser(params, document);
        expect.fail('Expected upsertOneUser to throw');
      } catch (err) {
        expect(err).to.equal(dbError);
      }
    });
  });
});