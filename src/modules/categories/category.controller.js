const responder = require("../../utils/responder");
const categoryService = require("./category.service");

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategoryService(
      req.body,
      req.user.sub,
    );
    responder({
      res,
      data: category,
      code: 201,
      message: "New category created",
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const updated = await categoryService.updateCategoryService({
      data: req.body,
      categoryId: req.params.categoryId,
      userId: req.user.sub,
    });
    responder({ res, data: updated, message: "Category updated" });
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
    responder({ res, data: deleted, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategoriesService(req.user.sub);
    responder({
      res,
      data: categories,
      message: "Categories recived",
    });
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
