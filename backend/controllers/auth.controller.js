import { randomUUID } from "node:crypto";
import { updateStore, readStore } from "../data/store.js";
import { created, ok } from "../utils/response.js";
import {
  createToken,
  hashPassword,
  sanitizeUser,
  verifyPassword,
} from "../utils/auth.js";

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeCredentials(body = {}) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();

  if (!email || !email.includes("@")) {
    throw httpError(400, "A valid email address is required.");
  }

  if (password.length < 6) {
    throw httpError(400, "Password must be at least 6 characters long.");
  }

  return {
    email,
    password,
    name: name || email.split("@")[0],
  };
}

export async function register(req, res) {
  const { email, password, name } = normalizeCredentials(req.body);

  let newUser;

  await updateStore((store) => {
    const existingUser = store.users.find((user) => user.email === email);

    if (existingUser) {
      throw httpError(409, "An account with that email already exists.");
    }

    newUser = {
      id: randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    return store;
  });

  return created(res, {
    user: sanitizeUser(newUser),
    token: createToken(newUser),
  });
}

export async function login(req, res) {
  const { email, password } = normalizeCredentials(req.body);
  const store = await readStore();
  const user = store.users.find((candidate) => candidate.email === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw httpError(401, "Invalid email or password.");
  }

  return ok(res, {
    user: sanitizeUser(user),
    token: createToken(user),
  });
}
