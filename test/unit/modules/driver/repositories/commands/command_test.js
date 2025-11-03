const { expect } = require('chai');
const sinon = require('sinon');
const Command = require('../../../../../../src/modules/driver/repositories/commands/command');

describe('Command', () => {
  let sandbox;
  let db;
  let command;
  let clock;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    clock = sandbox.useFakeTimers(new Date('2024-01-01').getTime());
    db = {
      preparedQuery: sandbox.stub()
    };
    command = new Command(db);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('insertOneUser', () => {
    it('should insert user with all fields', async () => {
      const document = {
        userId: 'u-123',
        fullName: 'John Doe',
        email: 'john@example.com',
        mobileNumber: '08123456789',
        password: 'hashedpwd',
        mitra: true,
        verify: true,
        completed: false
      };
      
      const expectedResult = { err: null, data: { insertId: 1 } };
      db.preparedQuery.resolves(expectedResult);

      const result = await command.insertOneUser(document);

      expect(result).to.deep.equal(expectedResult);
      expect(db.preparedQuery.calledOnce).to.be.true;
      
      const [sql, params] = db.preparedQuery.firstCall.args;
      expect(sql).to.include('INSERT INTO users');
      expect(params).to.have.lengthOf(9);
      expect(params).to.deep.equal([
        document.userId,
        document.fullName,
        document.email,
        document.mobileNumber,
        document.password,
        '2024-01-01 00:00:00',
        document.mitra,
        document.verify,
        document.completed
      ]);
    });

    it('should handle minimal document with nulls for optional fields', async () => {
      const document = {
        userId: 'u-123',
        password: 'pwd'
      };

      await command.insertOneUser(document);

      const [, params] = db.preparedQuery.firstCall.args;
      expect(params[2]).to.be.null; // email
      expect(params[3]).to.be.null; // mobileNumber
    });
  });

  describe('upsertOneUser', () => {
    it('should update using primitive userId', async () => {
      const params = 'u-123';
      const document = { name: 'Updated' };
      
      await command.upsertOneUser(params, document);

      const [sql, values] = db.preparedQuery.firstCall.args;
      expect(sql).to.include('UPDATE users SET');
      expect(sql).to.include('WHERE user_id = ?');
      expect(values).to.include(params);
    });

    it('should return early with empty document', async () => {
      const result = await command.upsertOneUser('u-1', {});
      
      expect(result).to.deep.equal({ affectedRows: 0 });
      expect(db.preparedQuery.called).to.be.false;
    });

    it('should use first key when no userId in params object', async () => {
      const params = { email: 'test@example.com' };
      const document = { name: 'Test' };
      
      await command.upsertOneUser(params, document);

      const [sql] = db.preparedQuery.firstCall.args;
      expect(sql).to.include('WHERE email = ?');
    });
  });

  describe('upsertInfoDriver', () => {
    const document = {
      userId: 'd-123',
      city: 'Jakarta',
      province: 'DKI',
      jenisKendaraan: 'Motor',
      nopol: 'B1234AB',
      kontakKeluargaLainnya: '08123456789'
    };

    it('should update existing driver info', async () => {
      db.preparedQuery.onFirstCall().resolves({ err: null, data: [{ driver_id: 'd-123' }] });
      db.preparedQuery.onSecondCall().resolves({ err: null, data: { affectedRows: 1 } });

      await command.upsertInfoDriver(document);

      expect(db.preparedQuery.calledTwice).to.be.true;
      const [updateSql, updateParams] = db.preparedQuery.secondCall.args;
      expect(updateSql).to.include('UPDATE info_driver');
      expect(updateParams).to.have.lengthOf(7);
    });

    it('should insert new driver info', async () => {
      db.preparedQuery.onFirstCall().resolves({ err: null, data: [] });
      
      await command.upsertInfoDriver(document);

      const [insertSql, insertParams] = db.preparedQuery.secondCall.args;
      expect(insertSql).to.include('INSERT INTO info_driver');
      expect(insertParams).to.have.lengthOf(8);
    });
  });

  describe('insertOneWallet', () => {
    it('should return early if wallet exists', async () => {
      db.preparedQuery.resolves({ err: null, data: [{ id: 1 }] });

      const result = await command.insertOneWallet({ userId: 'u-1' });

      expect(result).to.deep.equal({ data: 'wallet exist', err: null });
    });

    it('should create new wallet with default balance', async () => {
      db.preparedQuery.onFirstCall().resolves({ err: null, data: [] });
      
      await command.insertOneWallet({ userId: 'u-1' });

      const [, insertParams] = db.preparedQuery.secondCall.args;
      expect(insertParams[1]).to.equal(0); // default balance
    });

    it('should handle database errors', async () => {
      const dbError = new Error('DB Error');
      db.preparedQuery.rejects(dbError);

      try {
        await command.insertOneWallet({ userId: 'u-1' });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).to.equal(dbError);
      }
    });
  });
});