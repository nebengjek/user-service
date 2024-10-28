
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const AppServer = require('../../src/app/server');

chai.use(chaiHttp);

describe('App', () => {
  let appServer = '';

  beforeEach( (done) => {
    appServer = new AppServer();
    this.server = appServer.server.listen(3000, () => {
      done();
    });
  });

  afterEach( () => {
    this.server.close()
  });

  it('server run', (done) => {
    chai.request(appServer.server)
      .get('/')
      .end((err, res) => {
        expect(res.status).to.equals(200);
        expect(err).to.equals(null);
        done();
      });
  });

});
