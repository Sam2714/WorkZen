const express = require('express');
const router  = express.Router();
const { createSession, getSessions, getInsights, deleteSession } = require('../controllers/session.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// GET  /api/sessions/insights
router.get('/insights', getInsights);

// GET  /api/sessions
// POST /api/sessions
router.route('/').get(getSessions).post(createSession);

// DELETE /api/sessions/:id
router.delete('/:id', deleteSession);

module.exports = router;
