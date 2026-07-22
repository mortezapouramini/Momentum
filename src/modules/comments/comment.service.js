const appError = require("../../utils/error.util");
const { insertComment, deleteCommentById } = require("./comment.repository");

const createCommentService = async (data, userId) => {
  const commentData = { content: data.content, taskId: data.taskId, userId };
  const comment = await insertComment(commentData);
  if (!comment) {
    throw appError(404, "Task not found");
  }
  return comment;
};

const deleteCommentService = async (commentId, userId) => {
  const deleted = await deleteCommentById(commentId, userId);
  if (!deleted) {
    throw appError(404, "Comment not found");
  }
  return deleted;
};

module.exports = {
  createCommentService,
  deleteCommentService,
};
