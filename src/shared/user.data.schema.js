const { string } = require("yup");

const userNameField = string()
  .trim()
  .transform((val) => val?.toLowerCase())
  .min(3, "userName must be at least 3 characters")
  .max(30, "userName must be at most 30 characters")
  .matches(
    /^[a-z0-9_]+$/,
    "userName must contain only letters, numbers, and underscores",
  );
const passwordField = string()
  .min(8, "Password must be at least 8 characters")
  .max(16, "Password must be less than 16 characters")


module.exports = {
  userNameField,
  passwordField,
};
