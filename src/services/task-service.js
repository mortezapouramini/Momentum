const { pool } = require("../config/db-config");
const { insertTask, deleteTaskById } = require("../repository/task-repository");
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

const updateTaskService = async (taskId, taskData, userData) => {
  const userId = userData.sub;

  const checkQuery = `SELECT id FROM tasks WHERE id = $1 AND user_id = $2`;
  const existing = await pool.query(checkQuery, [taskId, userId]);
  if (existing.rowCount === 0) {
    throw appError(404, "Task not found");
  }

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

  fields.push(`updated_at = $${index++}`);
  values.push(new Date());

  const taskIdIndex = index++;
  const userIdIndex = index++;
  values.push(taskId, userId);

  const updateQuery = `
    UPDATE tasks 
    SET ${fields.join(", ")}
    WHERE id = $${taskIdIndex} AND user_id = $${userIdIndex}
    RETURNING *
  `;

  const result = await pool.query(updateQuery, values);
  return result.rows[0];
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
