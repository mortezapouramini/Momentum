const { object, string, number, date } = require("yup");

const titleField = string("Title must be string")
  .trim()
  .max(50, "Title must be at most 50 characters");
const descriptionField = string("Description must be string")
  .trim()
  .max(1000, "Description must be at most 1000 characters");
const priorityField = string("Priority must be string")
  .trim()
  .transform((val) => val.toLowerCase())
  .oneOf(["high", "medium", "low"], "Priority can be low, medium or high");

const statusField = string("Priority must be string")
  .trim()
  .transform((val) => val.toLowerCase())
  .oneOf(
    ["pending", "in-progress", "done"],
    "Priority can be pending, in-progress or done",
  );

const dueDateField = date().typeError("Invalid date");

const createTaskSchema = object({
  title : titleField.required('Title is required'),
  description : descriptionField,
  priority : priorityField,
  status : statusField,
  dueDate : dueDateField.required("dueDate is required"),
});



module.exports = {
    createTaskSchema
}