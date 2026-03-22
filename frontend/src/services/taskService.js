const TASKS_KEY = 'wz3_tasks';

export const listTasks = () => {
  try {
    const tasks = localStorage.getItem(TASKS_KEY);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error listing tasks:', error);
    return [];
  }
};

export const createTask = (taskInput) => {
  const tasks = listTasks();
  const newTask = {
    ...taskInput,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  tasks.push(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return newTask;
};

export const updateTask = (taskId, updates) => {
  const tasks = listTasks();
  const updatedTasks = tasks.map(task =>
    task.id === taskId ? { ...task, ...updates } : task
  );
  localStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  return updatedTasks.find(task => task.id === taskId);
};

export const deleteTask = (taskId) => {
  const tasks = listTasks();
  const filteredTasks = tasks.filter(task => task.id !== taskId);
  localStorage.setItem(TASKS_KEY, JSON.stringify(filteredTasks));
};

export const toggleTask = (taskId) => {
  const task = listTasks().find(t => t.id === taskId);
  if (!task) return;
  const newStatus = task.status === 'pending' ? 'done' : 'pending';
  const updates = { status: newStatus };
  if (newStatus === 'done') {
    updates.completedAt = new Date().toISOString();
  } else {
    updates.completedAt = undefined;
  }
  return updateTask(taskId, updates);
};
