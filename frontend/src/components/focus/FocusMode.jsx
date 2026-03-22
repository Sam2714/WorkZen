import { useEffect } from 'react';
import SessionRing from './SessionRing';

const SESSION_DURATION = 25 * 60;

export default function FocusMode({ isOpen, timeLeft, isActive, isPaused, onStart, onPause, onReset, onExit }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onExit();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-bg)] rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onExit}
          className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          ×
        </button>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">Focus Session</h2>
          <p className="text-[var(--color-muted)]">25-minute focus period</p>
        </div>
        <div className="flex justify-center mb-8">
          <SessionRing timeLeft={timeLeft} totalTime={SESSION_DURATION} />
        </div>
        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <button
              onClick={onStart}
              className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Start
            </button>
          ) : isPaused ? (
            <button
              onClick={onStart}
              className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Pause
            </button>
          )}
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Reset
          </button>
        </div>
        {timeLeft === 0 && (
          <div className="mt-6 text-center">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              Session Complete! 🎉
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
