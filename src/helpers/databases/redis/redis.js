const wrapper = require('../../utils/wrapper');
const pool = require('./connection');
const logger = require('../../utils/logger');

class Redis {

  constructor(config) {
    this.config = config.connection;
    this.index = config.index;
  }

  async selectDb(index) {
    let client = await pool.getConnection(this.config);
    if (!client) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;
    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed to select db on Redis');
    });

    clientRedis.select(index, async (err) => {
      if (err) {
        logger.log('redis-db', `change db to ${index}, : ${err}`, 'redis change db');
        return wrapper.error(err, 'Failed to select db on Redis');
      }
    });
  }

  async setData(key, value) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const convertToString = JSON.stringify({
      data: value
    });
    const clientRedis = client[0].client;
    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed to set data on Redis');
    });
    clientRedis.select(this.index, async (err) => {
      if (err) {
        logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
        return wrapper.error(err, 'Failed to select db on Redis');
      }
      clientRedis.set(key, convertToString);
    });
  }

  async setDataEx(key, value, duration) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const convertToString = JSON.stringify({
      data: value
    });
    const clientRedis = client[0].client;
    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed to set data on Redis');
    });

    clientRedis.select(this.index, async (err) => {
      if (err) {
        logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
        return wrapper.error(err, 'Failed to select db on Redis');
      }
      clientRedis.set(key, convertToString, 'EX', duration);
    });
  }

  async getData(key) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }

    const clientRedis = client[0].client;
    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed Get data From Redis');
    });
    return new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return wrapper.error(err, 'Failed to select db on Redis');
        }
        clientRedis.get(key, (err, replies) => {
          if (err) {
            reject(wrapper.error(err, '', 404));
          }
          resolve(wrapper.data(replies));
        });
      });

    }));
  }

  async getAllKeys(key) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed Get data From Redis');
    });
    return new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return wrapper.error(err, 'Failed to select db on Redis');
        }
        clientRedis.keys(key, (err, replies) => {
          if (err) {
            reject(wrapper.error(err, '', 404));
          }
          resolve(wrapper.data(replies));
        });
      });
    }));
  }

  async deleteKey(key) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed Get data From Redis');
    });
    return new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return wrapper.error(err, 'Failed to select db on Redis');
        }
        clientRedis.del(key, (err, replies) => {
          if (err) {
            reject(wrapper.error(err, '', 404));
          }
          resolve(wrapper.data(replies));
        });
      });
    }));
  }

  async setZeroAttemp(key, duration) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed Get data From Redis');
    });
    return new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return wrapper.error(err, 'Failed to select db on Redis');
        }
        clientRedis.set(key, 0, 'EX', duration, (err, replies) => {
          if (err) {
            reject(wrapper.error(err, '', 404));
          }
          resolve(wrapper.data(replies));
        });
      });
    }));
  }

  async incrAttempt(key) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed Get data From Redis');
    });
    return new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return wrapper.error(err, 'Failed to select db on Redis');
        }
        clientRedis.incr(key, (err, replies) => {
          if (err) {
            reject(wrapper.error(err, '', 404));
          }
          resolve(wrapper.data(replies));
        });
      });
    }));
  }

  async AddToSortedSet(item, value) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed Get data From Redis');
    });
    return new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return wrapper.error(err, 'Failed to select db on Redis');
        }
        clientRedis.zadd(`ZSET:SCHEDULED:ITEMS`, value, item, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
      });
    }));
  }

  async GetTopFromSortedSet() {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed Get data From Redis');
    });
    return new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return wrapper.error(err, 'Failed to select db on Redis');
        }
        clientRedis.zrange(`ZSET:SCHEDULED:ITEMS`, 0, 0, "WITHSCORES", (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
      });
    }));
}

async DeleteItemFromSet(item) {
  let client = await pool.getConnection(this.config);
  if (validate.isEmpty(client)) {
    client = await pool.createConnectionPool(this.config);
  }
  const clientRedis = client[0].client;

  clientRedis.on('error', (err) => {
    return wrapper.error(err, 'Failed Get data From Redis');
  });
  return new Promise(((resolve, reject) => {
    clientRedis.select(this.index, async (err) => {
      if (err) {
        logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
        return wrapper.error(err, 'Failed to select db on Redis');
      }
      clientRedis.zrem(`ZSET:SCHEDULED:ITEMS`, item, (err, result) => {
          if (err) {
              reject(err);
          } else {
              resolve(result);
          }
      });
    });
  }));
}

async AddItemToQueue(key, item) {
  let client = await pool.getConnection(this.config);
  if (validate.isEmpty(client)) {
    client = await pool.createConnectionPool(this.config);
  }

  const clientRedis = client[0].client;
  clientRedis.on('error', (err) => {
    return wrapper.error(err, 'Failed Get data From Redis');
  });
  return new Promise(((resolve, reject) => {
    clientRedis.select(this.index, async (err) => {
      if (err) {
        logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
        return wrapper.error(err, 'Failed to select db on Redis');
      }
      clientRedis.rpush(`QUEUE:${key}`, item, (err, result) => {
          if (err) {
              reject(err);
          } else {
              resolve(result);
          }
      });
    });
  }));
}

async GetItemFromQueue(key, item) {
  let client = await pool.getConnection(this.config);
  if (validate.isEmpty(client)) {
    client = await pool.createConnectionPool(this.config);
  }

  const clientRedis = client[0].client;
  clientRedis.on('error', (err) => {
    return wrapper.error(err, 'Failed Get data From Redis');
  });
  return new Promise(((resolve, reject) => {
    clientRedis.select(this.index, async (err) => {
      if (err) {
        logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
        return wrapper.error(err, 'Failed to select db on Redis');
      }
      clientRedis.lpop(`QUEUE:${key}`, (err, result) => {
          if (err) {
              reject(err);
          } else {
              resolve(result);
          }
      });
    });
  }));
}

async GetItemFromQueueBlocking(key) {
    return new Promise((resolve, reject) => {

        clientRedis.blpop(`QUEUE:${key}`, 5000, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

  async setReminder(key, value, expire, action) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      return wrapper.error(err, 'Failed Get data From Redis');
    });
    return new Promise(((resolve, reject) => {
      clientRedis
        .multi()
        .set(`${action}-${key}`, value)
        .expire(`${action}-${key}`, expire)
        .exec((error, reply) => {
          if (error) {
            reject(error);
          } else {
            resolve(wrapper.data(reply));
          }
        });
    }));
  }
}


module.exports = Redis;
