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
  logger.info({ email: job.data.email, jobId: job.id }, "Email sent");
});

worker.on("failed", async (job, err) => {
  const { email, uuid } = job.data;
  logger.error({ err, email, jobId: job.id }, "Email not sent");
  try {
    await redis.del(`pending:${uuid}`, `pending:email:${email}`);
  } catch (error) {
    logger.error(
      { err: error, uuid, email },
      "Error deleting cached email and uuid",
    );
  }
});
logger.info("Connected to worker");
