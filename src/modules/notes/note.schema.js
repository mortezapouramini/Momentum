const { object, string } = require("yup");

let createNoteSchema = object({
  content: string("Note must be string")
    .max(1000, "Note must be at most 1000 characters")
    .required("Note is required"),
});

const NoteIdParamSchema = object({
  noteId: string("ID must be string")
    .uuid("Invalid ID")
    .required("ID is required"),
});

module.exports = {
  createNoteSchema,
  NoteIdParamSchema,
};
