import { useState } from 'react';

export default function TaskCard({ task, onToggle, onEdit, onDelete, onUpdate, isEditing, setEditing }) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);

  const handleDoubleClick = () => {
    if (task.status === 'pending') {
      setEditing(task.id);
    }
  };

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority
    });
    setEditing(null);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditing(null);
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  if (isEditing) {
    return (
      <div className="bg-[var(--color-surface)] p-4 rounded-lg shadow-sm border">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
            rows={2}
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
            className="px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-[var(--color-accent)] text-white rounded hover:bg-[var(--color-accent-hover)]"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[var(--color-surface)] p-4 rounded-lg shadow-sm border cursor-pointer ${
        task.status === 'done' ? 'opacity-75' : ''
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={task.status === 'done'}
              onChange={() => onToggle(task.id)}
              className="w-4 h-4 text-[var(--color-accent)] focus:ring-[var(--color-accent)] border-[var(--color-border)] rounded"
            />
            <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-[var(--color-muted)]' : ''}`}>
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className={`mt-2 text-sm text-[var(--color-muted)] ${task.status === 'done' ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}
          <div className="mt-2 flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className="text-xs text-[var(--color-muted)]">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-500 hover:text-red-700 ml-2"
        >
          ×
        </button>
      </div>
    </div>
  );
}
