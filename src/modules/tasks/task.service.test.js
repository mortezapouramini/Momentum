jest.mock("./task.repository");
const {
  insertTask,
  updateTaskById,
  deleteTaskById,
  getTasksByUserId,
  getTasksByFilters,
  getTaskById,
  insertCategoryToTaskById,
  deleteCategoryFromTaskById,
} = require("./task.repository");
const {
  createTaskService,
  updateTaskService,
  deleteTaskService,
  getTasksService,
  getSingleTaskService,
  addCategoryToTaskService,
  deleteCategoryFromTaskService,
} = require("./task.service");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createTaskService", () => {
  it("should default priority to low when not provided", async () => {
    insertTask.mockResolvedValue({ id: "task-1", priority: "low" });

    await createTaskService(
      { title: "Learn Jest", dueDate: "2026-12-01" },
      "user-1",
    );

    expect(insertTask).toHaveBeenCalledWith(
      expect.objectContaining({ priority: "low" }),
    );
  });

  it("should default status to pending when not provided", async () => {
    insertTask.mockResolvedValue({ id: "task-1", status: "pending" });

    await createTaskService(
      { title: "Learn Jest", dueDate: "2026-12-01" },
      "user-1",
    );

    expect(insertTask).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending" }),
    );
  });

  it("should convert INVALID_CATEGORIES error into a 404 AppError", async () => {
    insertTask.mockRejectedValue(new Error("INVALID_CATEGORIES"));

    await expect(
      createTaskService(
        { title: "Learn Jest", dueDate: "2026-12-01", categoryIds: ["bad-id"] },
        "user-1",
      ),
    ).rejects.toMatchObject({
      code: 404,
      message: "One or more categories not found",
    });
  });
});

describe("updateTaskService", () => {
  it("rejects when taskData is empty", async () => {
    await expect(
      updateTaskService({ taskId: "task-1", taskData: {}, userId: "user-1" }),
    ).rejects.toMatchObject({ code: 400, message: "No fields to update" });
  });

  it("rejects with 404 when task is not found", async () => {
    updateTaskById.mockResolvedValue(null);

    await expect(
      updateTaskService({
        taskId: "task-1",
        taskData: { title: "New title" },
        userId: "user-1",
      }),
    ).rejects.toMatchObject({ code: 404, message: "Task not found" });
  });

  it("returns the updated task on success", async () => {
    updateTaskById.mockResolvedValue({
      taskId: "task-1",
      title: "New title",
    });

    const result = await updateTaskService({
      taskId: "task-1",
      taskData: { title: "New title" },
      userId: "user-1",
    });

    expect(result).toEqual({ taskId: "task-1", title: "New title" });
  });
});

describe("deleteTaskService", () => {
  it("rejects when task not found", async () => {
    deleteTaskById.mockResolvedValue(null);

    await expect(deleteTaskService("task-1", "user-1")).rejects.toMatchObject({
      code: 404,
      message: "Task not found",
    });
  });

  it("resolves when task is deleted", async () => {
    deleteTaskById.mockResolvedValue({ taskId: "task-1", title: "learn jest" });

    const result = await deleteTaskService("task-1", "user-1");
    expect(result).toEqual({ taskId: "task-1", title: "learn jest" });
  });
});

describe("getTasksService", () => {
  it("calls getTasksByUserId when filters is empty", async () => {
    getTasksByUserId.mockResolvedValue([{ id: "task-1" }]);

    const result = await getTasksService("user-1", {});

    expect(getTasksByUserId).toHaveBeenCalledWith("user-1");
    expect(getTasksByFilters).not.toHaveBeenCalled();
    expect(result).toEqual([{ id: "task-1" }]);
  });

  it("calls getTasksByFilters when filters are provided", async () => {
    getTasksByFilters.mockResolvedValue([{ id: "task-2" }]);

    const result = await getTasksService("user-1", { status: "pending" });

    expect(getTasksByFilters).toHaveBeenCalledWith("user-1", {
      status: "pending",
    });
    expect(getTasksByUserId).not.toHaveBeenCalled();
    expect(result).toEqual([{ id: "task-2" }]);
  });
});

describe("getSingleTaskService", () => {
  it("rejects when task not found", async () => {
    getTaskById.mockResolvedValue(null);

    await expect(
      getSingleTaskService("task-1", "user-1"),
    ).rejects.toMatchObject({
      code: 404,
      message: "Task not found",
    });
  });

  it("resolves when task is recived", async () => {
    getTaskById.mockResolvedValue({ id: "task-1", title: "learn jest" });

    const result = await getSingleTaskService("task-1", "user-1");
    expect(result).toEqual({ id: "task-1", title: "learn jest" });
  });
});

describe("addCategoryToTaskService", () => {
  it("resolves when task and category found", async () => {
    insertCategoryToTaskById.mockResolvedValue({
      taskId: "task-1",
      categoryId: "category-1",
      userId: "user-1",
    });

    const result = await addCategoryToTaskService({
      taskId: "task-1",
      categoryId: "category-1",
      userId: "user-1",
    });
    expect(result).toEqual({
      taskId: "task-1",
      categoryId: "category-1",
      userId: "user-1",
    });
  });

  it("rejects when task not found", async () => {
    insertCategoryToTaskById.mockResolvedValue(null);

    await expect(
      addCategoryToTaskService({
        taskId: "task-2",
        categoryId: "category-2",
        userId: "user-2",
      }),
    ).rejects.toMatchObject({
      code: 404,
      message: "Task or category not found",
    });
  });
  it("rejects when category not found", async () => {
    insertCategoryToTaskById.mockResolvedValue(null);

    await expect(
      addCategoryToTaskService({
        taskId: "task-3",
        categoryId: "category-3",
        userId: "user-3",
      }),
    ).rejects.toMatchObject({
      code: 404,
      message: "Task or category not found",
    });
  });

  it("rejects when task is already in category", async () => {
    let dbError = new Error("duplicate key value violates unique constraint");
    dbError.code = "23505";
    insertCategoryToTaskById.mockRejectedValue(dbError);

    await expect(
      addCategoryToTaskService({
        taskId: "task-4",
        categoryId: "category-4",
        userId: "user-4",
      }),
    ).rejects.toMatchObject({
      code: 400,
      message: "Task is already in category",
    });
  });
});

describe("deleteCategoryFromTaskService", () => {
  it("resolves when task and  category found", async () => {
    deleteCategoryFromTaskById.mockResolvedValue({
      taskId: "task-1",
      categoryId: "category-1",
      userId: "user-1",
    });

    const result = await deleteCategoryFromTaskService({
      taskId: "task-1",
      categoryId: "category-1",
      userId: "user-1",
    });
    expect(result).toMatchObject({
      taskId: "task-1",
      categoryId: "category-1",
      userId: "user-1",
    });
  });
  it("rejects when task or category not found", async () => {
    deleteCategoryFromTaskById.mockResolvedValue(null);

    await expect(
      deleteCategoryFromTaskService({
        taskId: "task-1",
        categoryId: "category-1",
        userId: "user-1",
      }),
    ).rejects.toMatchObject({
      code: 404,
      message: "Task or category not found",
    });
  });
});
