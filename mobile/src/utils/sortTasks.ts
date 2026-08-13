import { Task, Priority } from '../types';

const priorityWeight: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const getHoursUntilDeadline = (deadline?: string | Date): number => {
  if (!deadline) return 999999; // Default large value if no deadline provided
  const deadlineDate = new Date(deadline).getTime();
  const now = new Date().getTime();
  return (deadlineDate - now) / (1000 * 60 * 60);
};

export const calculateTaskScore = (task: Task): number => {
  const weight = priorityWeight[task.priority] ?? 1;
  const hours = getHoursUntilDeadline(task.deadline);
  return weight * 1000 + hours;
};

export const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // Completed tasks are always sorted to the bottom regardless of score
    if (a.status === 'completed' && b.status !== 'completed') {
      return 1;
    }
    if (a.status !== 'completed' && b.status === 'completed') {
      return -1;
    }

    // Sort ascending by score
    const scoreA = calculateTaskScore(a);
    const scoreB = calculateTaskScore(b);
    return scoreA - scoreB;
  });
};
