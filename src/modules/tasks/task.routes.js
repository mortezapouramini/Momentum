/** Requirements */
const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const taskController = require("./task.controller");
const { validate } = require("../../middlewares/validator.middleware");
const noteRoutes = require("../notes/note.routes");
const {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskIdParamSchema,
} = require("../tasks/task.schema");

router
  .post(
    "/",
    authMiddleware.authAccessToken,
    validate(createTaskSchema, "body"),
    taskController.createTask,
  )
  .delete(
    "/:taskId",
    authMiddleware.authAccessToken,
    validate(taskIdParamSchema, "params"),
    taskController.deleteTask,
  )
  .patch(
    "/:taskId",
    authMiddleware.authAccessToken,
    validate(taskIdParamSchema, "params"),
    validate(updateTaskSchema, "body"),
    taskController.updateTask,
  )
  .get(
    "/:taskId",
    authMiddleware.authAccessToken,
    validate(taskIdParamSchema, "params"),
    taskController.getSingleTask,
  )
  .get(
    "/",
    authMiddleware.authAccessToken,
    validate(taskQuerySchema, "query"),
    taskController.getTasks,
  );

router.use(
  "/:taskId/notes",
  authMiddleware.authAccessToken,
  validate(taskIdParamSchema, "params"),
  noteRoutes,
);

module.exports = router;
