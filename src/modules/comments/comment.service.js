const appError = require("../../utils/error.util");
const { insertComment } = require("./comment.repository");

const createCommentService = async (data, userId) => {
  const commentData = { content: data.content, taskId: data.taskId, userId };
  const comment = await insertComment(commentData);
  if (!comment) {
    throw appError(404, "Task not found");
  }
  return comment;
};

module.exports = {
  createCommentService,
};
