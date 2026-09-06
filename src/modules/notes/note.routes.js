const router = require("express").Router({ mergeParams: true });
const noteController = require("./note.controller");
const { validate } = require("../../middlewares/validator.middleware");
const { createNoteSchema } = require("./note.schema");
const { uuidParamSchema } = require("../../shared/param.schema");

router
  .post("/", validate(createNoteSchema, "body"), noteController.createNote)
  .delete(
    "/:noteId",
    validate(uuidParamSchema("noteId"), "params"),
    noteController.deleteNote,
  )
  .get("/", noteController.getTaskNotes)
  .patch(
    "/:noteId",
    validate(uuidParamSchema("noteId"), "params"),
    validate(createNoteSchema, "body"),
    noteController.updateNote,
  );

module.exports = router;
