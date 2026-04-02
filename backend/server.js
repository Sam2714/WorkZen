import express from "express";
import cors from "cors";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import voiceRoutes from "./routes/voice.routes.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildDir = path.resolve(__dirname, "../frontend/dist");
const clientIndexFile = path.join(clientBuildDir, "index.html");
const hasClientBuild = existsSync(clientIndexFile);

function isAllowedExtensionOrigin(origin) {
  if (!origin) {
    return false;
  }

  if (env.extensionOrigins.includes(origin)) {
    return true;
  }

  return /^(chrome-extension|edge-extension|moz-extension):\/\/.+$/i.test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientOrigins.includes(origin) || isAllowedExtensionOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    environment: env.nodeEnv,
    frontendServed: hasClientBuild,
    voiceConfigured: Boolean(env.openaiApiKey),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/voice", voiceRoutes);

if (hasClientBuild) {
  app.use(express.static(clientBuildDir));

  app.get(/^(?!\/api(?:\/|$)|\/health$).*/, (_req, res) => {
    res.sendFile(clientIndexFile);
  });
}

app.use(errorMiddleware);

async function startServer() {
  await connectDb();

  app.listen(env.port, () => {
    console.log(`WorkZen backend listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
