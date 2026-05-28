const STORAGE_KEY = "tbit_runtime_learning";
const MAX_HISTORY = 100;

interface LearningEntry {
  type: string;
  outcome: string;
  timestamp: number;
}

function getHistory(): LearningEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveHistory(history: LearningEntry[]): void {
  if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function recordLearning(type: string, outcome: string): void {
  const history = getHistory();
  history.push({ type, outcome, timestamp: Date.now() });
  saveHistory(history);
}

export function getLearningInsights(): { total: number; recentSuccess: number } {
  const history = getHistory();
  const recent = history.filter((e) => Date.now() - e.timestamp < 3600000);
  return { total: history.length, recentSuccess: recent.filter((e) => e.outcome === "success").length };
}
