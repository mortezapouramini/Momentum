/** Requirements */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorResponder = require("./src/middlewares/error.responder");
const authRoutes = require("./src/modules/auth/auth.routes");
const taskRoutes = require("./src/modules/tasks/task.routes");
const commentRoutes = require("./src/modules/comments/comment.routes");
const { object, string } = require("yup");

/** App */
const app = express();

/** Configs */
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    exposedHeaders: ["authorization"],
  }),
);

/** Routes */
app.param("id", async (req, res, next, id) => {
  const idParamSchema = object({
    id: string().uuid("Invalid ID").required("ID is required"),
  });

  try {
    await idParamSchema.validate({ id });
    next();
  } catch {
    next(appError(400, "Invalid ID"));
  }
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/comments", commentRoutes);

/** Error Handler */
app.use(errorResponder);

module.exports = app;
