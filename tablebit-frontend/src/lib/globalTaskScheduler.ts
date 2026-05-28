type TaskPriority = "critical" | "high" | "medium" | "low";

interface Task {
  id: string;
  fn: () => void;
  interval: number;
  priority: TaskPriority;
  lastRun: number;
  timerId?: any;
}

const tasks: Task[] = [];

export function scheduleTask(id: string, fn: () => void, interval: number, priority: TaskPriority = "medium"): void {
  const existing = tasks.find((t) => t.id === id);
  if (existing) {
    clearInterval(existing.timerId);
    existing.interval = interval;
    existing.priority = priority;
    existing.fn = fn;
    existing.timerId = setInterval(fn, interval);
    return;
  }
  const timerId = setInterval(fn, interval);
  tasks.push({ id, fn, interval, priority, lastRun: Date.now(), timerId });
}

export function cancelTask(id: string): void {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx > -1) {
    clearInterval(tasks[idx].timerId);
    tasks.splice(idx, 1);
  }
}

export function runTaskBatch(priority: TaskPriority): number {
  let ran = 0;
  tasks.filter((t) => t.priority === priority).forEach((t) => {
    t.fn();
    t.lastRun = Date.now();
    ran++;
  });
  return ran;
}

export function getSchedulerMetrics() {
  return { total: tasks.length, byPriority: { critical: tasks.filter((t) => t.priority === "critical").length, high: tasks.filter((t) => t.priority === "high").length, medium: tasks.filter((t) => t.priority === "medium").length, low: tasks.filter((t) => t.priority === "low").length } };
}
