const responder = require("../../utils/responder");
const taskService = require("./task.service");

const createTask = async (req, res, next) => {
  try {
    const newTask = await taskService.createTaskService(req.body, req.user.sub);
    responder(res, newTask, null, 201, "Task created");
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await taskService.deleteTaskService(
      req.params.id,
      req.user.sub,
    );
    responder(res, deletedTask, null, 200, "Task deleted");
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const updatedTask = await taskService.updateTaskService(
      req.params.id,
      req.body,
      req.user.sub,
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
      req.user.sub,
    );
    responder(res, task, null, 200, "Task Recived");
  } catch (error) {
    next(error);
  }
};


const getTasks = async (req , res , next) => {
  try {
    const tasks = await taskService.getTasksService(req.user.sub , req.query)
    responder(res , tasks , null , 200 , 'Tasks recived')
  } catch (error) {
    next(error)
  }
}


module.exports = { createTask, deleteTask, updateTask, getSingleTask , getTasks };
