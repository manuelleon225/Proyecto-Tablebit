import { useState, useEffect, useRef, useCallback } from "react";

interface StreamEvent {
  type: string;
  timestamp: string;
  data: any;
}

const MAX_BUFFER = 100;
const RECONNECT_DELAY = 3000;

export function useRealtimeStream(types?: string[]) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pausedRef = useRef(false);
  const bufferRef = useRef<StreamEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const updateBuffer = useCallback((event: StreamEvent) => {
    const buf = bufferRef.current;
    buf.push(event);
    if (buf.length > MAX_BUFFER) buf.shift();
    if (!pausedRef.current) setEvents([...buf]);
  }, []);

  const connect = useCallback(() => {
    const token = localStorage.getItem("tablebit_token");
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/admin/stream?token=${token}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setIsConnected(true);

    es.onmessage = (e) => {
      try {
        const parsed: StreamEvent = JSON.parse(e.data);
        if (types && !types.includes(parsed.type)) return;
        updateBuffer(parsed);
      } catch { /* ignore parse errors */ }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      setTimeout(connect, RECONNECT_DELAY);
    };
  }, [types, updateBuffer]);

  useEffect(() => {
    connect();
    return () => { eventSourceRef.current?.close(); };
  }, [connect]);

  const pause = useCallback(() => { pausedRef.current = true; setIsPaused(true); }, []);
  const resume = useCallback(() => { pausedRef.current = false; setEvents([...bufferRef.current]); setIsPaused(false); }, []);

  return { events, isConnected, isPaused, pause, resume };
}
