const { createTaskSchema, updateTaskSchema } = require("./task.schema");

describe("createTaskSchema", () => {
  it("should accept a valid task", async () => {
    const validTask = { title: "Learn Jest", dueDate: "2026-12-01" };
    const result = await createTaskSchema.validate(validTask);
    expect(result.title).toBe("Learn Jest");
  });

  it("should throw when title is missing", async () => {
    const invalidTask = { dueDate: "2026-12-01" };
    await expect(createTaskSchema.validate(invalidTask)).rejects.toThrow(
      "Title is required",
    );
  });

  it("must reject title longer than 50 characters", async () => {
    const longTitle = { title: "a".repeat(51), dueDate: "2026-12-01" };
    await expect(createTaskSchema.validate(longTitle)).rejects.toThrow(
      "Title must be at most 50 characters",
    );
  });

  it("should accept uppercase status and lowercase it", async () => {
    const task = {
      title: "Learn Jest",
      dueDate: "2026-12-01",
      status: "In-Progress",
    };
    const result = await createTaskSchema.validate(task);
    expect(result.status).toBe("in-progress");
  });

  it("should accept uppercase priority and lowercase it", async () => {
    const task = {
      title: "Learn Jest",
      dueDate: "2026-12-01",
      priority: "HIGH",
    };
    const result = await createTaskSchema.validate(task);
    expect(result.priority).toBe("high");
  });
});

describe("updateTaskSchema", () => {
  it("should accept title only", async () => {
    const partialUpdate = { title: "Update something" };
    const result = await updateTaskSchema.validate(partialUpdate);
    expect(result.title).toBe("Update something");
  });

  it("must reject title longer than 50 characters", async () => {
    const longTitle = { title: "a".repeat(51) };
    await expect(updateTaskSchema.validate(longTitle)).rejects.toThrow(
      "Title must be at most 50 characters",
    );
  });
  it("should accept an empty object since nothing is required", async () => {
    const result = await updateTaskSchema.validate({});
    expect(result).toEqual({});
  });
});
