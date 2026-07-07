/** Requirements */
const router = require("express").Router();
const authMiddleware = require("../middlewares/auth-middleware");
const taskController = require("../controllers/task-controller");

router
  .post("/", authMiddleware.authAccessToken, taskController.createTask)
  .delete("/:id", authMiddleware.authAccessToken, taskController.deleteTask)
  .patch("/:id", authMiddleware.authAccessToken, taskController.updateTask)
  .get("/:id", authMiddleware.authAccessToken, taskController.getSingleTask);

module.exports = router;
