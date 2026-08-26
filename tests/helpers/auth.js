const request = require("supertest");
const { redis } = require("../../src/config/redis.config");
const app = require("../../app");

const createVerifiedUser = async ({ userName, email, password }) => {
  const agent = request.agent(app);
  const registerResponse = await agent.post("/api/v1/auth/register").send({
    userName,
    email,
    password,
  });

  const setCookieHeader = registerResponse.headers["set-cookie"][0];
  const uuid = setCookieHeader.split("uuid=")[1].split(";")[0];

  const pendingUser = await redis.hgetall(`pending:${uuid}`);
  const verifyCode = pendingUser.verifyCode;

  const verifyResponse = await agent
    .post("/api/v1/auth/verify-email")
    .set("User-Agent", "jest-integration-test")
    .send({ verifyCode });

  return { agent, verifyResponse };
};

module.exports = { createVerifiedUser };
