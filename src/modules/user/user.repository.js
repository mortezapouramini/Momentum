const { pool } = require("../../config/db.config");


const getUserById = async (userId) => {
  const query = `SELECT * FROM users WHERE id = $1`;
  const user = (await pool.query(query, [userId])).rows[0];
  return user;
};

const updatableFields = {
  userName: "user_name",
  password: "password_hash",
};

const findUserByUserName = async (userName) => {
  const query = `SELECT * FROM users WHERE user_name = $1`;
  return (await pool.query(query, [userName])).rows[0];
};

const updateUserById = async (userId, userData) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, column] of Object.entries(updatableFields)) {
    if (userData[key] !== undefined) {
      fields.push(` ${column} = $${index++}`);
      values.push(userData[key]);
    }
  }
  const updatedFields = [...fields, `updated_at = $${index++}`];
  const updatedValues = [...values, new Date()];
  const query = `
    UPDATE users
    SET ${updatedFields.join(", ")}
    WHERE id = $${index}
    RETURNING*
  `;
  const user = (await pool.query(query, [...updatedValues , userId])).rows[0];
  delete user?.password_hash;
  return user;
};

module.exports = { getUserById, updateUserById , findUserByUserName };
