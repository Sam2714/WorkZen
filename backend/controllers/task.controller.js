import { randomUUID } from "node:crypto";
import { readStore, updateStore } from "../data/store.js";
import { created, ok } from "../utils/response.js";

const VALID_PRIORITIES = new Set(["low", "medium", "high"]);
const VALID_STATUSES = new Set(["pending", "done"]);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeTaskInput(body = {}, { partial = false } = {}) {
  const updates = {};

  if (!partial || body.title !== undefined) {
    const title = String(body.title || "").trim();

    if (!title) {
      throw httpError(400, "Task title is required.");
    }

    updates.title = title;
  }

  if (body.description !== undefined || !partial) {
    updates.description = String(body.description || "").trim();
  }

  if (body.priority !== undefined || !partial) {
    const priority = String(body.priority || "medium").toLowerCase();

    if (!VALID_PRIORITIES.has(priority)) {
      throw httpError(400, "Priority must be low, medium, or high.");
    }

    updates.priority = priority;
  }

  if (body.status !== undefined) {
    const status = String(body.status).toLowerCase();

    if (!VALID_STATUSES.has(status)) {
      throw httpError(400, "Status must be pending or done.");
    }

    updates.status = status;
  }

  if (body.completedAt !== undefined) {
    if (body.completedAt === null || body.completedAt === "") {
      updates.completedAt = undefined;
    } else {
      const completedAt = new Date(body.completedAt);

      if (Number.isNaN(completedAt.getTime())) {
        throw httpError(400, "completedAt must be a valid date.");
      }

      updates.completedAt = completedAt.toISOString();
    }
  }

  return updates;
}

function finalizeTask(task) {
  if (task.status === "done" && !task.completedAt) {
    return {
      ...task,
      completedAt: new Date().toISOString(),
    };
  }

  if (task.status === "pending") {
    const { completedAt, ...rest } = task;
    return rest;
  }

  return task;
}

export async function listTasks(_req, res) {
  const store = await readStore();
  const tasks = [...store.tasks].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
  return ok(res, tasks);
}

export async function createTask(req, res) {
  const now = new Date().toISOString();
  const input = normalizeTaskInput(req.body);

  const task = finalizeTask({
    id: randomUUID(),
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: input.status || "pending",
    createdAt: now,
    completedAt: input.completedAt,
  });

  await updateStore((store) => {
    store.tasks.unshift(task);
    return store;
  });

  return created(res, task);
}

export async function updateTask(req, res) {
  const { taskId } = req.params;
  const updates = normalizeTaskInput(req.body, { partial: true });
  let nextTask;

  await updateStore((store) => {
    const taskIndex = store.tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      throw httpError(404, "Task not found.");
    }

    nextTask = finalizeTask({
      ...store.tasks[taskIndex],
      ...updates,
    });

    store.tasks[taskIndex] = nextTask;
    return store;
  });

  return ok(res, nextTask);
}

export async function deleteTask(req, res) {
  const { taskId } = req.params;
  let removed = false;

  await updateStore((store) => {
    const nextTasks = store.tasks.filter((task) => task.id !== taskId);
    removed = nextTasks.length !== store.tasks.length;

    if (!removed) {
      throw httpError(404, "Task not found.");
    }

    store.tasks = nextTasks;
    store.sessions = store.sessions.map((session) =>
      session.taskId === taskId ? { ...session, taskId: null } : session,
    );

    return store;
  });

  return res.status(204).send();
}
