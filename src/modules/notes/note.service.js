const appError = require("../../utils/error.util");
const {
  insertNote,
  deleteNoteById,
  getNotesByTaskId,
  updateNoteById,
} = require("./note.repository");

const createNoteService = async ({ data, taskId, userId }) => {
  const note = await insertNote({ content: data.content, taskId, userId });
  if (!note) {
    throw appError({ code: 404, message: "Task not found" });
  }
  return note;
};

const deleteNoteService = async ({ noteId, taskId, userId }) => {
  const deleted = await deleteNoteById({ noteId, taskId, userId });
  if (!deleted) {
    throw appError({ code: 404, message: "Note not found" });
  }
  return deleted;
};

const getTaskNotesService = async (taskId, userId) => {
  return await getNotesByTaskId(taskId, userId);
};

const updateNoteService = async ({ content, noteId, taskId, userId }) => {
  const updated = await updateNoteById({ content, noteId, taskId, userId });
  if (!updated) {
    throw appError({ code: 404, message: "Note not found" });
  }
  return updated;
};

module.exports = {
  createNoteService,
  deleteNoteService,
  getTaskNotesService,
  updateNoteService,
};
