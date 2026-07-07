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

const updateTask = async (req, res, next) => {
  try {
    const updatedTask = await taskService.updateTaskService(
      req.params.id,
      req.body,
      req.user,
    );
    responder(res, updatedTask, null, 200, "Task updated");
  } catch (error) {
    next(error);
  }
};

const getSingleTask = async (req, res, next) => {
  try {
    const task = await taskService.getSingleTaskService(
      req.params.id,
      req.user,
    );
    responder(res, task, null, 200, "Task updated");
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, deleteTask, updateTask, getSingleTask };
