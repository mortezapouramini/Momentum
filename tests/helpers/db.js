const { pool } = require("../../src/config/db.config");
const { redis } = require("../../src/config/redis.config");

const resetDatabase = async () => {
  await pool.query(`
    TRUNCATE TABLE
      notes,
      task_categories,
      tasks,
      categories,
      refresh_tokens,
      users
    RESTART IDENTITY CASCADE
  `);
};

const resetRedis = async () => {
  await redis.flushdb();
};

const closeConnections = async () => {
  await pool.end();
  redis.disconnect();
};

module.exports = { resetDatabase, resetRedis, closeConnections };