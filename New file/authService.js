// src/services/authService.js
import api from './api';

const authService = {
  register: async ({ name, email, password }) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user, token } = res.data.data;
    localStorage.setItem('wz_token', token);
    localStorage.setItem('wz_user', JSON.stringify(user));
    return { user, token };
  },

  login: async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data.data;
    localStorage.setItem('wz_token', token);
    localStorage.setItem('wz_user', JSON.stringify(user));
    return { user, token };
  },

  logout: () => {
    localStorage.removeItem('wz_token');
    localStorage.removeItem('wz_user');
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem('wz_user'));
    } catch { return null; }
  },

  isLoggedIn: () => !!localStorage.getItem('wz_token'),
};

export default authService;
