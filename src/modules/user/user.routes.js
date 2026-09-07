const { validate } = require("../../middlewares/validator.middleware");
const { uuidParamSchema } = require("../../shared/param.schema");
const authMiddleware = require("../../middlewares/auth.middleware");
const userController = require("./user.controller");
const { updateUserSchema } = require("./user.schema");

const router = require("express").Router();

router
  .get(
    "/:userId",
    authMiddleware.authAccessToken,
    validate(uuidParamSchema("userId"), "params"),
    userController.getUser,
  )
  .patch(
    "/:userId",
    authMiddleware.authAccessToken,
    validate(uuidParamSchema("userId"), "params"),
    validate(updateUserSchema, "body"),
    userController.updateUser,
  );



  module.exports = router