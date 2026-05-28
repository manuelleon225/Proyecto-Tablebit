export function scanTechnicalDebt(): { score: number; issues: string[]; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("tbit_") && key.endsWith("_legacy")) {
      issues.push(`legacy key: ${key}`);
      recommendations.push(`remove ${key}`);
    }
  }

  const score = Math.max(0, 100 - issues.length * 10);
  return { score, issues, recommendations };
}
