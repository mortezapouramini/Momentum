/** Requirements */
const router = require("express").Router();
const authMiddleware = require("../middlewares/auth-middleware");
const taskController = require("../controllers/task-controller");
const { validate } = require("../middlewares/validator-middleware");
const {
  createTaskSchema,
  updateTaskSchema,
} = require("../validations/task-validation");

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
  .get("/", authMiddleware.authAccessToken, taskController.getTasks);

module.exports = router;
