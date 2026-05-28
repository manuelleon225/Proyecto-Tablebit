import api from "@/services/api";
import { isLeaderTab, initLeaderElection } from "@/lib/realtimeLeader";
import { emit as busEmit } from "@/lib/realtimeEventBus";

type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting" | "degraded";
type EventCallback = (event: any) => void;

interface RealtimeEvent {
  type: string;
  channel: string;
  payload: any;
  timestamp: string;
}

let state: ConnectionState = "disconnected";
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let lastTimestamp: string | null = null;
let subscribers = new Map<string, Set<EventCallback>>();
let latency = 0;
let pollCount = 0;
let reconnectCount = 0;
let duplicateEventsPrevented = 0;
let pollDurations: number[] = [];
let leaderInitiated = false;
let isPolling = false;

export function getConnectionState(): ConnectionState { return state; }
export function getLatency(): number { return latency; }
export function getReconnectCount(): number { return reconnectCount; }
export function getDuplicateEventsPrevented(): number { return duplicateEventsPrevented; }
export function getAvgPollDuration(): number {
  return pollDurations.length > 0 ? Math.round(pollDurations.reduce((a, b) => a + b, 0) / pollDurations.length) : 0;
}

function getPollInterval(): number {
  if (state === "degraded") return 20000;
  if (document.hidden) return 10000;
  const conn = (navigator as any).connection?.effectiveType;
  if (conn === "slow-2g") return 20000;
  if (conn === "2g") return 15000;
  if (conn === "3g") return 8000;
  return 3000;
}

export function connect(): void {
  if (state === "connected" || state === "connecting") return;
  if (!leaderInitiated) { initLeaderElection(); leaderInitiated = true; }
  state = "connecting";
  schedulePoll();
}

export function disconnect(): void {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  state = "disconnected";
}

function schedulePoll(): void {
  const doPoll = async () => {
    if (isPolling) { schedulePoll(); return; }
    if (subscribers.size === 0) { schedulePoll(); return; }
    if (!isLeaderTab()) { schedulePoll(); return; }
    isPolling = true;
    const start = performance.now();
    try {
      const res = await api.get("/realtime/poll", {
        params: { since: lastTimestamp, channel: "tablebit.realtime" },
      });
      latency = Math.round(performance.now() - start);
      pollDurations.push(latency);
      if (pollDurations.length > 20) pollDurations.shift();
      lastTimestamp = res.data.timestamp;
      const events: RealtimeEvent[] = res.data.events || [];
      events.forEach((ev) => {
        busEmit(ev.type, ev);
        const subs = subscribers.get(ev.channel) || subscribers.get("*");
        subs?.forEach((cb) => cb(ev));
      });
      if (state === "reconnecting") state = "connected";
    } catch {
      reconnectCount++;
      state = state === "connected" ? "reconnecting" : "degraded";
    }
    isPolling = false;
    pollCount++;
    schedulePoll();
  };

  pollTimer = setTimeout(doPoll, getPollInterval()) as any;
}

export function subscribe(channel: string, callback: EventCallback): () => void {
  if (!subscribers.has(channel)) subscribers.set(channel, new Set());
  subscribers.get(channel)!.add(callback);
  return () => { subscribers.get(channel)?.delete(callback); };
}

export function subscribeAll(callback: EventCallback): () => void {
  return subscribe("*", callback);
}
