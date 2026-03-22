const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
  },
  duration: {
    type: Number,
    default: 25, // minutes
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes must be under 500 characters'],
    default: '',
  },
  completed: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// ── Indexes ─────────────────────────────────────────────────
focusSessionSchema.index({ userId: 1, date: -1 });
focusSessionSchema.index({ userId: 1, taskId: 1 });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
