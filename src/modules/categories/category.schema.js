const { object, string } = require("yup");

const nameField = string("Name must be string")
  .trim()
  .max(100, "Name must be at most 100 characters")
  .min(1, "Name cannot be empty");

const colorField = string("Color must be string")
  .trim()
  .matches(/^#[0-9A-Fa-f]{6}/, "Color must be a valid hex color (e.g. #FF5733")
  .nullable()
  .optional();

const createCategorySchema = object({
  name: nameField.required("Name is required"),
  color: colorField,
});
const updateCategorySchema = object({
  name: nameField.optional(),
  color: colorField,
});

const categoryIdParamSchema = object({
  categoryId: string("ID must be string")
    .uuid("Invalid ID")
    .required("ID is required"),
});

module.exports = {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
};
