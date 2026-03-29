export function errorMiddleware(error, _req, res, _next) {
  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Audio upload must be 10 MB or smaller." });
  }

  const status = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(status).json({ message });
}
