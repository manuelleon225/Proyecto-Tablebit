import { getConnectionState, getLatency, getReconnectCount, getDuplicateEventsPrevented, getAvgPollDuration } from "@/lib/realtimeClient";
import { isLeaderTab } from "@/lib/realtimeLeader";

let eventsPerMinute = 0;
let eventCount = 0;

if (typeof window !== "undefined") {
  setInterval(() => { eventsPerMinute = eventCount; eventCount = 0; }, 60000);
}

export function trackRealtimeEvent(): void { eventCount++; }

export function getLiveMetrics() {
  return {
    connected: getConnectionState(),
    latency: getLatency(),
    pollAvg: getAvgPollDuration(),
    eventsPerMinute,
    leader: isLeaderTab(),
    reconnects: getReconnectCount(),
    duplicatesPrevented: getDuplicateEventsPrevented(),
  };
}

export function logLiveMetrics(): void {
  if (!import.meta.env.DEV) return;
  const m = getLiveMetrics();
  console.log(
    `%c[Realtime] ${m.connected} | latency: ${m.latency}ms | poll: ${m.pollAvg}ms | events/min: ${m.eventsPerMinute} | leader: ${m.leader} | reconnects: ${m.reconnects} | dup prevented: ${m.duplicatesPrevented}`,
    "color:#38bdf8;font-weight:bold"
  );
}

if (import.meta.env.DEV) setInterval(() => logLiveMetrics(), 30000);
