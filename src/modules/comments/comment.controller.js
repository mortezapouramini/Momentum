const responder = require("../../utils/responder");
const commentService = require("./comment.service");

/** Add Comment */
const createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createCommentService(
      req.body,
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
      req.params.id,
      req.user.sub,
    );
    responder(res, deleted.id, null, 200, "Comment deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  deleteComment,
};
