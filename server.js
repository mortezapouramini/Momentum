/** Requirements */
require("dotenv").config({ path: ".env.keys" });
require("dotenv").config();

const validateEnv = require("./src/config/env.validation");
validateEnv();

/** App */
const app = require("./app");
const { pool } = require("./src/config/db.config");
const { redis } = require("./src/config/redis.config");
const { logger } = require("./src/config/logger.config");

/** Start Server */
const port = process.env.SERVER_PORT || 5000;
const server = app.listen(port, () => {
  logger.info({ port, env: process.env.NODE_ENV }, "Server started");
});

/** Graceful Shutdown */
const shutdown = async (signal) => {
  logger.info({ signal }, "Shutting down gracefully");
  server.close(async () => {
    try {
      await pool.end();
      redis.disconnect();
      logger.info("Connections closed, exiting");
      process.exit(0);
    } catch (error) {
      logger.error({ error }, "Error during shutdown");
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));