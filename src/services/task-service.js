const { pool } = require("../config/db-config");
const appError = require("../utils/error-util");

const createTaskService = async (taskData, userData) => {
  const userId = userData.sub;
  const title = taskData.title;
  const description = taskData.description ?? null;
  const priority = taskData.priority || "low";
  const status = taskData.status || "pending";
  const dueDate = taskData.dueDate || null;

  const query = `
      INSERT INTO tasks 
      (user_id, title, description, priority, status, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

  const result = await pool.query(query, [
    userId,
    title,
    description,
    priority,
    status,
    dueDate,
  ]);

  return result.rows[0];
};

const deleteTaskService = async (taskId, userData) => {
  const userId = userData.sub;

  const checkQuery = `
    SELECT id FROM tasks 
    WHERE id = $1 AND user_id = $2
  `;
  const existing = await pool.query(checkQuery, [taskId, userId]);

  if (existing.rowCount === 0) {
    throw appError(404, "Task not found");
  }

  const deleteQuery = `
    DELETE FROM tasks 
    WHERE id = $1 AND user_id = $2
  `;
  await pool.query(deleteQuery, [taskId, userId]);
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

const getSingleTask = async (taskId, userData) => {
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
  getSingleTask,
};
