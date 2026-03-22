import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

function createEmptyStore() {
  return {
    users: [],
    tasks: [],
    sessions: [],
  };
}

function normalizeStore(store) {
  return {
    users: Array.isArray(store?.users) ? store.users : [],
    tasks: Array.isArray(store?.tasks) ? store.tasks : [],
    sessions: Array.isArray(store?.sessions) ? store.sessions : [],
  };
}

let writeQueue = Promise.resolve();

export async function ensureStore() {
  await mkdir(path.dirname(env.dataFile), { recursive: true });

  try {
    await readFile(env.dataFile, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await writeFile(
      env.dataFile,
      JSON.stringify(createEmptyStore(), null, 2),
      "utf8",
    );
  }
}

export async function readStore() {
  await ensureStore();

  const raw = await readFile(env.dataFile, "utf8");

  try {
    return normalizeStore(JSON.parse(raw));
  } catch {
    const resetStore = createEmptyStore();
    await writeFile(env.dataFile, JSON.stringify(resetStore, null, 2), "utf8");
    return resetStore;
  }
}

export async function writeStore(nextStore) {
  await ensureStore();

  const normalizedStore = normalizeStore(nextStore);
  await writeFile(
    env.dataFile,
    JSON.stringify(normalizedStore, null, 2),
    "utf8",
  );

  return normalizedStore;
}

export async function updateStore(updater) {
  const job = writeQueue.then(async () => {
    const currentStore = await readStore();
    const draftStore = JSON.parse(JSON.stringify(currentStore));
    const nextStore = await updater(draftStore);
    return writeStore(nextStore ?? draftStore);
  });

  writeQueue = job.then(
    () => undefined,
    () => undefined,
  );

  return job;
}
