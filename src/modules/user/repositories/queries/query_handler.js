
const User = require('./domain');
const Mongo = require('../../../../helpers/databases/mongodb/db');
const config = require('../../../../infra');

const db = new Mongo(config.get('/mongoDbUrl'));
const user = new User(db);

const getUser = async (userId) => {
  const getData = (id) => user.viewUser(id);
  return getData(userId);
};

module.exports = {
  getUser
};
