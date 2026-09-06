import {
  UserLoginInfo,
  UserRegisterInfo,
  VerifyUserInfo,
} from "../../types/models";

/** Requirements */
const appError = require("../../utils/error.util");
const crypto = require("crypto");
const argon2 = require("argon2");
const { redis } = require("../../config/redis.config");
const { emailQueue } = require("../../queues/email.queue");
const { tokenService } = require("../../shared/token.service");
const ROUTES = require("../../constants/routes");
const {
  findUserByEmail,
  findUserByUserName,
  createUser,
} = require("./auth.repository");

/** Register Service */
const registerService = async (data: UserRegisterInfo) => {
  const user =
    (await findUserByEmail(data.email)) ||
    (await findUserByUserName(data.userName));

  if (user) {
    throw appError({ code: 409, message: "Registration failed" });
  }

  const existingUUID = await redis.get(`pending:email:${data.email}`);
  if (existingUUID) {
    return existingUUID;
  }

  const passwordHash = await argon2.hash(data.password);
  const uuid = crypto.randomUUID();
  const verifyCode = 100000 + crypto.randomInt(900000);

  const userData = {
    email: data.email,
    userName: data.userName,
    passwordHash,
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
const verifyEmailService = async (data: VerifyUserInfo) => {
  const { uuid, verifyCode, userAgent, ipAddress } = data;
  const pendingUser = await redis.hgetall(`pending:${uuid}`);
  if (Object.keys(pendingUser).length === 0) {
    throw appError({
      code: 404,
      message: "Registeration timeout",
      details: {
        redirect: ROUTES.AUTH.REGISTER,
      },
    });
  }

  if (Number(verifyCode) !== Number(pendingUser.verifyCode)) {
    if (Number(pendingUser.attempts) >= 3) {
      await redis.del(`pending:${uuid}`);
      await redis.del(`pending:email:${pendingUser.email}`);
      throw appError({
        code: 429,
        message: "Too many requests",
        details: {
          redirect: ROUTES.AUTH.REGISTER,
        },
      });
    }
    await redis.hincrby(`pending:${uuid}`, "attempts", 1);
    throw appError({ code: 400, message: "invalid verification code" });
  }

  const user = await createUser({
    userName: pendingUser.userName,
    userEmail: pendingUser.email,
    passwordHash: pendingUser.passwordHash,
  });

  const accessJwt = tokenService.generateAccessJwt(user);
  const { rawToken } = await tokenService.createRefreshSession({
    userId: user.id,
    userAgent,
    ipAddress,
  });

  await redis.del(`pending:${uuid}`);
  await redis.del(`pending:email:${pendingUser.email}`);
  return { user, accessJwt, refreshToken: rawToken };
};

/** Log In Service */
const loginService = async (data: UserLoginInfo) => {
  const { userAgent, ipAddress } = data;
  let user;
  if ("email" in data) {
    user = await findUserByEmail(data.email);
  } else {
    user = await findUserByUserName(data.userName);
  }

  if (!user) {
    throw appError({ code: 401, message: "Invalid credentials" });
  }
  const isMatchPassword = await argon2.verify(
    user.password_hash,
    data.password,
  );
  if (!isMatchPassword) {
    throw appError({ code: 401, message: "Invalid credentials" });
  }

  delete user.password_hash;
  const accessJwt = tokenService.generateAccessJwt(user);
  const { rawToken } = await tokenService.createRefreshSession({
    userId: user.id,
    userAgent,
    ipAddress,
  });

  return { user, accessJwt, refreshToken: rawToken };
};

module.exports = { registerService, verifyEmailService, loginService };
