const { pool } = require("../config/db-config");

const insertTask = async (taskData) => {
  const query = `
    INSERT INTO tasks 
    (user_id, title, description, priority, status, due_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  return (
    await pool.query(query, [
      taskData.userId,
      taskData.title,
      taskData.description,
      taskData.priority,
      taskData.status,
      taskData.dueDate,
    ])
  ).rows[0];
};

const deleteTaskById = async (taskId, userId) => {
  const query = `
    DELETE FROM tasks 
    WHERE id = $1 AND user_id = $2
    RETURNING*
  `;
  return (await pool.query(query, [taskId, userId])).rows[0];
};

const updateTaskById = async (fields, values, taskId, userId) => {
  fields.push(`updated_at = $${index++}`);
  values.push(new Date());
  const query = `
    UPDATE tasks 
    SET ${fields.join(", ")}
    WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2}
    RETURNING *
  `;
  return (await pool.query(query, [...values, taskId, userId])).rows[0];
};

const getTaskById = async (taskId, userId) => {
  const query = `
    SELECT * FROM tasks WHERE id = $1 AND user_id = $2
`;
  return (await pool.query(query, [taskId, userId])).rows[0];
};

module.exports = {
  insertTask,
  deleteTaskById,
  updateTaskById,
  getTaskById
};
