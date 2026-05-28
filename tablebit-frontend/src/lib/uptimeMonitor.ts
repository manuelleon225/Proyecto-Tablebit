let sessionStart = Date.now();
let downtimeCount = 0;

export function trackUptime(): void {
  if (!navigator.onLine) downtimeCount++;
}

export function getUptimeMetrics() {
  const uptime = Date.now() - sessionStart;
  return {
    uptimeMs: uptime,
    uptimeHours: Math.round(uptime / 3600000),
    downtimeEvents: downtimeCount,
    availability: uptime > 0 ? Math.round((1 - downtimeCount / Math.max(1, Math.round(uptime / 60000))) * 10000) / 100 : 100,
  };
}

setInterval(trackUptime, 60000);
