
const User = require('./domain');
const Mongo = require('../../../../helpers/databases/mongodb/db');
const config = require('../../../../infra');

const db = new Mongo(config.get('/mongoDbUrl'));
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
