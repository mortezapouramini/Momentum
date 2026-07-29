/** Requirements */
const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const taskController = require("./task.controller");
const { validate } = require("../../middlewares/validator.middleware");
const noteRoutes = require("../notes/note.routes");
const {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema
} = require("../tasks/task.schema");
const { uuidParamSchema } = require("../../shared/param.schema");

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
    validate(uuidParamSchema("taskId"), "params"),
    taskController.deleteTask,
  )
  .patch(
    "/:taskId",
    authMiddleware.authAccessToken,
    validate(uuidParamSchema("taskId"), "params"),
    validate(updateTaskSchema, "body"),
    taskController.updateTask,
  )
  .get(
    "/:taskId",
    authMiddleware.authAccessToken,
    validate(uuidParamSchema("taskId"), "params"),
    taskController.getSingleTask,
  )
  .get(
    "/",
    authMiddleware.authAccessToken,
    validate(taskQuerySchema, "query"),
    taskController.getTasks,
  )
  .post(
    "/:taskId/categories/:categoryId",
    authMiddleware.authAccessToken,
    validate(uuidParamSchema("taskId"), "params"),
    validate(uuidParamSchema("categoryId"), "params"),
    taskController.addCategoryToTask,
  )
  .delete(
    "/:taskId/categories/:categoryId",
    authMiddleware.authAccessToken,
    validate(uuidParamSchema("taskId"), "params"),
    validate(uuidParamSchema("categoryId"), "params"),
    taskController.deleteCategoryFromTask,
  );

router.use(
  "/:taskId/notes",
  authMiddleware.authAccessToken,
  validate(uuidParamSchema("taskId"), "params"),
  noteRoutes,
);

module.exports = router;
