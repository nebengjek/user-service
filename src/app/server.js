const commonHelper = require('all-in-one');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const correlator = require('express-correlation-id');
const healtCheck = require('./health_check');
const config = require('../infra');
const routes = require('../routes');
const mongoConnectionPooling = require('../helpers/databases/mongodb/connection');

const mongoConfig = config.get('/mongoDbUrl');
class AppServer {

  constructor() {
    this.init();
  }

  async init() {
      this.server = express();
      this.server.use(helmet());
      this.server.use(correlator());
      this.server.use(cors({
        preflightMaxAge: 5,
        origins: ['*'],
        allowHeaders: ['Authorization'],
        exposeHeaders: ['Authorization']
      }));
      this.server.use(commonHelper.initLogger());
      this.server.use(express.json());
      this.server.use(express.urlencoded({ extended: true }));

      this.server.get('/', (req, res, next) => {
        res.status(200).send({ success: true, data: 'server init', message: 'This service is running properly', code: 200 });
        next();
      });

    this.server.get('/service/health', (req, res, next) => {
      healtCheck.checkServiceHealth(this.server);
      res.status(200).send({ success: true, data: 'server init', message: 'This service is running health check', code: 200 });
      next();
    });

    routes(this.server);

    mongoConnectionPooling.init(mongoConfig);
  }
}

module.exports = AppServer;
