const {
  insertTask,
  deleteTaskById,
  updateTaskById,
  getTaskById,
} = require("../repository/task-repository");
const appError = require("../utils/error-util");

const createTaskService = async (taskData, userId) => {
  const insertData = {
    userId,
    title: taskData.title,
    description: taskData.description ?? null,
    priority: taskData.priority || "low",
    status: taskData.status || "pending",
    dueDate: taskData.dueDate || null,
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

  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, column] of Object.entries(UPDATABLE_FIELDS)) {
    if (taskData[key] !== undefined) {
      fields.push(`${column} = $${index++}`);
      values.push(taskData[key]);
    }
  }
  if (fields.length === 0) {
    throw appError(400, "No fields to update");
  }

  const task = await updateTaskById(fields, values, taskId, userId);
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

module.exports = {
  createTaskService,
  deleteTaskService,
  updateTaskService,
  getSingleTaskService,
};
