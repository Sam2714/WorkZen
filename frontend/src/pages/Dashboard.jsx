import { useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useFocusSession } from '../hooks/useFocusSession';
import { useInsights } from '../hooks/useInsights';
import Header from '../components/layout/Header';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskList from '../components/tasks/TaskList';
import FocusMode from '../components/focus/FocusMode';

export default function Dashboard() {
  const tasksHook = useTasks();
  const focusHook = useFocusSession();
  const insights = useInsights(tasksHook.allTasks, focusHook.sessions);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        focusHook.openFocusMode();
      }
      if (e.key === 'Escape' && tasksHook.editingId) {
        tasksHook.setEditing(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusHook, tasksHook]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Header />
        
        {/* Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-[var(--color-text)]">{tasksHook.stats.total}</div>
            <div className="text-sm text-[var(--color-muted)]">Total Tasks</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-[var(--color-text)]">{tasksHook.stats.pending}</div>
            <div className="text-sm text-[var(--color-muted)]">Active</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-[var(--color-text)]">{tasksHook.stats.completionRate}%</div>
            <div className="text-sm text-[var(--color-muted)]">Completion Rate</div>
          </div>
          <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-[var(--color-text)]">{insights.streak}</div>
            <div className="text-sm text-[var(--color-muted)]">Day Streak</div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-[var(--color-surface)] p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold mb-4">Last 7 Days Activity</h3>
          <div className="flex items-end space-x-2 h-32">
            {insights.last7Days.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-[var(--color-accent)] rounded-t"
                  style={{ height: `${Math.max((day.count / 10) * 100, 4)}%` }}
                ></div>
                <div className="text-xs text-[var(--color-muted)] mt-2">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          <TaskForm onCreateTask={tasksHook.createTask} />
          
          <TaskFilters
            filter={tasksHook.filter}
            setFilter={tasksHook.setFilter}
            search={tasksHook.search}
            setSearch={tasksHook.setSearch}
          />
          
          <TaskList
            tasks={tasksHook.tasks}
            onToggle={tasksHook.toggleTask}
            onEdit={() => {}}
            onDelete={tasksHook.deleteTask}
            onUpdate={tasksHook.updateTask}
            editingId={tasksHook.editingId}
            setEditing={tasksHook.setEditing}
            filter={tasksHook.filter}
            search={tasksHook.search}
          />
        </div>
      </div>

      <FocusMode
        isOpen={focusHook.isFocusModeOpen}
        timeLeft={focusHook.timeLeft}
        isActive={focusHook.isActive}
        isPaused={focusHook.isPaused}
        onStart={focusHook.start}
        onPause={focusHook.pause}
        onReset={focusHook.reset}
        onExit={focusHook.exit}
      />
    </div>
  );
}
