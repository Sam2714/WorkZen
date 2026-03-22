const jwt = require('jsonwebtoken');

// ── Standard success response ───────────────────────────────
const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

// ── Standard error response ─────────────────────────────────
const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({ success: false, error: message });
};

// ── Generate JWT ────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { sendSuccess, sendError, generateToken };
