import { useState } from 'react';

export default function TaskForm({ onCreateTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateTask({ title: title.trim(), description: description.trim(), priority });
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
          rows={3}
        />
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="priority"
              value="low"
              checked={priority === 'low'}
              onChange={(e) => setPriority(e.target.value)}
            />
            <span>Low</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="priority"
              value="medium"
              checked={priority === 'medium'}
              onChange={(e) => setPriority(e.target.value)}
            />
            <span>Medium</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="priority"
              value="high"
              checked={priority === 'high'}
              onChange={(e) => setPriority(e.target.value)}
            />
            <span>High</span>
          </label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}
