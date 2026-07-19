const { Queue } = require("bullmq");
const { redis } = require("../config/redis.config");

const emailQueue = new Queue("email-queue", { connection: redis });

module.exports = { emailQueue };
