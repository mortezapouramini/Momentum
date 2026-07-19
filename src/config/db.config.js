const { Pool } = require("pg");

const pool = new Pool({
  database: process.env.DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
});

pool.on("connect", () => {
  console.log(`Database ${process.env.DATABASE} connected`);
});
pool.on("error", (err) => {
  console.error("PG pool error", err);
  process.exit(1);
});

module.exports = { pool };
