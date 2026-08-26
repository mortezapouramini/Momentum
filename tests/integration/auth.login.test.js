const {
  resetDatabase,
  resetRedis,
  closeConnections,
} = require("../helpers/db");
const request = require("supertest");

beforeEach(async () => {
  await resetDatabase();
  await resetRedis();
});

afterAll(async () => {
  await closeConnections();
});

const { createVerifiedUser } = require("../helpers/auth");
const app = require("../../app");

const userData = {
  userName: "testuser",
  email: "test@test.com",
  password: "password123",
};

describe("POST /api/v1/auth/login", () => {
  it("should allow a registered user to login with valid credentials", async () => {
    const { agent } = await createVerifiedUser(userData);

    const response = await agent.post("/api/v1/auth/login").send(userData);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers["set-cookie"][0]).toMatch(/^refreshToken=/);
  });
  it("should reject login with invalid password", async () => {
    const { agent } = await createVerifiedUser(userData);

    const response = await agent
      .post("/api/v1/auth/login")
      .send({ ...userData, password: "wrongpassword" });
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should reject when user not found", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "nonexistent@test.com",
      userName: "nonexistentuser",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
