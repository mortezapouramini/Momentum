/** Requirements */
const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const taskController = require("./task.controller");
const { validate } = require("../../middlewares/validator.middleware");
const {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  idParamSchema,
} = require("../tasks/task.schema");

router
  .post(
    "/",
    authMiddleware.authAccessToken,
    validate(createTaskSchema, "body"),
    taskController.createTask,
  )
  .delete(
    "/:id",
    authMiddleware.authAccessToken,
    validate(idParamSchema, "params"),
    taskController.deleteTask,
  )
  .patch(
    "/:id",
    authMiddleware.authAccessToken,
    validate(idParamSchema, "params"),
    validate(updateTaskSchema, "body"),
    taskController.updateTask,
  )
  .get(
    "/:id",
    authMiddleware.authAccessToken,
    validate(idParamSchema, "params"),
    taskController.getSingleTask,
  )
  .get(
    "/",
    authMiddleware.authAccessToken,
    validate(taskQuerySchema, "query"),
    taskController.getTasks,
  );

module.exports = router;
