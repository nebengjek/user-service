
const commonHelper = require('all-in-one');
const { v4: uuid } = require('uuid');
const Query = require('../queries/query');
const Command = require('./command');

const jwt = require('../../../../auth/jwt_auth_helper');

const wrapper = commonHelper.Wrapper;
const common = require('../../utils/common');

const { NotFoundError, UnauthorizedError, ConflictError } = commonHelper.Error;
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
    const decryptedPassword = await commonHelper.decryptWithIV(user.data[0].password, algorithm, secretKey);
    if (decryptedPassword !== payload.password) {
      commonHelper.log(['ERROR'],'password invalid');
      return wrapper.error(new UnauthorizedError('password invalid!'));
    }

    const accessToken = await jwt.generateToken({sub: user.data[0].userId, metadata: user.data[0]});
    return wrapper.data({
      accessToken
    });
  }

  async registerUser(payload) {
    const ctx = 'domain-registerUser';
    const filterData = common.filterEmailOrMobileNumber(payload.username);
    const user = await this.query.findOneUser(filterData);
    if (user.data) {
      commonHelper.log(['ERROR'],`${ctx} user already exist`);
      return wrapper.error(new ConflictError('user already exist'));
    }
    delete payload.username;

    const encryptedPassword = await commonHelper.encryptWithIV(payload.password, algorithm, secretKey);
    
    const { data: result, err: error } = await this.command.insertOneUser({
      ...filterData,
      ...payload,
      userId: uuid(),
      password: encryptedPassword
    });
    if (error) {
      commonHelper.log(['ERROR'],{ctx, error, message:'failed to register user'});
      return wrapper.error(new Error('failed to register user'));
    }
    return wrapper.data();
  }
}

module.exports = User;
