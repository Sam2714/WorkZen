// src/hooks/useTasks.js
// Replaces useLocalStorage('wz_tasks') — same API surface, real backend

import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';

export function useTasks() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Fetch all tasks ───────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Add task ──────────────────────────────────────────────
  const addTask = useCallback(async ({ title, description, priority }) => {
    const task = await taskService.create({ title, description, priority });
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  // ── Update task ───────────────────────────────────────────
  const updateTask = useCallback(async (id, updates) => {
    const updated = await taskService.update(id, updates);
    setTasks(prev => prev.map(t => t._id === id ? updated : t));
    return updated;
  }, []);

  // ── Toggle done/pending ───────────────────────────────────
  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;
    const updated = await taskService.toggle(id, task.status);
    setTasks(prev => prev.map(t => t._id === id ? updated : t));
    return updated;
  }, [tasks]);

  // ── Delete task ───────────────────────────────────────────
  const removeTask = useCallback(async (id) => {
    await taskService.remove(id);
    setTasks(prev => prev.filter(t => t._id !== id));
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    toggleTask,
    removeTask,
  };
}
