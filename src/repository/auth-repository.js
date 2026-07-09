const { pool } = require("../config/db-config");

const findUserByEmail = async (userEmail) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  return (await pool.query(query, [userEmail])).rows[0];
};
const findUserByUserName = async (userName) => {
  const query = `SELECT * FROM users WHERE user_name = $1`;
  return (await pool.query(query, [userName])).rows[0];
};

const createUser = async (userName, userEmail, passwordHash) => {
  const query = `
    INSERT INTO users(user_name , email , password_hash)
    VALUES( $1 , $2 , $3)
    RETURNING id, email , user_name , created_at , updated_at , role
    `;
  return (await pool.query(query, [userName, userEmail, passwordHash])).rows[0];
};

const createSession = async (
  tokenHash,
  userId,
  expiresAt,
  userAgent,
  ipAddress,
) => {
  const query = `INSERT INTO refresh_tokens(token_hash , user_id , expires_at, user_agent , ip_address) VALUES($1 , $2 , $3 , $4 , $5)`;
  await pool.query(query, [tokenHash, userId, expiresAt, userAgent, ipAddress]);
};

module.exports = {
  findUserByEmail,
  findUserByUserName,
  createUser,
  createSession,
};
