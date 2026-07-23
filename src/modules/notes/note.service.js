const appError = require("../../utils/error.util");
const {
  insertNote,
  deleteNoteById,
  getNotesByTaskId,
} = require("./note.repository");

const createNoteService = async (data, taskId, userId) => {
  const noteData = { content: data.content, taskId, userId };
  const note = await insertNote(noteData);
  if (!note) {
    throw appError(404, "Task not found");
  }
  return note;
};

const deleteNoteService = async (noteId, taskId, userId) => {
  const deleted = await deleteNoteById(noteId, taskId, userId);
  if (!deleted) {
    throw appError(404, "Note not found");
  }
  return deleted;
};

const getTaskNotesService = async (taskId, userId) => {
  return await getNotesByTaskId(taskId, userId);
};

module.exports = {
  createNoteService,
  deleteNoteService,
  getTaskNotesService,
};
