import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(backendRoot, "..");

function loadOptionalEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const normalized = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length).trim()
      : trimmed;
    const separatorIndex = normalized.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();

    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }

    let value = normalized.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadOptionalEnvFile(path.resolve(backendRoot, ".env"));
loadOptionalEnvFile(path.resolve(workspaceRoot, ".env"));

function resolveDataFile(dataFilePath) {
  if (!dataFilePath) {
    return path.resolve(backendRoot, "data", "database.json");
  }

  return path.isAbsolute(dataFilePath)
    ? dataFilePath
    : path.resolve(backendRoot, dataFilePath);
}

const configuredClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const clientOrigins = Array.from(
  new Set(
    [configuredClientUrl, "http://localhost:5173", "http://localhost:4173"].filter(
      Boolean,
    ),
  ),
);

function parseOriginList(value) {
  return Array.from(
    new Set(
      String(value || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  );
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  clientUrl: configuredClientUrl,
  clientOrigins,
  jwtSecret: process.env.JWT_SECRET || "workzen-dev-secret",
  dataFile: resolveDataFile(process.env.DATA_FILE),
  backendRoot,
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiTranscribeModel:
    process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe",
  extensionOrigins: parseOriginList(process.env.EXTENSION_ORIGINS),
};
