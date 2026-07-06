/** Requirements */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorResponder = require("./src/middlewares/error-responder");
const authRoutes = require('./src/routes/auth-routes')
const taskRoutes = require('./src/routes/task-routes')

/** App */
const app = express();

/** Configs */
app.use(cookieParser());
app.use(express.json());
app.use(cors());

/** Routes */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);

/** Error Handler */
app.use(errorResponder);

module.exports = app;
