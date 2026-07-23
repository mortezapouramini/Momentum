const router = require("express").Router({ mergeParams: true });
const commentController = require("./comment.controller");
const { validate } = require("../../middlewares/validator.middleware");
const {
  createCommentSchema,
  commentIdParamSchema,
} = require("./commentSchema");

router
  .post(
    "/",
    validate(createCommentSchema, "body"),
    commentController.createComment,
  )
  .delete(
    "/:commentId",
    validate(commentIdParamSchema, "params"),
    commentController.deleteComment,
  )
  .get("/", commentController.getTaskComments);

module.exports = router;
