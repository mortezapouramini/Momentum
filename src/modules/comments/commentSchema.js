const { object, string } = require("yup");

let createCommentSchema = object({
  content: string("Comment must be string")
    .max(1000, "Comment must be at most 1000 characters")
    .required("Content is required")
});

const commentIdParamSchema = object({
  commentId: string("ID must be string").uuid("Invalid ID").required("ID is required"),
});

module.exports = {
  createCommentSchema,
  commentIdParamSchema
};
