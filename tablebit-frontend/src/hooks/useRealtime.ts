import { useState, useEffect } from "react";
import { subscribe, connect, disconnect, getConnectionState, getLatency } from "@/lib/realtimeClient";

export function useRealtime(channel: string, callback?: (event: any) => void) {
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    connect();
    const unsub = subscribe(channel, (event) => {
      setLastEvent(event);
      callback?.(event);
    });
    return () => { unsub(); disconnect(); };
  }, [channel]);

  return { lastEvent, connectionState: getConnectionState(), latency: getLatency() };
}

export function useConnectionStatus() {
  const [status, setStatus] = useState(getConnectionState());
  const [currentLatency, setLatency] = useState(getLatency());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getConnectionState());
      setLatency(getLatency());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { status, latency: currentLatency };
}
