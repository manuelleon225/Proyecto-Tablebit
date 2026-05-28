import { useState, useEffect, useCallback, useRef } from "react";

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  connectionRestored: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const wasOfflineRef = useRef(false);
  const [connectionRestored, setConnectionRestored] = useState(false);

  const handleOnline = useCallback(() => {
    if (!navigator.onLine) return;
    setIsOnline(true);
    if (wasOfflineRef.current) {
      setConnectionRestored(true);
      wasOfflineRef.current = false;
      setTimeout(() => setConnectionRestored(false), 3000);
    }
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    wasOfflineRef.current = true;
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline: wasOfflineRef.current, connectionRestored };
}
