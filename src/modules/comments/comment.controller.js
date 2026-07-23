const responder = require("../../utils/responder");
const commentService = require("./comment.service");

/** Add Comment */
const createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createCommentService(
      req.body,
      req.params.taskId,
      req.user.sub,
    );
    responder(res, comment, null, 201, "Commented");
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const deleted = await commentService.deleteCommentService(
      req.params.commentId,
      req.params.taskId,
      req.user.sub,
    );
    responder(res, deleted.id, null, 200, "Comment deleted");
  } catch (error) {
    next(error);
  }
};

const getTaskComments = async (req, res, next) => {
  try {
    const comments = await commentService.getTaskCommentsService(
      req.params.taskId,
      req.user.sub,
    );
    responder(res, comments, null, 200, "Comments recived");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  deleteComment,
  getTaskComments
};
