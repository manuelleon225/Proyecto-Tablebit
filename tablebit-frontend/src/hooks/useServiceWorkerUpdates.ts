import { useState, useEffect, useCallback } from "react";

interface SWUpdateState {
  updateAvailable: boolean;
  waitingSW: ServiceWorker | null;
  checkForUpdates: () => void;
  applyUpdate: () => void;
}

export function useServiceWorkerUpdates(): SWUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const handler = (event: Event) => {
      const target = event.target as ServiceWorkerRegistration;
      const waiting = target.waiting;
      if (waiting) {
        setUpdateAvailable(true);
        setWaitingSW(waiting);
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      setUpdateAvailable(false);
      setWaitingSW(null);
      window.location.reload();
    });
    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener("updatefound", handler);
    });
    return () => {
      navigator.serviceWorker.ready.then((reg) => {
        reg.removeEventListener("updatefound", handler);
      });
    };
  }, []);

  const checkForUpdates = useCallback(() => {
    navigator.serviceWorker.ready.then((reg) => reg.update());
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingSW) return;
    waitingSW.postMessage({ type: "SKIP_WAITING" });
  }, [waitingSW]);

  return { updateAvailable, waitingSW, checkForUpdates, applyUpdate };
}
