const { pool } = require("../../config/db.config");
const insertNote = async (noteData) => {
  const query = `
    INSERT INTO notes (task_id, user_id, content)
    SELECT $1, $2, $3
    FROM tasks
    WHERE id = $1 AND user_id = $2
    RETURNING *
    `;
  return (
    await pool.query(query, [
      noteData.taskId,
      noteData.userId,
      noteData.content,
    ])
  ).rows[0];
};

const deleteNoteById = async (noteId, taskId, userId) => {
  const query = `
    DELETE FROM notes
    WHERE id = $1 AND task_id = $2 AND user_id = $3
    RETURNING*
  `;
  return (await pool.query(query, [noteId, taskId, userId])).rows[0];
};

const getNotesByTaskId = async (taskId, userId) => {
  const query = `
    SELECT * FROM notes
    WHERE task_id = $1 AND user_id = $2
  `;
  return (await pool.query(query, [taskId, userId])).rows;
};

const updateNoteById = async (content, noteId, taskId, userId) => {
  const query = `
    UPDATE notes
    SET content = $1
    WHERE id = $2 AND task_id = $3 AND user_id = $4 RETURNING *
  `;
  return (await pool.query(query, [content, noteId, taskId, userId])).rows[0];
};

module.exports = {
  insertNote,
  deleteNoteById,
  getNotesByTaskId,
  updateNoteById,
};
