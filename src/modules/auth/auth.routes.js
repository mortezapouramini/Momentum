/** Requirements */
const router = require("express").Router();
const authController = require("../auth/auth.controller");
const { validate } = require("../../middlewares/validator.middleware");
const { registerSchema, verifyEmailSchema, loginSchema } = require("../auth/auth.schema");

/** Endpoints */
router
  .post("/register", validate(registerSchema , 'body') , authController.registerUser)
  .post("/verify-email", validate(verifyEmailSchema , 'body') , authController.verifyEmail)
  .post("/login", validate(loginSchema , 'body') , authController.loginUser)
  .get("/logout", authController.logOutUser)
  .get("/refresh-token", authController.getNewRefreshToken);

module.exports = router;
