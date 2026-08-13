const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
} = require("./auth.schema");

describe("registerSchema", () => {
  it("should accept a valid user", async () => {
    const validUser = {
      userName: "MyUserName",
      email: "test@test.com",
      password: "password123",
    };
    const result = await registerSchema.validate(validUser);
    expect(result.email).toBe("test@test.com");
  });
  it("should reject when userName not sent", async () => {
    await expect(
      registerSchema.validate({
        email: "test@test.com",
        password: "password123",
      }),
    ).rejects.toThrow("userName is required");
  });
  it("should reject when email not sent", async () => {
    await expect(
      registerSchema.validate({
        userName: "MyUserName",
        password: "password123",
      }),
    ).rejects.toThrow("Email is required");
  });
  it("should reject when password not sent", async () => {
    await expect(
      registerSchema.validate({
        userName: "MyUserName",
        email: "test@test.com",
      }),
    ).rejects.toThrow("Password is required");
  });
  it("should lowercase the username", async () => {
    const result = await registerSchema.validate({
      userName: "MyUserName",
      email: "test@test.com",
      password: "password123",
    });
    expect(result.userName).toBe("myusername");
  });
  it("should reject username with special characters", async () => {
    await expect(
      registerSchema.validate({
        userName: "user@name",
        email: "test@test.com",
        password: "password123",
      }),
    ).rejects.toThrow(
      "userName must contain only letters, numbers, and underscores",
    );
  });
});

describe("loginSchema", () => {
  it("should accept when only email is provided", async () => {
    const result = await loginSchema.validate({
      email: "test@test.com",
      password: "password123",
    });
    expect(result.email).toBe("test@test.com");
  });

  it("should accept when only userName is provided", async () => {
    const result = await loginSchema.validate({
      userName: "testuser",
      password: "password123",
    });
    expect(result.userName).toBe("testuser");
  });

  it("should reject when neither email nor userName is provided", async () => {
    await expect(
      loginSchema.validate({ password: "password123" }),
    ).rejects.toThrow("Email or username is required");
  });
});

describe("verifyEmailSchema", () => {
  it("should reject non-numeric verify code", async () => {
    await expect(
      verifyEmailSchema.validate({ verifyCode: "abc123" }),
    ).rejects.toThrow("Verify code must be a number");
  });
  it("should reject verify code with less than 6 digits", async () => {
    await expect(
      verifyEmailSchema.validate({ verifyCode: 12345 }),
    ).rejects.toThrow("Verify code must be 6 digits");
  });
  it("should reject verify code with more than 6 digits", async () => {
    await expect(
      verifyEmailSchema.validate({ verifyCode: 1234567 }),
    ).rejects.toThrow("Verify code must be 6 digits");
  });
  it("should accept a valid 6-digit verify code", async () => {
    const result = await verifyEmailSchema.validate({ verifyCode: 123456 });
    expect(result.verifyCode).toBe(123456);
  });
});
