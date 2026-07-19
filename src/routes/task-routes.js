/** Requirements */
const router = require("express").Router();
const authMiddleware = require("../middlewares/auth-middleware");
const taskController = require("../controllers/task-controller");
const { validate } = require("../middlewares/validator-middleware");
const {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
  taskQuerySchema,
} = require("../validations/task-validation");
const appError = require("../utils/error-util");

router.param("id", async (req, res, next, id) => {
  try {
    validate(taskParamsSchema, "params");
    next();
  } catch (error) {
    next(appError(400, "Invalid task ID"));
  }
});

router
  .post(
    "/",
    authMiddleware.authAccessToken,
    validate(createTaskSchema),
    taskController.createTask,
  )
  .delete("/:id", authMiddleware.authAccessToken, taskController.deleteTask)
  .patch(
    "/:id",
    authMiddleware.authAccessToken,
    validate(updateTaskSchema),
    taskController.updateTask,
  )
  .get("/:id", authMiddleware.authAccessToken, taskController.getSingleTask)
  .get(
    "/",
    authMiddleware.authAccessToken,
    validate(taskQuerySchema, "query"),
    taskController.getTasks,
  );

module.exports = router;
