const { pool } = require("../../config/db.config");

const insertCategory = async (data, userId) => {
  const query = `
        INSERT INTO categories(user_id , name , color)
        VALUES ($1 , $2 , $3) RETURNING*
    `;
  return (await pool.query(query, [userId, data.name, data.color])).rows[0];
};

const deleteCategoryById = async (categoryId, userId) => {
  const query = `
        DELETE FROM categories
        WHERE id = $1 AND user_id = $2 RETURNING*
    `;
  return (await pool.query(query, [categoryId, userId])).rows[0];
};

const updateCategoryById = async ({data, categoryId, userId}) => {
  let fields = [];
  let values = [];
  let index = 1;
  if (data.name) {
    fields.push(`name = $${index++}`);
    values.push(data.name);
  }
  if (data.color) {
    fields.push(`color = $${index++}`);
    values.push(data.color);
  }

  const query = `
    UPDATE categories
    SET ${fields.join(", ")}
    WHERE id = $${index++} AND user_id = $${index} RETURNING*
`;
  return (await pool.query(query, [...values, categoryId, userId])).rows[0];
};

const getCategoriesByUserId = async (userId) => {
  const query = `
    SELECT * FROM categories WHERE user_id = $1
`;
  return (await pool.query(query, [userId])).rows;
};

module.exports = {
  insertCategory,
  deleteCategoryById,
  updateCategoryById,
  getCategoriesByUserId,
};
