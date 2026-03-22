// src/services/sessionService.js
import api from './api';

const sessionService = {
  // GET /api/sessions
  getAll: async ({ limit = 50, days } = {}) => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit);
    if (days)  params.set('days', days);
    const res = await api.get(`/sessions?${params.toString()}`);
    return res.data.data.sessions;
  },

  // GET /api/sessions/insights
  getInsights: async () => {
    const res = await api.get('/sessions/insights');
    return res.data.data;
  },

  // POST /api/sessions
  log: async ({ taskId, duration, notes, date }) => {
    const res = await api.post('/sessions', {
      taskId:   taskId   || null,
      duration: duration || 25,
      notes:    notes    || '',
      date:     date     || new Date().toISOString(),
    });
    return res.data.data.session;
  },

  // DELETE /api/sessions/:id
  remove: async (id) => {
    await api.delete(`/sessions/${id}`);
    return id;
  },
};

export default sessionService;
