const {
  insertTask,
  deleteTaskById,
  updateTaskById,
  getTaskById,
  getTasksByUserId,
  getTasksByFilters,
} = require("./task.repository");
const appError = require("../../utils/error.util");

const createTaskService = async (taskData, userId) => {
  const insertData = {
    userId,
    title: taskData.title,
    description: taskData.description ?? null,
    priority: taskData.priority || "low",
    status: taskData.status || "pending",
    dueDate: taskData.dueDate,
  };

  const task = await insertTask(insertData);

  return task;
};

const deleteTaskService = async (taskId, userId) => {
  const task = await deleteTaskById(taskId, userId);
  if (!task) {
    throw appError(404, "Task not found");
  }
  return task;
};

const updateTaskService = async (taskId, taskData, userId) => {
  const UPDATABLE_FIELDS = {
    title: "title",
    description: "description",
    status: "status",
    priority: "priority",
    dueDate: "due_date",
  };

  if (Object.keys(taskData).length === 0) {
    throw appError(400, "No fields to update");
  }

  const task = await updateTaskById(taskData, UPDATABLE_FIELDS, taskId, userId);
  if (!task) {
    throw appError(404, "Task not found");
  }
  return task;
};

const getSingleTaskService = async (taskId, userId) => {
  const task = await getTaskById(taskId, userId);
  if (!task) {
    throw appError(404, "Task not found");
  }
  return task;
};

const getTasksService = async (userId, filters) => {
  if(Object.keys(filters).length === 0){
    return await getTasksByUserId(userId)
  }
  return await getTasksByFilters(userId, filters);
};


module.exports = {
  createTaskService,
  deleteTaskService,
  updateTaskService,
  getSingleTaskService,
  getTasksService
};
