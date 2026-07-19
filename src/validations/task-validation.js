const { object, string, number, date } = require("yup");

let titleField = string("Title must be string")
  .trim()
  .max(50, "Title must be at most 50 characters");
let descriptionField = string("Description must be string")
  .trim()
  .max(1000, "Description must be at most 1000 characters");
let priorityField = string("Priority must be string")
  .trim()
  .transform((val) => val.toLowerCase())
  .oneOf(["high", "medium", "low"], "Priority can be low, medium or high");

let statusField = string("Priority must be string")
  .trim()
  .transform((val) => val.toLowerCase())
  .oneOf(
    ["pending", "in-progress", "done"],
    "Priority can be pending, in-progress or done",
  );

let dueDateField = date().typeError("Invalid date");

let createTaskSchema = object({
  title : titleField.required('Title is required'),
  description : descriptionField,
  priority : priorityField,
  status : statusField,
  dueDate : dueDateField.required("dueDate is required"),
});

let updateTaskSchema = object({
  title : titleField,
  description : descriptionField,
  priority : priorityField,
  status : statusField,
  dueDate : dueDateField,
});


module.exports = {
    createTaskSchema,
    updateTaskSchema
}