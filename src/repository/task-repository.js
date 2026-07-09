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


module.exports = {
    insertTask
}