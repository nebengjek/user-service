
const commonHelper = require('all-in-one');
const moment = require('moment');
const { v4: uuid } = require('uuid');
const Query = require('../queries/query');
const Command = require('./command');

const jwt = require('../../../../auth/jwt_auth_helper');

const wrapper = commonHelper.Wrapper;
const common = require('../../utils/common');

const { NotFoundError, UnauthorizedError, ConflictError, InternalServerError } = commonHelper.Error;
const config = require('../../../../infra');

const algorithm = config.get('/cipher/algorithm');
const secretKey = config.get('/cipher/key');
class User {

  constructor(db){
    this.command = new Command(db);
    this.query = new Query(db);
  }

  async generateCredential(payload) {
    const ctx = 'domain-generateCredentialV2';
    const filterData = common.filterEmailOrMobileNumber(payload.username);
    const user = await this.query.findOneUser(filterData);
    if (user.err) {
      commonHelper.log(['ERROR'],{ctx, error:user.err, message:'user not found'});
      return wrapper.error(new NotFoundError('user not found'));
    }
    
    const decryptedPassword = await commonHelper.decryptWithIV(user.data.password, algorithm, secretKey);
    if (decryptedPassword !== payload.password) {
      commonHelper.log(['ERROR'],'password invalid');
      return wrapper.error(new UnauthorizedError('password invalid!'));
    }

    const accessToken = await jwt.generateToken({sub: user.data.userId, metadata: user.data});
    return wrapper.data({
      accessToken
    });
  }

  async registerDriver(payload) {
    const ctx = 'domain-registerUser';
    const filterData = common.filterEmailOrMobileNumber(payload.username);
    filterData.mitra = true;
    const user = await this.query.findOneUser(filterData);
    if (user.data) {
      commonHelper.log(['ERROR'],`${ctx} user already exist`);
      return wrapper.error(new ConflictError('user already exist'));
    }
    delete payload.username;
    
    const encryptedPassword = await commonHelper.encryptWithIV(payload.password, algorithm, secretKey);
    const { data: result } = await this.command.insertOneUser({
      ...filterData,
      ...payload,
      userId: uuid(),
      password: encryptedPassword,
      mitra: true,
      verify: true,
      completed: false
    });

    delete result.password;
    delete result.isConfirmed;    
    return wrapper.data(result);
  }
  
  async updateDataDriver(userId,payload) {
    const ctx = 'domain-updateDataDriver';
    const user = await this.query.findOneUser({userId});
    if (!user.data) {
      commonHelper.log(['ERROR'],`${ctx} user notexist`);
      return wrapper.error(new NotFoundError('user notfound'));
    }
    if(!user.data.mitra){
      commonHelper.log(['ERROR'],`${ctx} user not driver`);
      return wrapper.error(new ConflictError('user not driver'));
    }
    if (user.data.updated && moment().diff(moment(user.data.updated), 'months') < 1) {
      commonHelper.log(['ERROR'],`${ctx} user eligible to update`);
      return wrapper.error(new ConflictError('update lebih dari 1 x dalam 1 bulan'));
    }


    user.data.email = payload.email;
    user.data.mobileNumber = payload.mobileNumber;
    user.data.completed = true;
    
    delete user.data._id;
    delete payload.email;
    delete payload.mobileNumber;
    const result = await this.command.upsertOneUser({userId},{
      ...user.data,
      ...payload,
      updated: moment().toDate()
    });
    if (result.err){
      commonHelper.log(['ERROR'],`${ctx} failed update data`);
      return wrapper.error(new InternalServerError('failed update data'));
    }
    
    // create wallet
    const CreateWallet = await this.command.insertOneWallet({
      userId,
      balance: 0,
      lastUpdated:moment().toDate(),
      transactionLog: []
    });
    if (CreateWallet.err){
      commonHelper.log(['ERROR'],`${ctx} failed create wallet data`);
      return wrapper.error(new InternalServerError('failed create wallet data'));
    }

    return wrapper.data('updated');
  }
}

module.exports = User;
