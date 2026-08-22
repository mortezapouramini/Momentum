const Redis = require("ioredis");
const { logger } = require("./logger.config");

const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  db: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times >= 5) return null;
    return Math.min(times * 50, 2000);
  },
});

redis.on("connect", () => {
  logger.info("Connected to redis");
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
  if (process.env.NODE_ENV !== "test") {
    process.exit(1);
  }
});

module.exports = { redis };
