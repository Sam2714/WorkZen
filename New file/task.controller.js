const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');

// ── GET /api/tasks ──────────────────────────────────────────
const getTasks = async (req, res) => {
  try {
    const { status, priority, sort = '-createdAt' } = req.query;

    const filter = { userId: req.user._id };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort(sort).lean();
    sendSuccess(res, { tasks, count: tasks.length });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// ── POST /api/tasks ─────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title?.trim()) {
      return sendError(res, 'Task title is required');
    }

    const task = await Task.create({
      userId: req.user._id,
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
    });

    sendSuccess(res, { task }, 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// ── PATCH /api/tasks/:id ────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status } = req.body;

    const task = await Task.findOne({ _id: id, userId: req.user._id });
    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    if (title       !== undefined) task.title       = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (priority    !== undefined) task.priority    = priority;
    if (status      !== undefined) task.status      = status;

    await task.save();
    sendSuccess(res, { task });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// ── DELETE /api/tasks/:id ───────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!task) {
      return sendError(res, 'Task not found', 404);
    }

    sendSuccess(res, { message: 'Task deleted' });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// ── GET /api/tasks/stats ────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [total, done, high, medium, low] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'done' }),
      Task.countDocuments({ userId, priority: 'high', status: 'pending' }),
      Task.countDocuments({ userId, priority: 'medium', status: 'pending' }),
      Task.countDocuments({ userId, priority: 'low', status: 'pending' }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDone = await Task.countDocuments({
      userId,
      status: 'done',
      completedAt: { $gte: today },
    });

    sendSuccess(res, {
      total,
      done,
      pending: total - done,
      rate: total ? Math.round((done / total) * 100) : 0,
      todayDone,
      byPriority: { high, medium, low },
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getStats };
