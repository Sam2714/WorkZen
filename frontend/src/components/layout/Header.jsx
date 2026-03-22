import { useFocusSession } from '../../hooks/useFocusSession';

export default function Header() {
  const { openFocusMode } = useFocusSession();

  return (
    <header className="flex items-center justify-between py-6">
      <h1 className="text-3xl font-bold text-[var(--color-text)]">WorkZen</h1>
      <button
        onClick={openFocusMode}
        className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        Focus Mode
      </button>
    </header>
  );
}
