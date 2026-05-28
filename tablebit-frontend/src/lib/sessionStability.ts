let sessionStart = Date.now();
let driftCount = 0;

export function checkSessionStability(): { stable: boolean; uptime: number; issues: string[] } {
  const issues: string[] = [];
  const uptime = Date.now() - sessionStart;

  if (uptime > 3600000 && driftCount > 5) issues.push("runtime drift detected");
  if (uptime > 7200000) issues.push("long session >2h");

  return { stable: issues.length === 0, uptime, issues };
}

export function getSessionMetrics() {
  return {
    uptime: Date.now() - sessionStart,
    driftCount,
    healthy: driftCount < 5,
  };
}
