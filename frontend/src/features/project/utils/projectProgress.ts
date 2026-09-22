import type { Task } from '@/features/task/types/task.types';
import type { TaskStatus } from '@/types/common';

const SCORE: Record<TaskStatus, number> = {
  TODO: 25,
  IN_PROGRESS: 50,
  IN_REVIEW: 75,
  DONE: 100,
};

export function projectProgressPercent(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const sum = tasks.reduce((total, t) => total + (SCORE[t.status] ?? 25), 0);
  return Math.min(100, Math.round(sum / tasks.length));
}