const FocusSession = require('../models/FocusSession');
const { sendSuccess, sendError } = require('../utils/response');

// ── POST /api/sessions ──────────────────────────────────────
const createSession = async (req, res) => {
  try {
    const { taskId, duration, notes, date } = req.body;

    const session = await FocusSession.create({
      userId:   req.user._id,
      taskId:   taskId  || null,
      duration: duration || 25,
      notes:    notes   || '',
      date:     date    ? new Date(date) : new Date(),
    });

    // Populate linked task name if present
    await session.populate('taskId', 'title');

    sendSuccess(res, { session }, 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// ── GET /api/sessions ───────────────────────────────────────
const getSessions = async (req, res) => {
  try {
    const { limit = 50, days } = req.query;
    const filter = { userId: req.user._id };

    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(days));
      filter.date = { $gte: cutoff };
    }

    const sessions = await FocusSession.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('taskId', 'title')
      .lean();

    sendSuccess(res, { sessions, count: sessions.length });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// ── GET /api/sessions/insights ──────────────────────────────
const getInsights = async (req, res) => {
  try {
    const userId  = req.user._id;
    const today   = new Date(); today.setHours(0,0,0,0);
    const week    = new Date(); week.setDate(week.getDate() - 7);

    const [total, todaySessions, weekSessions] = await Promise.all([
      FocusSession.countDocuments({ userId }),
      FocusSession.countDocuments({ userId, date: { $gte: today } }),
      FocusSession.countDocuments({ userId, date: { $gte: week } }),
    ]);

    // Build last 7 days activity
    const last7 = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end   = new Date(d); end.setHours(23, 59, 59, 999);
        const count = await FocusSession.countDocuments({
          userId, date: { $gte: start, $lte: end },
        });
        return {
          label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2).toUpperCase(),
          count,
          today: i === 6,
        };
      })
    );

    // Calculate streak
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const s = new Date(d); s.setHours(0,0,0,0);
      const e = new Date(d); e.setHours(23,59,59,999);
      const count = await FocusSession.countDocuments({ userId, date: { $gte: s, $lte: e } });
      if (count > 0) streak++;
      else break;
    }

    sendSuccess(res, {
      total,
      totalMinutes: total * 25,
      todaySessions,
      weekSessions,
      streak,
      last7,
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

// ── DELETE /api/sessions/:id ────────────────────────────────
const deleteSession = async (req, res) => {
  try {
    const session = await FocusSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!session) return sendError(res, 'Session not found', 404);
    sendSuccess(res, { message: 'Session deleted' });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

module.exports = { createSession, getSessions, getInsights, deleteSession };
