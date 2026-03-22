import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { env } from "../config/env.js";

const KEY_LENGTH = 64;
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function deriveKey(password, salt) {
  return scryptSync(password, salt, KEY_LENGTH);
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = deriveKey(password, salt).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, storedDigest] = storedHash.split(":");
  const expected = Buffer.from(storedDigest, "hex");
  const actual = deriveKey(password, salt);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function createToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      exp: Date.now() + TOKEN_TTL_MS,
    }),
  ).toString("base64url");

  const signature = createHmac("sha256", env.jwtSecret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  const expectedSignature = createHmac("sha256", env.jwtSecret)
    .update(payload)
    .digest("base64url");

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length) {
    return null;
  }

  if (!timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );

    if (!decoded?.exp || decoded.exp < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
