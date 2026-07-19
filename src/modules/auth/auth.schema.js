const { object, string, number } = require("yup");


const emailField = string().email("Email must be a valid email");
const userNameField = string()
  .trim()
  .transform((val) => val?.toLowerCase())
  .min(3, "userName must be at least 3 characters")
  .max(30, "userName must be at most 30 characters")
  .matches(/^[a-z0-9_]+$/, "userName must contain only letters, numbers, and underscores");
const passwordField = string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be less than 16 characters")
  .required("Password is required");

const registerSchema = object({
  userName: userNameField.required("userName is required"),
  email: emailField.required("Email is required"),
  password: passwordField,
});

const loginSchema = object({
  email: emailField,
  userName: userNameField,
  password: passwordField,
}).test(
  "email-or-username",
  "Email or username is required",
  (value) => !!value.email || !!value.userName
);

const verifyEmailSchema = object({
  verifyCode: number()
    .integer("Verify code must be an integer")
    .min(100000, "Verify code must be 6 digits")
    .max(999999, "Verify code must be 6 digits")
    .required("Verify code is required")
    .typeError("Verify code must be a number"),
});

module.exports = { registerSchema, verifyEmailSchema, loginSchema };