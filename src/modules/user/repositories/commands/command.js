const { date } = require("joi");

class Command {

  constructor(db) {
    this.db = db;
  }

  async insertOneUser(document){
    const sql = `INSERT INTO users (user_id, full_name, email, mobile_number, password, created_at, isMitra, isVerified, isCompleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const now = new Date();
    const mysqlTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');

    const params = [
      document.userId,
      document.fullName,
      document.email || null,
      document.mobileNumber || null,
      document.password,
      mysqlTimestamp,
      false,
      true,
      true
    ];

    return this.db.preparedQuery(sql, params);
  }

  async upsertOneUser(params, document){
    // build WHERE clause and value
    let whereKey = 'user_id';
    let whereValue = params;
    if (typeof params === 'object' && params !== null) {
      // prefer explicit user_id if present
      if (params.user_id !== undefined) {
        whereKey = 'user_id';
        whereValue = params.user_id;
      } else {
        // use first key in params object
        whereKey = Object.keys(params)[0];
        whereValue = params[whereKey];
      }
    }

    const docKeys = Object.keys(document || {});
    if (docKeys.length === 0) {
      // nothing to update
      return Promise.resolve({ affectedRows: 0 });
    }

    // map input keys to column names (password -> password_hash)
    const columns = docKeys.map(k => (k === 'password' ? 'password' : k));
    // ensure updated_at is set
    const now = new Date();
    const mysqlTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');
    columns.push('updated_at');

    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const values = docKeys.map(k => document[k]);
    values.push(mysqlTimestamp);
    values.push(whereValue);

    const sql = `UPDATE users SET ${setClause} WHERE ${whereKey} = ?`;
    return this.db.preparedQuery(sql, values);
  }

}

module.exports = Command;
