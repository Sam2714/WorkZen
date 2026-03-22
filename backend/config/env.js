import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");

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

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  clientUrl: configuredClientUrl,
  clientOrigins,
  jwtSecret: process.env.JWT_SECRET || "workzen-dev-secret",
  dataFile: resolveDataFile(process.env.DATA_FILE),
  backendRoot,
};
