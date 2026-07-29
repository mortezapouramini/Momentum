const responder = require("../../utils/responder");
const taskService = require("./task.service");

const createTask = async (req, res, next) => {
  try {
    const newTask = await taskService.createTaskService(req.body, req.user.sub);
    responder({ res, data: newTask, code: 201, message: "Task created" });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await taskService.deleteTaskService(
      req.params.taskId,
      req.user.sub,
    );
    responder({ res, data: deletedTask, message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const updatedTask = await taskService.updateTaskService({
      taskId: req.params.taskId,
      taskData: req.body,
      userId: req.user.sub,
    });
    responder({ res, data: updatedTask, message: "Task updated" });
  } catch (error) {
    next(error);
  }
};

const getSingleTask = async (req, res, next) => {
  try {
    const task = await taskService.getSingleTaskService(
      req.params.taskId,
      req.user.sub,
    );
    responder({ res, data: task, message: "Task Recived" });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksService(req.user.sub, req.query);
    responder({ res, data: tasks, message: "Tasks recived" });
  } catch (error) {
    next(error);
  }
};

const addCategoryToTask = async (req, res, next) => {
  try {
    const result = await taskService.addCategoryToTaskService({
      taskId: req.params.taskId,
      categoryId: req.params.categoryId,
      userId: req.user.sub,
    });
    responder({ res, data: result, message: "Category added" });
  } catch (error) {
    next(error);
  }
};
const deleteCategoryFromTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteCategoryFromTaskService({
      taskId: req.params.taskId,
      categoryId: req.params.categoryId,
      userId: req.user.sub,
    });
    responder({ res, data: result, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  deleteTask,
  updateTask,
  getSingleTask,
  getTasks,
  addCategoryToTask,
  deleteCategoryFromTask,
};
