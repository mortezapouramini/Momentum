/** Requirements */
const { pool } = require("../config/db-config");
const appError = require("../utils/error-util");
const crypto = require("crypto");
const { redis } = require("../config/redis-config");
const { emailQueue } = require("../queues/email-queue");
const argon2 = require("argon2");
const { tokenService } = require("./token-service");

/** Register Service */
const registerService = async (data) => {
  let isExist = await pool.query(
    `SELECT * FROM users WHERE email = $1 OR user_name = $2`,
    [data.email, data.userName],
  );
  if (isExist.rowCount > 0) {
    throw appError(409, "invalid informations");
  }

  const existingUUID = await redis.get(`pending:email:${data.email}`);
  if (existingUUID) {
    return existingUUID;
  }

  const password_hash = await argon2.hash(data.password);
  const uuid = crypto.randomUUID();
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

  const userData = {
    email: data.email,
    userName: data.userName,
    password_hash,
    verifyCode,
    attempts: "0",
  };

  const pipeline = redis.pipeline();

  pipeline.hset(`pending:${uuid}`, userData);
  pipeline.expire(`pending:${uuid}`, 5 * 60);

  pipeline.set(`pending:email:${userData.email}`, uuid, "EX", 5 * 60);

  await pipeline.exec();

  await emailQueue.add("send-verification", {
    email: userData.email,
    verifyCode,
    uuid,
  });

  return uuid;
};

/** Verify Email Service */
const verifyEmailService = async (uuid, verifyCode, userAgent, ipAddress) => {
  const pendingUser = await redis.hgetall(`pending:${uuid}`);
  if (Object.keys(pendingUser).length === 0) {
    throw appError(401, "Registeration timeout");
  }

  if (Number(verifyCode) !== Number(pendingUser.verifyCode)) {
    // increment attempts
    if (Number(pendingUser.attempts) >= 3) {
      await redis.del(`pending:${uuid}`);
      await redis.del(`pending:email:${pendingUser.email}`);
      throw appError(401, "Registeration timeout");
    }
    await redis.hincrby(`pending:${uuid}`, "attempts", 1);
    throw appError(401, "invalid verification code");
  }

  const result = await pool.query(
    `INSERT INTO users(user_name , email , password_hash) VALUES( $1 , $2 , $3) RETURNING*`,
    [pendingUser.userName, pendingUser.email, pendingUser.password_hash],
  );
  const user = result.rows[0];
  delete user.password_hash;

  const accessJwt = tokenService.generateAccessJwt(user);
  const { rawToken, sessionId } = await tokenService.createRefreshSession(
    user.id,
    userAgent,
    ipAddress,
  );

  await redis.del(`pending:${uuid}`);
  await redis.del(`pending:email:${pendingUser.email}`);
  return { user, accessJwt, refreshToken: rawToken };
};

/** Log In Service */
const loginService = async (data , userAgent , ipAddress) => {
  let isExist;
  if (data.email) {
    isExist = await pool.query("SELECT * FROM users WHERE email = $1", [
      data.email,
    ]);
  } else if (data.userName) {
    isExist = await pool.query("SELECT * FROM users WHERE user_name = $1", [
      data.userName,
    ]);
  }

  if (isExist.rowCount === 0) {
    throw appError(401, "Invalid information");
  }
  let user = isExist.rows[0];
  const isMatchPassword = await argon2.verify(
    user.password_hash,
    data.password,
  );
  if (!isMatchPassword) {
    throw appError(401, "Invalid information");
  }

  delete user.password_hash;
  const accessJwt = tokenService.generateAccessJwt(user);
  const { rawToken, sessionId } = await tokenService.createRefreshSession(
    user.id,
    userAgent,
    ipAddress,
  );

  return { user, accessJwt, refreshToken: rawToken };
};

module.exports = { registerService, verifyEmailService, loginService };
