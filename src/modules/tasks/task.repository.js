const { pool } = require("../../config/db.config");

const validateCategoriesExists = async (categoryIds, client, userId) => {
  const check = await client.query(
    `SELECT COUNT(*) FROM categories 
     WHERE id = ANY($1::uuid[]) AND user_id = $2`,
    [categoryIds, userId],
  );
  if (parseInt(check.rows[0].count) !== categoryIds.length) {
    throw new Error("INVALID_CATEGORIES");
  }
  return true;
};

const linkCategoriesToTask = async (categoryIds, client, taskId) => {
  const placeholders = categoryIds.map((_, i) => `($1, $${i + 2})`).join(", ");
  await client.query(
    `INSERT INTO task_categories (task_id, category_id) VALUES ${placeholders}`,
    [taskId, ...categoryIds],
  );
};

const insertTaskRow = async (client, taskData) => {
  return (
    await client.query(
      `INSERT INTO tasks (user_id, title, description, priority, status, due_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        taskData.userId,
        taskData.title,
        taskData.description,
        taskData.priority,
        taskData.status,
        taskData.dueDate,
      ],
    )
  ).rows[0];
};

const insertTask = async (taskData) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const categoryIds = taskData.categoryIds;
    let categoriesExists;
    if (categoryIds.length > 0) {
      categoriesExists = await validateCategoriesExists(
        categoryIds,
        client,
        taskData.userId,
      );
    }

    const task = await insertTaskRow(client, taskData);

    if (categoriesExists) {
      await linkCategoriesToTask(categoryIds, client, task.id);
    }

    await client.query("COMMIT");
    return task;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
};

const insertCategoryToTaskById = async (taskId, categoryId, userId) => {
  const query = `
    INSERT INTO task_categories (task_id, category_id)
    SELECT $1, $2
    FROM tasks t
    JOIN categories c ON c.id = $2
    WHERE t.id = $1 AND t.user_id = $3
    AND c.user_id = $3
    RETURNING *
  `;
  return (await pool.query(query, [taskId, categoryId, userId])).rows[0];
};

const deleteCategoryFromTaskById = async (taskId, categoryId, userId) => {
  const query = `
    DELETE FROM task_categories tc
    USING tasks t, categories c
    WHERE tc.task_id = $1 
    AND tc.category_id = $2
    AND t.id = $1 AND t.user_id = $3
    AND c.id = $2 AND c.user_id = $3
    RETURNING tc.*
  `;
  return (await pool.query(query, [taskId, categoryId, userId])).rows[0];
};

module.exports = {
  insertTask,
  deleteTaskById,
  updateTaskById,
  getTaskById,
  getTasksByFilters,
  getTasksByUserId,
  insertCategoryToTaskById,
  deleteCategoryFromTaskById,
};
