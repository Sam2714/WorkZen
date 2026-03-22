import { useMemo } from 'react';

export function useInsights(tasks, sessions) {
  const insights = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();

    // Streak: consecutive days with activity (done task or session)
    let streak = 0;
    let checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toDateString();
      const hasTask = tasks.some(t => t.status === 'done' && t.completedAt && new Date(t.completedAt).toDateString() === dateStr);
      const hasSession = sessions.some(s => new Date(s.date).toDateString() === dateStr);
      if (hasTask || hasSession) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Weekly activity percentage: days with activity in last 7 days / 7
    let activeDays = 0;
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const taskCount = tasks.filter(t => t.status === 'done' && t.completedAt && new Date(t.completedAt).toDateString() === dateStr).length;
      const sessionCount = sessions.filter(s => new Date(s.date).toDateString() === dateStr).length;
      const total = taskCount + sessionCount;
      last7Days.push({ date: dateStr, count: total });
      if (total > 0) activeDays++;
    }
    const weeklyPercentage = Math.round((activeDays / 7) * 100);

    return {
      streak,
      weeklyPercentage,
      last7Days
    };
  }, [tasks, sessions]);

  return insights;
}
