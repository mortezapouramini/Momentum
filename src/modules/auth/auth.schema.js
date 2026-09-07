const {
  userNameField,
  passwordField,
} = require("../../shared/user.data.schema");
const { object, string, number } = require("yup");

const emailField = string().email("Email must be a valid email");

const registerSchema = object({
  userName: userNameField.required("userName is required"),
  email: emailField.required("Email is required"),
  password: passwordField.required(),
});

const loginSchema = object({
  email: emailField,
  userName: userNameField,
  password: passwordField.required(),
}).test(
  "email-or-username",
  "Email or username is required",
  (value) => !!value.email || !!value.userName,
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
