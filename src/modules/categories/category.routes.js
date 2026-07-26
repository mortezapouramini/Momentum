const router = require("express").Router({ mergeParams: true });
const { validate } = require("../../middlewares/validator.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const categoryController = require("./category.controller");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("./category.schema");
const { uuidParamSchema } = require("../../shared/param.schema");

router
  .post(
    "/",
    authMiddleware.authAccessToken,
    validate(createCategorySchema, "body"),
    categoryController.createCategory,
  )
  .delete(
    "/:categoryId",
    authMiddleware.authAccessToken,
    validate(uuidParamSchema("categoryId"), "params"),
    categoryController.deleteCategory,
  )
  .get("/", authMiddleware.authAccessToken, categoryController.getCategories)
  .patch(
    "/:categoryId",
    authMiddleware.authAccessToken,
    validate(uuidParamSchema("categoryId"), "params"),
    validate(updateCategorySchema, "body"),
    categoryController.updateCategory,
  );

module.exports = router;
