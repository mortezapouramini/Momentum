const Redis = require("ioredis");

const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  // password: 'yourpassword',
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times >= 5) return null;
    return Math.min(times * 50, 2000);
  },
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
  process.exit(1);
});

module.exports = { redis };
