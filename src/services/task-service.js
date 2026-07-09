const { pool } = require("../config/db-config");
const {
  insertTask,
  deleteTaskById,
  updateTaskById,
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

  const result = await insertTask(insertData);

  return result;
};

const deleteTaskService = async (taskId, userId) => {
  const result = await deleteTaskById(taskId, userId);
  if (!result) {
    throw appError(404, "Task not found");
  }
  return result;
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

  const result = await updateTaskById(fields, values, userId, taskId);
  if (!result) {
    throw appError(404, "Task not found");
  }
  return result;
};

const getSingleTaskService = async (taskId, userData) => {
  const userId = userData.sub;
  const query = `
      SELECT * FROM tasks WHERE id = $1 AND user_id = $2
  `;
  const result = await pool.query(query, [taskId, userId]);
  if (result.rowCount === 0) {
    throw appError(404, "Task not found");
  }

  return result.rows[0];
};

module.exports = {
  createTaskService,
  deleteTaskService,
  updateTaskService,
  getSingleTaskService,
};
