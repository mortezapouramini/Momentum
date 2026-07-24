const router = require("express").Router({ mergeParams: true });
const noteController = require("./note.controller");
const { validate } = require("../../middlewares/validator.middleware");
const { createNoteSchema, NoteIdParamSchema } = require("./note.schema");

router
  .post("/", validate(createNoteSchema, "body"), noteController.createNote)
  .delete(
    "/:noteId",
    validate(NoteIdParamSchema, "params"),
    noteController.deleteNote,
  )
  .get("/", noteController.getTaskNotes)
  .patch(
    "/:noteId",
    validate(NoteIdParamSchema, "params"),
    validate(createNoteSchema, "body"),
    noteController.updateNote,
  );

module.exports = router;
