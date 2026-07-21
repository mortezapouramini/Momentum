const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const commentController = require("./comment.controller");
const { validate } = require("../../middlewares/validator.middleware");
const { createCommentSchema } = require("./commentSchema");

router.post(
  "/",
  authMiddleware.authAccessToken,
  validate(createCommentSchema, "body"),
  commentController.createComment,
);


module.exports = router