const { pool } = require("../../config/db.config");
const insertComment = async (commentData) => {
  const query = `
    INSERT INTO comments (task_id, user_id, content)
    SELECT $1, $2, $3
    FROM tasks
    WHERE id = $1 AND user_id = $2
    RETURNING *
    `;
  return (
    await pool.query(query, [
      commentData.taskId,
      commentData.userId,
      commentData.content,
    ])
  ).rows[0];
};

const deleteCommentById = async (commentId, userId) => {
  const query = `
    DELETE FROM comments
    WHERE id = $1 AND user_id = $2
    RETURNING*
  `;
  return (await pool.query(query, [commentId, userId])).rows[0];
};

module.exports = { insertComment, deleteCommentById };
