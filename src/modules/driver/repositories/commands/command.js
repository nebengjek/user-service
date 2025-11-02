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
      document.mitra,
      document.verify,
      document.completed
    ];

    return this.db.preparedQuery(sql, params);
  }

  async upsertOneUser(params, document){
    // build WHERE clause and value
    let whereKey = 'user_id';
    let whereValue = params;
    if (typeof params === 'object' && params !== null) {
      // prefer explicit user_id if present
      if (params.userId) {
        whereKey = 'user_id';
        whereValue = params.userId;
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
    const result = await this.db.preparedQuery(sql, values);
    return result;
  }

  async upsertInfoDriver(document){
    // find if exist
    const findQuery = `SELECT driver_id FROM info_driver WHERE driver_id = ? LIMIT 1`;
    const findResult = await this.db.preparedQuery(findQuery, [document.userId]);
    if (!findResult.err && findResult.data.length > 0){
      // update
      const updateSql = `UPDATE info_driver SET city = ?, province = ?, jenis_kendaraan = ?, nopol = ?, kontak_keluarga_lainnya = ?, updated_at = ? WHERE driver_id = ?`;
      const now = new Date();
      const mysqlTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');
      const updateParams = [
        document.city || null,
        document.province || null,
        document.jenisKendaraan || null,
        document.nopol || null,
        document.kontakKeluargaLainnya || null,
        mysqlTimestamp,
        document.userId
      ];
      const updateResult = await this.db.preparedQuery(updateSql, updateParams);
      return updateResult;
    }
    const sql = `INSERT INTO info_driver (driver_id, city, province, jenis_kendaraan, nopol,kontak_keluarga_lainnya, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const now = new Date();
    const mysqlTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');

    const params = [
      document.userId,
      document.city || null,
      document.province || null,
      document.jenisKendaraan || null,
      document.nopol || null,
      document.kontakKeluargaLainnya || null,
      mysqlTimestamp,
      mysqlTimestamp
    ];
    const result = await this.db.preparedQuery(sql, params);
    return result;
  }

  async insertOneWallet(document){
    // check if wallet exist
    const findQuery = `SELECT id FROM wallet WHERE user_id = ? LIMIT 1`;
    const findResult = await this.db.preparedQuery(findQuery, [document.userId]);
    if (!findResult.err && findResult.data.length > 0){
      // wallet exist
      return {data: 'wallet exist',err: null};
    }
    const sql = `INSERT INTO wallet (user_id, balance, last_updated) VALUES (?, ?, ?)`;
    const now = new Date();
    const mysqlTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');

    const params = [
      document.userId,
      document.balance || 0,
      mysqlTimestamp
    ];
    const result = await this.db.preparedQuery(sql, params);
    return result;
  }

}

module.exports = Command;
