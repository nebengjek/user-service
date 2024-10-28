
class Command {

  constructor(db) {
    this.db = db;
  }

  async insertOneUser(document){
    return this.db.insertOne(document,'user');
  }

  async upsertOneUser(params, document){
    return this.db.updateOne(params, document,'user');
  }

}

module.exports = Command;
