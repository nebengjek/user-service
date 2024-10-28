
const ObjectId = require('mongodb').ObjectId;

class Query {

  constructor(db) {
    this.db = db;
  }

  async findOneUser(parameter) {
    return this.db.findOne(parameter,'user');
  }

  async findById(id) {
    const parameter = {
      _id: new ObjectId(id)
    };
    return this.db.findOne(parameter,'user');
  }

}

module.exports = Query;
