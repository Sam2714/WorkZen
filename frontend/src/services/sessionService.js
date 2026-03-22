const SESSIONS_KEY = 'wz3_sessions';

export const listSessions = () => {
  try {
    const sessions = localStorage.getItem(SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error listing sessions:', error);
    return [];
  }
};

export const createSession = (sessionInput) => {
  const sessions = listSessions();
  const newSession = {
    ...sessionInput,
    id: Date.now().toString(),
    date: new Date().toISOString()
  };
  sessions.push(newSession);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return newSession;
};
