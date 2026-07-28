const responder = require("../../utils/responder");
const categoryService = require("./category.service");

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategoryService(
      req.body,
      req.user.sub,
    );
    responder(res, category, null, 201, "New category created");
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const updated = await categoryService.updateCategoryService(
      req.body,
      req.params.categoryId,
      req.user.sub,
    );
    responder(res, updated, null, 200, "Category updated");
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const deleted = await categoryService.deleteCategoryService(
      req.params.categoryId,
      req.user.sub,
    );
    responder(res, deleted, null, 200, "Category deleted");
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategoriesService(req.user.sub);
    responder(res, categories, null, 200, "Categories recived");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
};
