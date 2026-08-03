/** Requirements */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { Worker } = require("bullmq");
const { redis } = require("../config/redis.config");
const { sendMail } = require("../config/email.config");
const { logger } = require("../config/logger.config");

/** Email Worker */
const worker = new Worker(
  "email-queue",
  async (job) => {
    const { email, verifyCode } = job.data;
    await sendMail({
      to: email,
      subject: "Verification code",
      text: `Your verification code : \n ${verifyCode}`,
    });
  },
  {
    connection: redis,
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
  },
);

/** Worker Events */
worker.on("completed", (job) => {
  logger.info(`Email has been sent to ${job.data.email}`);
});

worker.on("failed", async (job, err) => {
  logger.error({ err }, `Email not send to ${job.data.email}`);
  const { email, uuid } = job.data;
  await redis.del(`pending:${uuid}`, `pending:email:${email}`);
});
logger.info("Connected to worker");
