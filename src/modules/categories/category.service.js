const appError = require("../../utils/error.util");
const {
  insertCategory,
  updateCategoryById,
  deleteCategoryById,
  getCategoriesByUserId,
} = require("./category.repository");

const createCategoryService = async (data, userId) => {
  try {
    const category = await insertCategory(data, userId);
    return category;
  } catch (error) {
    if (error.code === "23505") {
      throw appError(400, "Category is already exists");
    }
    throw error;
  }
};

const updateCategoryService = async ({data, categoryId, userId}) => {
  try {
    const updated = await updateCategoryById({data, categoryId, userId});
    return updated;
  } catch (error) {
    if (error.code === "23505") {
      throw appError(400, "Category is already exists");
    }
    throw error;
  }
};

const deleteCategoryService = async (categoryId, userId) => {
  const deleted = await deleteCategoryById(categoryId, userId);
  if (!deleted) {
    throw appError(404, "Category not found");
  }
  return deleted;
};

const getCategoriesService = async (userId) => {
  return await getCategoriesByUserId(userId);
};

module.exports = {
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  getCategoriesService,
};
