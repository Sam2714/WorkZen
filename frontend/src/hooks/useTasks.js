import { useState, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import * as taskService from '../services/taskService';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage('wz3_tasks', []);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (filter === 'pending') {
      filtered = filtered.filter(t => t.status === 'pending');
    } else if (filter === 'done') {
      filtered = filtered.filter(t => t.status === 'done');
    }
    if (search) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    // Group active above completed
    const pending = filtered.filter(t => t.status === 'pending');
    const done = filtered.filter(t => t.status === 'done');
    return [...pending, ...done];
  }, [tasks, filter, search]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    const today = new Date().toDateString();
    const todayDone = tasks.filter(t =>
      t.status === 'done' && t.completedAt && new Date(t.completedAt).toDateString() === today
    ).length;
    return { total, pending, done, completionRate, todayDone };
  }, [tasks]);

  const createTask = (taskInput) => {
    const newTask = taskService.createTask(taskInput);
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id, updates) => {
    const updatedTask = taskService.updateTask(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
  };

  const deleteTask = (id) => {
    taskService.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = (id) => {
    const updatedTask = taskService.toggleTask(id);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
  };

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    setFilter,
    search,
    setSearch,
    editingId,
    setEditingId,
    stats,
    createTask,
    updateTask,
    deleteTask,
    toggleTask
  };
}
