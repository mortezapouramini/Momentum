const { object, string, number } = require("yup");

const registerSchema = object({
  userName: string()
    .trim()
    .transform((val) => val?.toLowerCase())
    .min(3, "userName must be at least 3 characters")
    .matches(
      /^[a-z0-9_]+$/,
      "userName must contain only letters, numbers, and underscores",
    )
    .required("userName is required"),
  email: string()
    .email("Email must be a valid email")
    .required("Email is required"),
  password: string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must be less than 16 characters")
    .required("Password is required"),
});

const verifyEmailSchema = object({
  verifyCode: number()
    .integer("Verify code must be an integer")
    .min(100000, "Verify code must be 6 digits")
    .max(999999, "Verify code must be 6 digits")
    .required("Verify code is required")
    .typeError("Verify code must be a number"),
});

module.exports = { registerSchema, verifyEmailSchema };
