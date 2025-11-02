
const User = require('./domain');
const Mysql = require('../../../../helpers/databases/mysql/db');
const config = require('../../../../infra');

const db = new Mysql(config.get('/mysqlConfig'));
const user = new User(db);

const loginUser = async (payload) => {
  const postCommand = (pyld) => user.generateCredential(pyld);
  return postCommand(payload);
};

const registerUser = async (payload) => {
  const postCommand = (pyld) => user.registerUser(pyld);
  return postCommand(payload);
};

module.exports = {
  loginUser,
  registerUser
};
