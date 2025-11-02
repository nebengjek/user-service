
const User = require('./domain');
const Mysql = require('../../../../helpers/databases/mysql/db');
const config = require('../../../../infra');

const db = new Mysql(config.get('/mysqlConfig'));
const user = new User(db);

const loginDriver = async (payload) => {
  const postCommand = (pyld) => user.generateCredential(pyld);
  return postCommand(payload);
};

const registerDriver = async (payload) => {
  const postCommand = (pyld) => user.registerDriver(pyld);
  return postCommand(payload);
};

const updateDataDriver = async (userId,payload) => {
  const postCommand = (uuid,pyld) => user.updateDataDriver(uuid,pyld);
  return postCommand(userId,payload);
};

module.exports = {
  loginDriver,
  registerDriver,
  updateDataDriver
};
