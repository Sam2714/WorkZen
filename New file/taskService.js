// src/services/taskService.js
import api from './api';

const taskService = {
  // GET /api/tasks
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/tasks${params ? '?' + params : ''}`);
    return res.data.data.tasks;
  },

  // GET /api/tasks/stats
  getStats: async () => {
    const res = await api.get('/tasks/stats');
    return res.data.data;
  },

  // POST /api/tasks
  create: async ({ title, description, priority }) => {
    const res = await api.post('/tasks', { title, description, priority });
    return res.data.data.task;
  },

  // PATCH /api/tasks/:id
  update: async (id, updates) => {
    const res = await api.patch(`/tasks/${id}`, updates);
    return res.data.data.task;
  },

  // PATCH /api/tasks/:id — toggle done/pending
  toggle: async (id, currentStatus) => {
    const status = currentStatus === 'done' ? 'pending' : 'done';
    const res = await api.patch(`/tasks/${id}`, { status });
    return res.data.data.task;
  },

  // DELETE /api/tasks/:id
  remove: async (id) => {
    await api.delete(`/tasks/${id}`);
    return id;
  },
};

export default taskService;
