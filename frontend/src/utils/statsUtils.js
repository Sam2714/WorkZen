export function calculateCompletionRate(total = 0, completed = 0) {
  if (!total) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}
