const errorStore: Record<string, number> = {};

export function aggregateError(category: string): void {
  errorStore[category] = (errorStore[category] || 0) + 1;
}

export function getErrorSummary(): Record<string, number> {
  return { ...errorStore };
}

export function clearErrorSummary(): void {
  Object.keys(errorStore).forEach((k) => delete errorStore[k]);
}
