const request = require("supertest");
const app = require("../../app");
const { resetDatabase, resetRedis, closeConnections } = require("../helpers/db");

beforeEach(async () => {
  await resetDatabase();
  await resetRedis();
});

afterAll(async () => {
  await closeConnections();
});

describe("POST /api/v1/auth/register", () => {
  it("should register a new pending user and set a uuid cookie", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
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