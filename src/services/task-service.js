const { pool } = require("../config/db-config");

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

module.exports = { createTaskService };
