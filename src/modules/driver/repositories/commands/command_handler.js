
const User = require('./domain');
const Mongo = require('../../../../helpers/databases/mongodb/db');
const config = require('../../../../infra');

const db = new Mongo(config.get('/mongoDbUrl'));
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
