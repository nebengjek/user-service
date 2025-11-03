// javascript
const { expect } = require('chai');
const sinon = require('sinon');
const moment = require('moment');
const commonHelper = require('all-in-one');
const command = require('../../../../../../src/modules/driver/repositories/commands/command');
const query = require('../../../../../../src/modules/driver/repositories/queries/query');
const jwtAuth = require('../../../../../../src/auth/jwt_auth_helper');
const User = require('../../../../../../src/modules/driver/repositories/commands/domain');
const common = require('../../../../../../src/modules/driver/utils/common');

describe('User-domain', () => {
  let sandbox;
  const db = { setCollection: sinon.stub() };
  let user;

  const queryResult = {
    err: null,
    data: {
      _id: '5bac53b45ea76b1e9bd58e1c',
      email: 'email@gmail.com',
      password: 'encrypted:password',
      isConfirmed: true,
      userId: '2a4c03c4-6281-4310-bf6d-78470889a01e',
      isMitra: true,
      updated: moment().subtract(2, 'months').toDate()
    }
  };

  const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    if (!commonHelper.Wrapper) commonHelper.Wrapper = {};
    sandbox.stub(commonHelper, 'log');
    sandbox.stub(commonHelper.Wrapper, 'data').returns({ data: null, err: null });
    sandbox.stub(commonHelper.Wrapper, 'error').returns({ data: null, err: 'error' });
    user = new User(db);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('generateCredential', () => {
    const payload = {
      username: 'email@gmail.com',
      password: 'assessment123'
    };

    it('should return error when user not found', async () => {
      sandbox.stub(common, 'filterEmailOrMobileNumber').returns({ email: payload.username });
      sandbox.stub(query.prototype, 'findOneUser').resolves({ err: 'notfound' });

      const result = await user.generateCredential(payload);

      expect(result.err).to.exist;
      sinon.assert.calledWith(commonHelper.log, ['ERROR'], sinon.match.object);
      common.filterEmailOrMobileNumber.restore();
      query.prototype.findOneUser.restore();
    });

    it('should return error when password decryption fails', async () => {
      sandbox.stub(common, 'filterEmailOrMobileNumber').returns({ email: payload.username });
      sandbox.stub(query.prototype, 'findOneUser').resolves(queryResult);
      sandbox.stub(commonHelper, 'decryptWithIV').resolves('wrong-password');

      const result = await user.generateCredential(payload);

      expect(result.err).to.exist;
      sinon.assert.calledWith(commonHelper.log, ['ERROR'], 'password invalid');
      common.filterEmailOrMobileNumber.restore();
      query.prototype.findOneUser.restore();
      commonHelper.decryptWithIV.restore();
    });

    it('should successfully generate jwt token', async () => {
      sandbox.stub(common, 'filterEmailOrMobileNumber').returns({ email: payload.username });
      sandbox.stub(query.prototype, 'findOneUser').resolves(queryResult);
      sandbox.stub(commonHelper, 'decryptWithIV').resolves(payload.password);
      sandbox.stub(jwtAuth, 'generateToken').resolves(accessToken);
      commonHelper.Wrapper.data.returns({ data: { accessToken }, err: null });

      const result = await user.generateCredential(payload);

      expect(result).to.deep.equal({ data: { accessToken }, err: null });
      sinon.assert.calledWith(commonHelper.decryptWithIV, queryResult.data.password, sinon.match.string, sinon.match.string);
      sinon.assert.calledWith(jwtAuth.generateToken, { 
        sub: queryResult.data.userId,
        metadata: queryResult.data
      });
      common.filterEmailOrMobileNumber.restore();
      query.prototype.findOneUser.restore();
      commonHelper.decryptWithIV.restore();
      jwtAuth.generateToken.restore();
    });
  });

  describe('registerDriver', () => {
    const payload = {
      fullName: 'Farid Tri Wicaksono',
      username: 'email@gmail.com',
      password: 'assessment123'
    };

    it('should return error when user already exists', async () => {
      const filterResult = { email: payload.username, mitra: true };
      sandbox.stub(common, 'filterEmailOrMobileNumber').returns(filterResult);
      sandbox.stub(query.prototype, 'findOneUser').resolves({ data: { email: payload.username } });

      const result = await user.registerDriver(payload);

      expect(result.err).to.exist;
      sinon.assert.calledWith(commonHelper.log, ['ERROR'], sinon.match.string);
      common.filterEmailOrMobileNumber.restore();
      query.prototype.findOneUser.restore();
    });

    it('should successfully register driver', async () => {
      const filterResult = { email: payload.username, mitra: true };
      sandbox.stub(common, 'filterEmailOrMobileNumber').returns(filterResult);
      sandbox.stub(query.prototype, 'findOneUser').resolves({ data: null });
      sandbox.stub(commonHelper, 'encryptWithIV').resolves('encrypted-password');
      sandbox.stub(command.prototype, 'insertOneUser').resolves({ 
        data: { ...payload, email: payload.username },
        err: null
      });

      const result = await user.registerDriver(payload);

      expect(result.err).to.not.exist;
      sinon.assert.calledWith(command.prototype.insertOneUser, {
        ...filterResult,
        fullName: payload.fullName,
        password: 'encrypted-password',
        userId: sinon.match.string,
        verify: true,
        completed: false
      });
      common.filterEmailOrMobileNumber.restore();
      query.prototype.findOneUser.restore();
      commonHelper.encryptWithIV.restore();
      command.prototype.insertOneUser.restore();
    });
  });

  describe('updateDataDriver', () => {
    const userId = '2a4c03c4-6281-4310-bf6d-78470889a01e';
    const payload = {
      email: 'farid@gmail.com',
      mobileNumber: '08123456789',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      jenisKendaraan: 'Honda Scoopy',
      nopol: 'B 1234 AB',
      kontakKeluargaLainnya: '+628987654321'
    };

    it('should return error if user not found', async () => {
      sandbox.stub(query.prototype, 'findOneUser').resolves({ data: null });

      const result = await user.updateDataDriver(userId, payload);

      expect(result.err).to.exist;
      sinon.assert.calledWith(commonHelper.log, ['ERROR'], sinon.match.string);
      query.prototype.findOneUser.restore();
    });

    it('should return error if user is not driver', async () => {
      sandbox.stub(query.prototype, 'findOneUser').resolves({ data: { isMitra: false } });

      const result = await user.updateDataDriver(userId, payload);

      expect(result.err).to.exist;
      sinon.assert.calledWith(commonHelper.log, ['ERROR'], sinon.match.string);
      query.prototype.findOneUser.restore();
    });

    it('should return error if update is within 1 month', async () => {
      const recentUpdate = moment().subtract(15, 'days').toDate();
      sandbox.stub(query.prototype, 'findOneUser').resolves({ 
        data: {
          mitra: true,
          isMitra: true,
          userId,
          updated: recentUpdate
        }
      });

      const result = await user.updateDataDriver(userId, payload);

      expect(result.err).to.exist;
      sinon.assert.calledWith(commonHelper.log, ['ERROR'], sinon.match.string);
      query.prototype.findOneUser.restore();
    });

    it('should return error if upsertOneUser fails', async () => {
      sandbox.stub(query.prototype, 'findOneUser').resolves({ 
        data: {
          mitra: true,
          isMitra: true,
          userId,
          updated: moment().subtract(2, 'months').toDate()
        }
      });
      sandbox.stub(command.prototype, 'upsertOneUser').resolves({ err: 'fail' });

      const result = await user.updateDataDriver(userId, payload);

      expect(result.err).to.exist;
      sinon.assert.calledWith(commonHelper.log, ['ERROR'], sinon.match.string);
      query.prototype.findOneUser.restore();
      command.prototype.upsertOneUser.restore();
    });

    it('should return error if upsertInfoDriver fails', async () => {
      sandbox.stub(query.prototype, 'findOneUser').resolves({ 
        data: {
          mitra: true,
          isMitra: true,
          userId,
          updated: moment().subtract(2, 'months').toDate()
        }
      });
      sandbox.stub(command.prototype, 'upsertOneUser').resolves({ err: null });
      sandbox.stub(command.prototype, 'upsertInfoDriver').resolves({ err: 'Failed to upsert' });

      const result = await user.updateDataDriver(userId, payload);

      expect(result.err).to.exist;
      sinon.assert.calledWith(commonHelper.log, ['ERROR'], sinon.match.string);
      query.prototype.findOneUser.restore();
      command.prototype.upsertOneUser.restore();
      command.prototype.upsertInfoDriver.restore();
    });

    it('should return error if insertOneWallet fails', async () => {
      sandbox.stub(query.prototype, 'findOneUser').resolves({ 
        data: {
          mitra: true,
          isMitra: true,
          userId,
          updated: moment().subtract(2, 'months').toDate()
        }
      });
      sandbox.stub(command.prototype, 'upsertOneUser').resolves({ err: null });
      sandbox.stub(command.prototype, 'upsertInfoDriver').resolves({ err: null });
      sandbox.stub(command.prototype, 'insertOneWallet').resolves({ err: 'Failed to create wallet' });

      const result = await user.updateDataDriver(userId, payload);

      expect(result.err).to.exist;
      sinon.assert.calledWith(commonHelper.log, ['ERROR'], sinon.match.string);
      query.prototype.findOneUser.restore();
      command.prototype.upsertOneUser.restore();
      command.prototype.upsertInfoDriver.restore();
      command.prototype.insertOneWallet.restore();
    });

    it('should successfully update driver data', async () => {
      sandbox.stub(query.prototype, 'findOneUser').resolves({ 
        data: {
          mitra: true,
          isMitra: true,
          userId,
          updated: moment().subtract(2, 'months').toDate()
        }
      });
      sandbox.stub(command.prototype, 'upsertOneUser').resolves({ err: null });
      sandbox.stub(command.prototype, 'upsertInfoDriver').resolves({ err: null });
      sandbox.stub(command.prototype, 'insertOneWallet').resolves({ err: null });
      commonHelper.Wrapper.data.returns({ data: 'updated', err: null });

      const result = await user.updateDataDriver(userId, payload);

      expect(result).to.deep.equal({ data: 'updated', err: null });
      query.prototype.findOneUser.restore();
      command.prototype.upsertOneUser.restore();
      command.prototype.upsertInfoDriver.restore();
      command.prototype.insertOneWallet.restore();
    });
  });
});