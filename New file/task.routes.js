const express = require('express');
const router  = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getStats } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');

// All task routes are protected
router.use(protect);

// GET  /api/tasks/stats
router.get('/stats', getStats);

// GET  /api/tasks
// POST /api/tasks
router.route('/').get(getTasks).post(createTask);

// PATCH  /api/tasks/:id
// DELETE /api/tasks/:id
router.route('/:id').patch(updateTask).delete(deleteTask);

module.exports = router;
