import { verifyToken } from "../utils/auth.js";

export function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  req.user = user;
  return next();
}
