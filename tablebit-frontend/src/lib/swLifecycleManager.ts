type SWState = "installing" | "waiting" | "activating" | "active" | "redundant";

let currentState: SWState = "installing";

export function getSWState(): SWState { return currentState; }
export function setSWState(s: SWState): void { currentState = s; }

export function isSWStable(): boolean {
  return currentState === "active";
}

export function monitorSWLifecycle(): () => void {
  if (!("serviceWorker" in navigator)) return () => {};
  let interval: ReturnType<typeof setInterval>;

  navigator.serviceWorker.ready.then((reg) => {
    if (reg.active) setSWState("active");
    if (reg.waiting) setSWState("waiting");
    if (reg.installing) setSWState("installing");

    reg.addEventListener("updatefound", () => {
      setSWState("installing");
      const sw = reg.installing;
      if (sw) {
        sw.addEventListener("statechange", () => {
          if (sw.state === "activated") setSWState("active");
          if (sw.state === "redundant") setSWState("redundant");
        });
      }
    });
  });

  interval = setInterval(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    regs.filter((r) => r.active?.state === "redundant").forEach((r) => r.unregister());
  }, 60000);

  return () => clearInterval(interval);
}
