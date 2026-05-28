const CHANNEL_NAME = "tablebit-pwa";

let channel: BroadcastChannel | null = null;

try {
  channel = new BroadcastChannel(CHANNEL_NAME);
} catch { /* BroadcastChannel not available */ }

export function broadcastEvent(type: string, payload?: any): void {
  if (!channel) return;
  channel.postMessage({ type, payload, timestamp: Date.now() });
}

export function listenForEvents(callback: (event: MessageEvent) => void): () => void {
  if (!channel) return () => {};
  channel.addEventListener("message", callback);
  return () => channel.removeEventListener("message", callback);
}
