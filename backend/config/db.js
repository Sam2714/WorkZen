import { ensureStore } from "../data/store.js";

export async function connectDb() {
  await ensureStore();
}
