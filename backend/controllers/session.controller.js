import { randomUUID } from "node:crypto";
import { readStore, updateStore } from "../data/store.js";
import { created, ok } from "../utils/response.js";

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeSessionInput(body = {}) {
  const notes = String(body.notes || "").trim();
  const taskId = body.taskId ? String(body.taskId) : null;
  const durationMinutes = Number(body.durationMinutes || 25);
  const date = body.date ? new Date(body.date) : new Date();

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw httpError(400, "durationMinutes must be a positive number.");
  }

  if (Number.isNaN(date.getTime())) {
    throw httpError(400, "date must be a valid date.");
  }

  return {
    taskId,
    notes,
    durationMinutes,
    date: date.toISOString(),
  };
}

export async function listSessions(_req, res) {
  const store = await readStore();
  const sessions = [...store.sessions].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
  return ok(res, sessions);
}

export async function createSession(req, res) {
  const input = normalizeSessionInput(req.body);
  let session;

  await updateStore((store) => {
    if (input.taskId && !store.tasks.some((task) => task.id === input.taskId)) {
      throw httpError(400, "Linked task was not found.");
    }

    session = {
      id: randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
    };

    store.sessions.unshift(session);
    return store;
  });

  return created(res, session);
}
