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

module.exports = {
  createComment,
};
