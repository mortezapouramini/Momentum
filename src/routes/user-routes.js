/** Requirements */
const router = require("express").Router();
const userController = require("../controllers/user-controller");

/** Endpoints */
router
  .post("/register", userController.registerUser)
  .post("/verify-email", userController.verifyEmail)
  .post("/login", userController.loginUser)
  // .get("/logout", userController.logOutUser)
  // .get("/refresh-token", userController.getNewRefreshToken);

module.exports = router;
