import { getConnectionState, getLatency, getReconnectCount } from "@/lib/realtimeClient";
import { isLeaderTab } from "@/lib/realtimeLeader";

let desyncDetected = 0;
let staleListeners = 0;
let invalidChannels = 0;

export function validateRealtimePipeline(): { healthy: boolean; issues: string[] } {
  const issues: string[] = [];
  const conn = getConnectionState();

  if (conn === "disconnected") issues.push("realtime disconnected");
  if (conn === "degraded") issues.push("realtime degraded");
  if (getLatency() > 2000) issues.push("high latency");
  if (getReconnectCount() > 10) issues.push("excessive reconnects");

  return { healthy: issues.length === 0, issues };
}

export function repairRealtimePipeline(): { repairs: number } {
  let repairs = 0;
  if (getConnectionState() === "disconnected") {
    const { connect } = require("@/lib/realtimeClient");
    connect();
    repairs++;
  }
  staleListeners = 0;
  invalidChannels = 0;
  return { repairs };
}

export function getRealtimeHealth() {
  return {
    healthy: validateRealtimePipeline().healthy,
    desync: desyncDetected,
    staleListeners,
    invalidChannels,
    connectionState: getConnectionState(),
    isLeader: isLeaderTab(),
    latency: getLatency(),
  };
}

export function trackDesync(): void { desyncDetected++; }
export function trackStaleListener(): void { staleListeners++; }
