import TaskCard from './TaskCard';

export default function TaskList({ tasks, onToggle, onEdit, onDelete, onUpdate, editingId, setEditing, filter, search }) {
  if (tasks.length === 0) {
    const message = search
      ? `No tasks found for "${search}"`
      : filter === 'pending'
      ? 'No active tasks'
      : filter === 'done'
      ? 'No completed tasks'
      : 'No tasks yet. Create your first task!';
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-muted)]">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onUpdate}
          isEditing={editingId === task.id}
          setEditing={setEditing}
        />
      ))}
    </div>
  );
}
