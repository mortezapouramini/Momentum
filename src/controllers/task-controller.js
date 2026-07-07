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

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTaskService(req.params.id, req.user);
    responder(res, null, null, 200, "Task deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, deleteTask };
