/** Requirements */
const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const taskController = require("./task.controller");
const { validate } = require("../../middlewares/validator.middleware");
const commentRoutes = require("../comments/comment.routes");
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
  "/:taskId/comments",
  authMiddleware.authAccessToken,
  validate(taskIdParamSchema, "params"),
  commentRoutes,
);

module.exports = router;
