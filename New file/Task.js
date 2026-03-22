const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title must be under 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description must be under 1000 characters'],
    default: '',
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending',
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// ── Auto-set completedAt when status changes to done ────────
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.completedAt = this.status === 'done' ? new Date() : null;
  }
  next();
});

// ── Indexes for fast querying ───────────────────────────────
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
