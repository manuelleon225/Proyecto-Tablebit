import { useState, useEffect } from "react";

interface OfflineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  connectionRestored: boolean;
}

export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [connectionRestored, setConnectionRestored] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      if (!navigator.onLine) return;
      if (wasOffline) {
        setConnectionRestored(true);
        setTimeout(() => setConnectionRestored(false), 3000);
        setWasOffline(false);
      }
      setIsOnline(true);
    };
    const goOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setConnectionRestored(false);
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline, connectionRestored };
}
