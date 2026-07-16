/** Requirements */
const router = require("express").Router();
const authController = require("../controllers/auth-controller");
const { validate } = require("../middlewares/validator-middleware");
const { registerSchema, verifyEmailSchema } = require("../validations/auth-validation");

/** Endpoints */
router
  .post("/register", validate(registerSchema) , authController.registerUser)
  .post("/verify-email", validate(verifyEmailSchema) , authController.verifyEmail)
  .post("/login", authController.loginUser)
  .get("/logout", authController.logOutUser)
  .get("/refresh-token", authController.getNewRefreshToken);

module.exports = router;
