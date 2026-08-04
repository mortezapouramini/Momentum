/** Requirements */
require("dotenv").config({ path: ".env.keys" });
require("dotenv").config();

/** App */
const app = require("./app");
const { logger } = require("./src/config/logger.config");

/** Start Server */
const port = process.env.SERVER_PORT || 5000;
app.listen(port, () => {
  logger.info({ port, env: process.env.NODE_ENV }, "Server started");
});
