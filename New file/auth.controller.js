const User = require('../models/User');
const { sendSuccess, sendError, generateToken } = require('../utils/response');

// ── POST /api/auth/register ─────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email and password are required');
    }

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError(res, 'An account with this email already exists');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    sendSuccess(res, { user, token }, 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// ── POST /api/auth/login ────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required');
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user._id);

    // Strip password before sending
    const userData = user.toJSON();

    sendSuccess(res, { user: userData, token });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// ── GET /api/auth/me ────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    sendSuccess(res, { user: req.user });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

module.exports = { register, login, getMe };
