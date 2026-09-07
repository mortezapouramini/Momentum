/** Requirements */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorResponder = require("./src/middlewares/error.responder");
const authRoutes = require("./src/modules/auth/auth.routes");
const taskRoutes = require("./src/modules/tasks/task.routes");
const userRoutes = require("./src/modules/user/user.routes");
const categoryRoutes = require("./src/modules/categories/category.routes");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
const { logger } = require("./src/config/logger.config");

/** App */
const app = express();

/** Configs */
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true,
    exposedHeaders: ["authorization"],
  }),
);

/** Health Check */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/** Routes */

/** Routes */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/users", userRoutes);

/** Error Handler */
app.use(errorResponder);

module.exports = app;
