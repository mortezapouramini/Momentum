const responder = require("../utils/responder");
const taskService = require("../services/task-service");
const createTask = async (req, res, next) => {
  try {
    const newTask = await taskService.createTaskService(req.body, req.user);
    responder(res, newTask, null, 201, "Task created");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
};
