const basicAuth = require('../auth/basic_auth_helper');
const jwtAuth = require('../auth/jwt_auth_helper');
const userHandler = require('../modules/user/handlers/api_handler');

module.exports = (server) => {
  server.post('/users/v1/login', basicAuth.isAuthenticated, userHandler.loginUser);
  server.get('/users/v1/profile', jwtAuth.verifyToken, userHandler.getUser);
  server.post('/users/v1/register', basicAuth.isAuthenticated, userHandler.registerUser);
};
