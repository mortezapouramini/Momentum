/** Requirements */
const router = require("express").Router();
const authController = require("../auth/auth.controller");
const { validate } = require("../../middlewares/validator.middleware");
const {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
} = require("../auth/auth.schema");
const {
  loginLimiter,
  registerLimiter,
  verifyEmailLimiter,
  refreshTokenLimiter,
} = require("../../middlewares/rateLimiter.middleware");
router
  .post(
    "/register",
    registerLimiter,
    validate(registerSchema, "body"),
    authController.registerUser,
  )
  .post(
    "/verify-email",
    verifyEmailLimiter,
    validate(verifyEmailSchema, "body"),
    authController.verifyEmail,
  )
  .post(
    "/login",
    loginLimiter,
    validate(loginSchema, "body"),
    authController.loginUser,
  )
  .get("/logout", authController.logOutUser)
  .get(
    "/refresh-token",
    refreshTokenLimiter,
    authController.getNewRefreshToken,
  );

module.exports = router;
