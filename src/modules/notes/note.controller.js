const responder = require("../../utils/responder");
const noteService = require("./note.service");

/** Add Note */
const createNote = async (req, res, next) => {
  try {
    const note = await noteService.createNoteService(
      req.body,
      req.params.taskId,
      req.user.sub,
    );
    responder(res, note, null, 201, "Noted");
  } catch (error) {
    next(error);
  }
};

/** Delete Note */
const deleteNote = async (req, res, next) => {
  try {
    const deleted = await noteService.deleteNoteService(
      req.params.noteId,
      req.params.taskId,
      req.user.sub,
    );
    responder(res, deleted.id, null, 200, "Note deleted");
  } catch (error) {
    next(error);
  }
};

/** Get All Notes */
const getTaskNotes = async (req, res, next) => {
  try {
    const notes = await noteService.getTaskNotesService(
      req.params.taskId,
      req.user.sub,
    );
    responder(res, notes, null, 200, "Notes recived");
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const updated = await noteService.updateNoteService(
      req.body.content,
      req.params.noteId,
      req.params.taskId,
      req.user.sub,
    );
    responder(res, updated, null, 200, "Note updated");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  deleteNote,
  getTaskNotes,
  updateNote,
};
