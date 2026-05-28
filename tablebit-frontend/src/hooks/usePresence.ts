import { useState, useEffect } from "react";
import { subscribe } from "@/lib/realtimeClient";

export function usePresence() {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const unsub = subscribe("presence", (event) => {
      if (event.payload?.active_users !== undefined) {
        setActiveUsers(event.payload.active_users);
      }
    });
    return unsub;
  }, []);

  return { activeUsers };
}
