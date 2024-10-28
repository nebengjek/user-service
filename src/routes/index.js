
const users = require('./users');
const drivers = require('./drivers');

module.exports = (server) => {
  users(server);
  drivers(server);
};
