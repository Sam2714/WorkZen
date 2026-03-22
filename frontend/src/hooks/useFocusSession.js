import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import * as sessionService from '../services/sessionService';

const SESSION_DURATION = 25 * 60; // 25 minutes in seconds

export function useFocusSession() {
  const [sessions, setSessions] = useLocalStorage('wz3_sessions', []);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsPaused(false);
            // Log session
            const newSession = sessionService.createSession({});
            setSessions(prevSessions => [...prevSessions, newSession]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeLeft, setSessions]);

  const start = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsPaused(true);
  };

  const reset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(SESSION_DURATION);
  };

  const exit = () => {
    setIsFocusModeOpen(false);
    reset();
  };

  const openFocusMode = () => {
    setIsFocusModeOpen(true);
    reset();
  };

  const todaySessions = sessions.filter(s =>
    new Date(s.date).toDateString() === new Date().toDateString()
  ).length;

  return {
    isFocusModeOpen,
    openFocusMode,
    exit,
    timeLeft,
    isActive,
    isPaused,
    start,
    pause,
    reset,
    todaySessions,
    sessions
  };
}
