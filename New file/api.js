// src/services/api.js
// Central axios instance — all API calls go through here

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT token to every request ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wz_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Handle 401 globally — redirect to login ─────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wz_token');
      localStorage.removeItem('wz_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
