// src/hooks/useSessions.js
import { useState, useEffect, useCallback } from 'react';
import sessionService from '../services/sessionService';

export function useSessions() {
  const [sessions,  setSessions]  = useState([]);
  const [insights,  setInsights]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const [data, ins] = await Promise.all([
        sessionService.getAll({ days: 60 }),
        sessionService.getInsights(),
      ]);
      setSessions(data);
      setInsights(ins);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const logSession = useCallback(async ({ taskId, duration, notes, date }) => {
    const session = await sessionService.log({ taskId, duration, notes, date });
    setSessions(prev => [session, ...prev]);
    // Refresh insights after logging
    sessionService.getInsights().then(setInsights).catch(() => {});
    return session;
  }, []);

  const removeSession = useCallback(async (id) => {
    await sessionService.remove(id);
    setSessions(prev => prev.filter(s => s._id !== id));
  }, []);

  return {
    sessions,
    insights,
    loading,
    error,
    fetchSessions,
    logSession,
    removeSession,
  };
}
