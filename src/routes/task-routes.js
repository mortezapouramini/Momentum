/** Requirements */
const router = require("express").Router();
const authMiddleware = require("../middlewares/auth-middleware");
const taskController = require("../controllers/task-controller");

router.post("/", authMiddleware.authAccessToken, taskController.createTask);


module.exports = router