require('dotenv').config();
const confidence = require('confidence');

const config = {
   port: process.env.APP_PORT,
   basicAuthApi:
      {
         username: process.env.BASIC_AUTH_USERNAME,
         password: process.env.BASIC_AUTH_PASSWORD
      }
   ,
   jwt: {
      publicKey: process.env.PUBLIC_KEY_PATH,
      privateKey: process.env.PRIVATE_KEY_PATH,
      signOptions: {
         algorithm: process.env.JWT_SIGNING_ALGORITHM,
         audience: process.env.JWT_AUDIENCE,
         issuer: process.env.JWT_ISSUER,
         expiresIn: process.env.JWT_EXPIRATION_TIME
      },
      verifyOptions: {
         algorithm: process.env.JWT_SIGNING_ALGORITHM,
         audience: process.env.JWT_AUDIENCE,
         issuer: process.env.JWT_ISSUER
      },
      refresh: {
         publicKey: process.env.PUBLIC_KEY_REFRESH_PATH,
         privateKey: process.env.PRIVATE_KEY_REFRESH_PATH,
         signOptions: {
         algorithm: process.env.JWT_SIGNING_ALGORITHM,
         audience: process.env.JWT_AUDIENCE,
         issuer: process.env.JWT_ISSUER,
         expiresIn: process.env.REFRESH_JWT_EXPIRATION_TIME
         },
      },
   },
   mongoDbUrl: process.env.MONGO_DATABASE_URL,
   redis: {
      connection: {
         host: process.env.REDIS_CLIENT_HOST,
         port: process.env.REDIS_CLIENT_PORT,
         password: process.env.REDIS_CLIENT_PASSWORD,
         auth_pass: process.env.REDIS_CLIENT_PASSWORD,
      }
   },
   monitoring: parseInt(process.env.MONITORING) || 0,
   apm: {
      secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
      apiKey: process.env.ELASTIC_APM_API_KEY,
      serverUrl: process.env.ELASTIC_APM_SERVER_URL,
   },
   cipher: {
      algorithm: process.env.CIPHER_ALGORITHM,
      ivLength: parseInt(process.env.CIPHER_IV_LENGTH) || 16,
      key: process.env.CIPHER_KEY
    },
};

const store = new confidence.Store(config);

exports.get = key => store.get(key);
