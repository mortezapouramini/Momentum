const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const commentController = require("./comment.controller");
const { validate } = require("../../middlewares/validator.middleware");
const { createCommentSchema, idParamSchema } = require("./commentSchema");

router
  .post(
    "/",
    authMiddleware.authAccessToken,
    validate(createCommentSchema, "body"),
    commentController.createComment,
  )
  .delete(
    "/:id",
    authMiddleware.authAccessToken,
    validate(idParamSchema, "params"),
    commentController.deleteComment,
  );

module.exports = router;
