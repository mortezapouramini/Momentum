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
  title: titleField.required("Title is required"),
  description: descriptionField,
  priority: priorityField,
  status: statusField,
  dueDate: dueDateField.required("dueDate is required"),
});

let updateTaskSchema = object({
  title: titleField,
  description: descriptionField,
  priority: priorityField,
  status: statusField,
  dueDate: dueDateField,
});

const taskQuerySchema = object({
  status: string().oneOf(["pending", "in-progress", "done"], "Invalid status"),
  priority: string().oneOf(["low", "medium", "high"], "Invalid priority"),
  q: string().trim().max(100, "Search query too long"),
  minDueDate: string().matches(
    /^\d{4}-\d{2}-\d{2}$/,
    "Invalid date format (YYYY-MM-DD)",
  ),
  maxDueDate: string().matches(
    /^\d{4}-\d{2}-\d{2}$/,
    "Invalid date format (YYYY-MM-DD)",
  ),
});
const taskIdParamSchema = object({
  taskId: string("ID must be string").uuid("Invalid ID").required("ID is required"),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskIdParamSchema
};
