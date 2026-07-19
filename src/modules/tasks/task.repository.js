const { pool } = require("../../config/db.config");

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

const updateTaskById = async (taskData, updatableFields, taskId, userId) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, column] of Object.entries(updatableFields)) {
    if (taskData[key] !== undefined) {
      fields.push(`${column} = $${index++}`);
      values.push(taskData[key]);
    }
  }
  const updatedFields = [...fields, `updated_at = $${fields.length + 1}`];
  const updatedValues = [...values, new Date()];

  const query = `
      UPDATE tasks 
      SET ${updatedFields.join(", ")}
      WHERE id = $${updatedFields.length + 1} AND user_id = $${updatedFields.length + 2}
      RETURNING *
    `;
  return (await pool.query(query, [...updatedValues, taskId, userId])).rows[0];
};

const getTaskById = async (taskId, userId) => {
  const query = `
    SELECT * FROM tasks WHERE id = $1 AND user_id = $2
`;
  return (await pool.query(query, [taskId, userId])).rows[0];
};

const ALLOWED_FILTERS = {
  status: { column: "status", operator: "=" },
  priority: { column: "priority", operator: "=" },
  q: { column: "title", operator: "ILIKE", transform: (v) => `%${v}%` },
  minDueDate: { column: "due_date", operator: ">=" },
  maxDueDate: { column: "due_date", operator: "<=" },
};

const getTasksByFilters = async (userId, filters) => {
  const conditions = [`user_id = $1`];
  const values = [userId];
  let index = 2;

  for (const [key, config] of Object.entries(ALLOWED_FILTERS)) {
    if (filters[key] !== undefined) {
      conditions.push(`${config.column} ${config.operator} $${index++}`);
      values.push(
        config.transform ? config.transform(filters[key]) : filters[key],
      );
    }
  }

  const query = `
    SELECT * FROM tasks
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC
  `;

  return (await pool.query(query, values)).rows;
};

const getTasksByUserId = async (userId) => {
  const query = `
  SELECT * FROM tasks
  WHERE user_id = $1
  ORDER BY created_at DESC
`;

return (await pool.query(query, [userId])).rows;
}

module.exports = {
  insertTask,
  deleteTaskById,
  updateTaskById,
  getTaskById,
  getTasksByFilters,
  getTasksByUserId
};
