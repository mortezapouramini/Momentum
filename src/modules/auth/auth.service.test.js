/** Requirements */
const {
  registerService,
  verifyEmailService,
  loginService,
} = require("./auth.service");
const appError = require("../../utils/error.util");
const crypto = require("crypto");
const argon2 = require("argon2");
const { redis } = require("../../config/redis.config");
const { emailQueue } = require("../../queues/email.queue");
const { tokenService } = require("../../shared/token.service");
const {
  findUserByEmail,
  findUserByUserName,
  createUser,
} = require("./auth.repository");
const ROUTES = require("../../constants/routes");

/** Mocking files */
jest.mock("./auth.repository");
jest.mock("argon2");
jest.mock("crypto");
jest.mock("../../config/redis.config", () => ({
  redis: {
    get: jest.fn(),
    pipeline: jest.fn(),
    hgetall: jest.fn(),
    del: jest.fn(),
    hincrby: jest.fn(),
  },
}));
jest.mock("../../shared/token.service", () => ({
  tokenService: {
    generateAccessJwt: jest.fn(),
    createRefreshSession: jest.fn(),
  },
}));
jest.mock("../../queues/email.queue", () => ({
  emailQueue: { add: jest.fn() },
}));

/** Tests */

beforeEach(() => {
  jest.resetAllMocks();
});

const USER_VALID_DATA = {
  id: "123",
  userName: "user-1",
  email: "test@test.com",
};

describe("registerService", () => {
  it("should rejects when user with email is exists", async () => {
    findUserByEmail.mockResolvedValue(USER_VALID_DATA);
    findUserByUserName.mockResolvedValue(null);

    await expect(registerService(USER_VALID_DATA)).rejects.toMatchObject({
      code: 409,
      message: "Registration failed",
    });
  });
  it("should rejects when user with userName is exists", async () => {
    findUserByUserName.mockResolvedValue(USER_VALID_DATA);
    findUserByEmail.mockResolvedValue(null);

    await expect(registerService(USER_VALID_DATA)).rejects.toMatchObject({
      code: 409,
      message: "Registration failed",
    });
  });

  it("must be return uuid when pending uuid is exists", async () => {
    findUserByUserName.mockResolvedValue(null);
    findUserByEmail.mockResolvedValue(null);

    redis.get.mockResolvedValue("existing-uuid-123");

    const result = await registerService(USER_VALID_DATA);

    expect(result).toBe("existing-uuid-123");
    expect(argon2.hash).not.toHaveBeenCalled();
    expect(crypto.randomUUID).not.toHaveBeenCalled();
    expect(crypto.randomInt).not.toHaveBeenCalled();
    expect(redis.pipeline).not.toHaveBeenCalled();
    expect(emailQueue.add).not.toHaveBeenCalled();
  });

  it("creates a new pending registration and returns a uuid", async () => {
    findUserByEmail.mockResolvedValue(null);
    findUserByUserName.mockResolvedValue(null);
    redis.get.mockResolvedValue(null);
    argon2.hash.mockResolvedValue("hashed-password");
    crypto.randomUUID.mockReturnValue("new-uuid-456");
    crypto.randomInt.mockReturnValue(123456);

    const mockPipeline = {
      hset: jest.fn(),
      expire: jest.fn(),
      set: jest.fn(),
      exec: jest.fn().mockResolvedValue(true),
    };
    redis.pipeline.mockReturnValue(mockPipeline);

    const result = await registerService(USER_VALID_DATA);

    expect(result).toBe("new-uuid-456");

    expect(redis.get).toHaveBeenCalledWith("pending:email:test@test.com");

    expect(mockPipeline.hset).toHaveBeenCalledWith("pending:new-uuid-456", {
      email: USER_VALID_DATA.email,
      userName: USER_VALID_DATA.userName,
      passwordHash: "hashed-password",
      verifyCode: 223456,
      attempts: "0",
    });

    expect(mockPipeline.expire).toHaveBeenCalledWith(
      "pending:new-uuid-456",
      300,
    );
    expect(mockPipeline.set).toHaveBeenCalledWith(
      "pending:email:test@test.com",
      "new-uuid-456",
      "EX",
      300,
    );

    expect(emailQueue.add).toHaveBeenCalledWith("send-verification", {
      email: "test@test.com",
      verifyCode: 223456,
      uuid: "new-uuid-456",
    });
  });
});

const VALID_VERIFY_EMAIL_DATA = {
  uuid: "uuid-1",
  verifyCode: "246810",
  userAgent: "test-agent",
  ipAddress: "test-ip-123",
};

describe("verifyEmailService", () => {
  it("should reject when pending user not found , or registeration timeout", async () => {
    redis.hgetall.mockResolvedValue({});

    await expect(
      verifyEmailService(VALID_VERIFY_EMAIL_DATA),
    ).rejects.toMatchObject({
      code: 404,
      message: "Registeration timeout",
      details: {
        redirect: ROUTES.AUTH.REGISTER,
      },
    });
  });

  it("should reject when verify code it incorrect and attempts are more than 3", async () => {
    const pendingUserData = {
      email: "test@test.com",
      userName: "user-1",
      passwordHash: "hashed-password",
      verifyCode: 223456,
      attempts: "3",
    };
    redis.hgetall.mockResolvedValue(pendingUserData);

    await expect(
      verifyEmailService(VALID_VERIFY_EMAIL_DATA),
    ).rejects.toMatchObject({
      code: 429,
      message: "Too many requests",
      details: {
        redirect: ROUTES.AUTH.REGISTER,
      },
    });
    expect(redis.del).toHaveBeenCalledWith(`pending:uuid-1`);
    expect(redis.del).toHaveBeenCalledWith("pending:email:test@test.com");
  });
  it("should reject when verify code it incorrect and attempts are less than 3", async () => {
    const pendingUserData = {
      email: "test@test.com",
      userName: "user-1",
      passwordHash: "hashed-password",
      verifyCode: 223456,
      attempts: "1",
    };
    redis.hgetall.mockResolvedValue(pendingUserData);

    await expect(
      verifyEmailService(VALID_VERIFY_EMAIL_DATA),
    ).rejects.toMatchObject({
      code: 400,
      message: "invalid verification code",
    });
    expect(redis.hincrby).toHaveBeenCalledWith(
      `pending:${VALID_VERIFY_EMAIL_DATA.uuid}`,
      "attempts",
      1,
    );
  });

  it("should accept when pending user found and verify code is correct", async () => {
    const pendingUserData = {
      email: "test@test.com",
      userName: "user-1",
      passwordHash: "hashed-password",
      verifyCode: 246810,
      attempts: "1",
    };
    redis.hgetall.mockResolvedValue(pendingUserData);
    const newUserData = {
      id: "id-123",
      email: "test@test.com",
      user_name: "user-1",
      created_at: "2025",
      updated_at: "2026",
      role: "user",
    };
    createUser.mockResolvedValue(newUserData);

    tokenService.generateAccessJwt.mockReturnValue("accessJwt");
    tokenService.createRefreshSession.mockResolvedValue({
      rawToken: "rawToken",
    });

    const result = await verifyEmailService(VALID_VERIFY_EMAIL_DATA);

    expect(redis.del).toHaveBeenCalledWith(`pending:uuid-1`);
    expect(redis.del).toHaveBeenCalledWith("pending:email:test@test.com");

    expect(result).toMatchObject({
      user: newUserData,
      accessJwt: "accessJwt",
      refreshToken: "rawToken",
    });
  });
});

describe("loginService", () => {
  it("should reject when user not found", async () => {
    findUserByEmail.mockResolvedValue(null);
    findUserByEmail.mockResolvedValue(null);

    await expect(
      loginService({
        email: "test@test.com", password: "password-123",
        userAgent: "user-agent",
        ipAddress: "ip-123",
      }),
    ).rejects.toMatchObject({ code: 401, message: "Invalid credentials" });

    expect(argon2.verify).not.toHaveBeenCalled();
    expect(tokenService.generateAccessJwt).not.toHaveBeenCalled();
    expect(tokenService.createRefreshSession).not.toHaveBeenCalled();
  });
  it("should login when user found", async () => {
    const userData = {
      id: "123",
      user_name: "user-1",
      email: "test@test.com",
      password_hash: "password-hash",
    };
    findUserByEmail.mockResolvedValue(userData);

    argon2.verify.mockResolvedValue(true);
    tokenService.generateAccessJwt.mockReturnValue("accessJwt");
    tokenService.createRefreshSession.mockResolvedValue({
      rawToken: "rawToken",
    });

    const result = await loginService({
      email: "test@test.com", password: "password-123" ,
      userAgent: "user-agent",
      ipAddress: "ip-123",
    });

    expect(result).toMatchObject({
      user: ({ id: user_name, email } = userData),
      accessJwt: "accessJwt",
      refreshToken: "rawToken",
    });
  });
  it("should reject when password is incorrect", async () => {
    const userData = {
      id: "123",
      user_name: "user-1",
      email: "test@test.com",
      password_hash: "password-hash",
    };
    findUserByEmail.mockResolvedValue(userData);
    argon2.verify.mockResolvedValue(false);
    await expect(
      loginService({
        email: "test@test.com", password: "password-123",
        userAgent: "user-agent",
        ipAddress: "ip-123",
      }),
    ).rejects.toMatchObject({ code: 401, message: "Invalid credentials" });

    expect(tokenService.generateAccessJwt).not.toHaveBeenCalled();
    expect(tokenService.createRefreshSession).not.toHaveBeenCalled();
  });
});
