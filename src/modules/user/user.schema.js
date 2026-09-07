const { object } = require("yup");
const {
  userNameField,
  passwordField,
} = require("../../shared/user.data.schema");

const updateUserSchema = object({
  userName: userNameField,
  password: passwordField,
  oldPassword: passwordField.when("password", {
    is: (val) => !!val,
    then: (schema) => schema.required("Old password is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
}).test(
  "username-or-password",
  "Username or password is required",
  (value) => !!value.password || !!value.userName,
);

module.exports = {
  updateUserSchema,
};
