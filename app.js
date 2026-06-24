/** Requirements */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorResponder = require("./src/middlewares/error-responder");
const userRoutes = require("./src/routes//user-routes");

/** App */
const app = express();

/** Configs */
app.use(cookieParser());
app.use(express.json());
app.use(cors());

/** Routes */
app.use("/api/v1/auth", userRoutes);

/** Error Handler */
app.use(errorResponder);

module.exports = app;
