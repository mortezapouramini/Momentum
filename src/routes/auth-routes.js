/** Requirements */
const router = require("express").Router();
const authController = require("../controllers/auth-controller");

/** Endpoints */
router
  .post("/register", authController.registerUser)
  .post("/verify-email", authController.verifyEmail)
  .post("/login", authController.loginUser)
  .get("/logout", authController.logOutUser)
  .get("/refresh-token", authController.getNewRefreshToken);

module.exports = router;
