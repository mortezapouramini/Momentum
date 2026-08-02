const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { redis } = require("../config/redis.config");
const appError = require("../utils/error.util");

const createStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: `rl:${prefix}:`,
  });

const rateLimitHandler = (req, res, next) => {
  next(
    appError({
      code: 429,
      message: "Too many requests, please try again later",
    }),
  );
};

const loginKeyGenerator = (req) => {
  const identifier = (req.body?.email || req.body?.userName || "unknown")
    .toString()
    .trim()
    .toLowerCase();
  return `${req.ip}:${identifier}`;
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("login"),
  keyGenerator: loginKeyGenerator,
  handler: rateLimitHandler,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("register"),
  handler: rateLimitHandler,
});

const verifyEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("verify-email"),
  handler: rateLimitHandler,
});

const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore("refresh-token"),
  keyGenerator: (req) => req.cookies?.refreshToken || req.ip,
  handler: rateLimitHandler,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  verifyEmailLimiter,
  refreshTokenLimiter,
};
