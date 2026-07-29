const responder = require("../../utils/responder");
const noteService = require("./note.service");

/** Add Note */
const createNote = async (req, res, next) => {
  try {
    const note = await noteService.createNoteService({
      data: req.body,
      taskId: req.params.taskId,
      userId: req.user.sub,
    });
    responder({ res, data: note, code: 201, message: "Noted added" });
  } catch (error) {
    next(error);
  }
};

/** Delete Note */
const deleteNote = async (req, res, next) => {
  try {
    const deleted = await noteService.deleteNoteService({
      noteId: req.params.noteId,
      taskId: req.params.taskId,
      userId: req.user.sub,
    });
    responder({ res, data: deleted.id, message: "Note deleted" });
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
    responder({ res, data: notes, message: "Notes recived" });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const updated = await noteService.updateNoteService({
      content: req.body.content,
      noteId: req.params.noteId,
      taskId: req.params.taskId,
      userId: req.user.sub,
    });
    responder({ res, data: updated, message: "Note updated" });
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
