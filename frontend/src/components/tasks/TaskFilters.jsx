export default function TaskFilters({ filter, setFilter, search, setSearch }) {
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Active' },
    { key: 'done', label: 'Done' }
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div className="flex space-x-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-border)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
    </div>
  );
}
