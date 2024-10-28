
const { MongoClient } = require('mongodb');
const sinon = require('sinon');

const {init} = require('../../../../../src/helpers/databases/mongodb/connection');
const config = require('../../../../../src/infra');

describe('Mongo Connection', () => {
  const mongoDbUrl = 'mongodb://localhost:27017/domain';

  it('should fail connection', () => {
    sinon.stub(config, 'get').returns(mongoDbUrl);
    const client = new MongoClient(mongoDbUrl);
    const mongoStub = sinon.stub(client, 'connect').resolves();
    init();
    config.get.restore();
    mongoStub.restore();
  });
});
