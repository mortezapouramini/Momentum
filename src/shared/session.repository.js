const { pool } = require("../config/db.config");

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


  module.exports = {createSession}