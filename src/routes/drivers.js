const basicAuth = require('../auth/basic_auth_helper');
const jwtAuth = require('../auth/jwt_auth_helper');
const userHandler = require('../modules/driver/handlers/api_handler');

module.exports = (server) => {
  server.post('/driver/v1/login', basicAuth.isAuthenticated, userHandler.loginDriver);
  server.get('/driver/v1/profile', jwtAuth.verifyToken, userHandler.getDriver);
  server.post('/driver/v1/register', basicAuth.isAuthenticated, userHandler.registerDriver);
};
