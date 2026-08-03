const { Pool } = require("pg");
const { logger } = require("./logger.config");

const pool = new Pool({
  database: process.env.DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
});

pool.on("connect", () => {
  logger.info(`Database ${process.env.DATABASE} connected`);
});
pool.on("error", (err) => {
  logger.error({ err }, "PG pool error");
  process.exit(1);
});

module.exports = { pool };
