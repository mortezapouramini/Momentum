/** Requirements */
require("dotenv").config({ path: "../../.env" });
const { Worker } = require("bullmq");
const { redis } = require("../config/redis-config");
const { sendMail } = require("../config/email-config");

/** Email Worker */
const worker = new Worker(
  "email-queue",
  async (job) => {
    const { email, verifyCode } = job.data;
    await sendMail(
      email,
      "Verification code",
      `Your verification code : \n ${verifyCode}`,
    );
  },
  {
    connection: redis,
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
  },
);

/** Worker Events */
worker.on("completed", (job) => {
  console.log(`✅ Email has been sent to ${job.data.email}`);
});

worker.on("failed", async (job, err) => {
  console.error("❌ Email send error :");
  console.error(`${err.name} : ${err}`);
  const { email, uuid } = job.data;
  await redis.del(`pending:${uuid}`, `pending:email:${email}`);
});
