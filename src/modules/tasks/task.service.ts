import {
  PartialUpdateTask,
  Task,
  TaskInputInfo,
  User,
} from "../../types/models";
import { AppError } from "../../utils/error.util";

const {
  insertTask,
  deleteTaskById,
  updateTaskById,
  getTaskById,
  getTasksByUserId,
  getTasksByFilters,
  insertCategoryToTaskById,
  deleteCategoryFromTaskById,
} = require("./task.repository");
const appError = require("../../utils/error.util");

const createTaskService = async (
  taskData: TaskInputInfo,
  userId: User["id"],
) => {
  try {
    const insertData = {
      userId,
      title: taskData.title,
      description: taskData.description ?? null,
      priority: taskData.priority || "low",
      status: taskData.status || "pending",
      dueDate: taskData.dueDate,
      categoryIds: taskData.categoryIds || [],
    };

    return await insertTask(insertData);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CATEGORIES") {
      throw appError({
        code: 404,
        message: "One or more categories not found",
      });
    }
    throw error;
  }
};

const deleteTaskService = async (taskId: Task["id"], userId: User["id"]) => {
  const task = await deleteTaskById(taskId, userId);
  if (!task) {
    throw appError({ code: 404, message: "Task not found" });
  }
  return task;
};

const updateTaskService = async ({
  taskId,
  taskData,
  userId,
}: {
  taskId: Task["id"];
  taskData: PartialUpdateTask;
  userId: User["id"];
}) => {
  const UPDATABLE_FIELDS = {
    title: "title",
    description: "description",
    status: "status",
    priority: "priority",
    dueDate: "due_date",
  };

  if (Object.keys(taskData).length === 0) {
    throw appError({ code: 400, message: "No fields to update" });
  }

  const task = await updateTaskById({
    taskData,
    updatableFields: UPDATABLE_FIELDS,
    taskId,
    userId,
  });
  if (!task) {
    throw appError({ code: 404, message: "Task not found" });
  }
  return task;
};

const getSingleTaskService = async (taskId: Task["id"], userId: User["id"]) => {
  const task = await getTaskById(taskId, userId);
  if (!task) {
    throw appError({ code: 404, message: "Task not found" });
  }
  return task;
};

const getTasksService = async (userId: User["id"], filters: any) => {
  if (Object.keys(filters).length === 0) {
    return await getTasksByUserId(userId);
  }
  return await getTasksByFilters(userId, filters);
};

const addCategoryToTaskService = async ({
  taskId,
  categoryId,
  userId,
}: any) => {
  try {
    const result = await insertCategoryToTaskById({
      taskId,
      categoryId,
      userId,
    });
    if (!result) {
      throw appError({ code: 404, message: "Task or category not found" });
    }
    return result;
  } catch (error) {
    if (error instanceof AppError && error.code === "23505") {
      throw appError({ code: 400, message: "Task is already in category" });
    }
    throw error;
  }
};
const deleteCategoryFromTaskService = async ({
  taskId,
  categoryId,
  userId,
}: any) => {
  const result = await deleteCategoryFromTaskById({
    taskId,
    categoryId,
    userId,
  });
  if (!result) {
    throw appError({ code: 404, message: "Task or category not found" });
  }
  return result;
};

module.exports = {
  createTaskService,
  deleteTaskService,
  updateTaskService,
  getSingleTaskService,
  getTasksService,
  addCategoryToTaskService,
  deleteCategoryFromTaskService,
};
