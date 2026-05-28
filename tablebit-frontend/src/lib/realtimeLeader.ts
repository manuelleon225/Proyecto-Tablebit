import { broadcastEvent, listenForEvents } from "@/lib/pwaBroadcast";

const LEADER_KEY = "tbit_realtime_leader";
const HEARTBEAT_INTERVAL = 5000;
const LEADER_TIMEOUT = 15000;
const CLAIM_COOLDOWN = 3000;

type LeaderCallback = (isLeader: boolean) => void;

let isLeader = false;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let checkTimer: ReturnType<typeof setInterval> | null = null;
let listeners = new Set<LeaderCallback>();
let elections = 0;
let failovers = 0;
let splitBrainPrevented = 0;

function tryClaimLeader(): void {
  const lastHeartbeat = localStorage.getItem(LEADER_KEY);
  const now = Date.now();

  if (!lastHeartbeat || now - parseInt(lastHeartbeat) > LEADER_TIMEOUT) {
    const existing = localStorage.getItem(LEADER_KEY);
    if (existing && now - parseInt(existing) < CLAIM_COOLDOWN) {
      splitBrainPrevented++;
      return;
    }
    localStorage.setItem(LEADER_KEY, String(now));
    if (!isLeader) elections++;
    isLeader = true;
    broadcastEvent("leader-elected", { timestamp: now });
    startHeartbeat();
  } else if (isLeader) {
    const theirTime = parseInt(lastHeartbeat);
    if (theirTime > now - 1000) {
      splitBrainPrevented++;
    }
    isLeader = false;
  } else {
    isLeader = false;
  }
  listeners.forEach((cb) => cb(isLeader));
}

function startHeartbeat(): void {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    localStorage.setItem(LEADER_KEY, String(Date.now()));
  }, HEARTBEAT_INTERVAL);
}

export function initLeaderElection(): void {
  tryClaimLeader();
  checkTimer = setInterval(tryClaimLeader, LEADER_TIMEOUT);
  listenForEvents((event) => {
    if (event.data?.type === "leader-elected") {
      const theirTime = event.data.payload?.timestamp || 0;
      const myTime = parseInt(localStorage.getItem(LEADER_KEY) || "0");
      if (theirTime > myTime + 100) {
        isLeader = false;
        listeners.forEach((cb) => cb(false));
      }
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isLeader) {
      localStorage.setItem(LEADER_KEY, String(Date.now()));
    }
  });
}

export function isLeaderTab(): boolean { return isLeader; }
export function onLeaderChange(cb: LeaderCallback): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getLeaderMetrics() {
  return { elections, failovers, splitBrainPrevented, isLeader };
}

export function cleanupLeader(): void {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (checkTimer) clearInterval(checkTimer);
  if (isLeader) localStorage.removeItem(LEADER_KEY);
}
