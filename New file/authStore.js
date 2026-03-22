// src/store/authStore.js
// Lightweight global auth state using React context + useReducer
// Drop-in replacement — no Zustand or Redux needed

import { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const initialState = {
  user:    authService.getCurrentUser(),
  token:   localStorage.getItem('wz_token') || null,
  loading: false,
  error:   null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, loading: false, user: action.user, token: action.token, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    case 'LOGOUT':
      return { ...initialState, user: null, token: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const register = async (data) => {
    dispatch({ type: 'LOADING' });
    try {
      const { user, token } = await authService.register(data);
      dispatch({ type: 'SUCCESS', user, token });
      return { ok: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Registration failed';
      dispatch({ type: 'ERROR', error });
      return { ok: false, error };
    }
  };

  const login = async (data) => {
    dispatch({ type: 'LOADING' });
    try {
      const { user, token } = await authService.login(data);
      dispatch({ type: 'SUCCESS', user, token });
      return { ok: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed';
      dispatch({ type: 'ERROR', error });
      return { ok: false, error };
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
