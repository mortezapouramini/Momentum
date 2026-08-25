const request = require("supertest");
const app = require("../../app");
const {
  resetDatabase,
  resetRedis,
  closeConnections,
} = require("../helpers/db");
const { redis } = require("../../src/config/redis.config");
const { pool } = require("../../src/config/db.config");

beforeEach(async () => {
  await resetDatabase();
  await resetRedis();
});

afterAll(async () => {
  await closeConnections();
});

describe("POST /api/v1/auth/register", () => {
  it("should register a new pending user and set a uuid cookie", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      userName: "testuser",
      email: "test@test.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers["set-cookie"][0]).toMatch(/^uuid=/);
  });

  it("should reject registration with missing fields", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "test@test.com" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

describe("POST api/v1/auth/verify-email", () => {
  it("should save a new user into database with fields that saved in redis", async () => {
    const agent = request.agent(app);

    const registerResponse = await agent.post("/api/v1/auth/register").send({
      userName: "testuser",
      email: "test@test.com",
      password: "password123",
    });

    expect(registerResponse.status).toBe(200);

    const setCookieHeader = registerResponse.headers["set-cookie"][0];
    const uuid = setCookieHeader.split("uuid=")[1].split(";")[0];

    const pendingUser = await redis.hgetall(`pending:${uuid}`);
    const verifyCode = pendingUser.verifyCode;

    const response = await agent
      .post("/api/v1/auth/verify-email")
      .set("User-Agent", "jest-integration-test")
      .send({ verifyCode });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.headers["authorization"].split(" ")[0]).toMatch(/^bearer/);

    const dbResult = await pool.query("SELECT * FROM users WHERE email = $1", [
      "test@test.com",
    ]);
    expect(dbResult.rows).toHaveLength(1);
    expect(dbResult.rows[0].user_name).toBe("testuser");
  });

  it("should reject when no pending user registeration exists", async () => {
    const response = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ verifyCode: 123456 });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should reject when verifyCode is missing", async () => {
    const agent = request.agent(app);

    const registerResponse = await agent.post("/api/v1/auth/register").send({
      userName: "testuser",
      email: "test@test.com",
      password: "password123",
    });

    expect(registerResponse.status).toBe(200);

    const setCookieHeader = registerResponse.headers["set-cookie"][0];
    const uuid = setCookieHeader.split("uuid=")[1].split(";")[0];

    const pendingUser = await redis.hgetall(`pending:${uuid}`);
    const validVerifyCode = pendingUser.verifyCode;

    const invalidVerifyCode = 123456 === validVerifyCode ? 987654 : 123456;

    const response = await agent
      .post("/api/v1/auth/verify-email")
      .set("User-Agent", "jest-integration-test")
      .send({ verifyCode: invalidVerifyCode });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("shoule reject with status code 429 when user attempts more than 3 ", async () => {
    const agent = request.agent(app);

    const registerResponse = await agent.post("/api/v1/auth/register").send({
      userName: "testuser",
      email: "test@test.com",
      password: "password123",
    });

    expect(registerResponse.status).toBe(200);

    const setCookieHeader = registerResponse.headers["set-cookie"][0];
    const uuid = setCookieHeader.split("uuid=")[1].split(";")[0];

    const pendingUser = await redis.hgetall(`pending:${uuid}`);
    const validVerifyCode = pendingUser.verifyCode;

    const invalidVerifyCode = 123456 === validVerifyCode ? 987654 : 123456;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await agent
        .post("/api/v1/auth/verify-email")
        .send({ verifyCode: invalidVerifyCode });
      expect(response.status).toBe(400);
    }

    const finalResponse = await agent
      .post("/api/v1/auth/verify-email")
      .send({ verifyCode: invalidVerifyCode });
    expect(finalResponse.status).toBe(429);

    const pendingAfter = await redis.hgetall(`pending:${uuid}`);
    expect(pendingAfter).toEqual({});
  });
});
