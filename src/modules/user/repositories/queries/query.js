const wrapper = require('all-in-one/helper/wrapper');

class Query {

  constructor(db) {
    this.db = db;
  }

  async findOneUser(params = {}) {
    const conditions = [];
    const values = [];

    if (params.mobileNumber) {
      conditions.push('mobile_number = ?');
      values.push(params.mobileNumber);
    }

    if (params.email) {
      conditions.push('email = ?');
      values.push(params.email);
    }

    if (params.userId) {
      conditions.push('user_id = ?');
      values.push(params.userId);
    }

    if (conditions.length === 0) {
      return wrapper.error(new Error('No parameters provided to find user'));
    }

    const whereClause = conditions.join(' AND ');
    const query = `
      SELECT mobile_number, email, full_name, user_id, password
      FROM users
      WHERE ${whereClause}
      LIMIT 1;
    `;

    const result = await this.db.preparedQuery(query, values);
    
    return result;
  }

  async findById(id) {
    const query = `
    SELECT user_id, full_name, email, mobile_number
    FROM users
    WHERE user_id = ?
    LIMIT 1;
  `;
    const result = await this.db.preparedQuery(query, [id]);
    return result;
  }

}

module.exports = Query;
