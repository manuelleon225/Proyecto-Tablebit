type IdleState = "active" | "idle30" | "idle120" | "hidden";
type IdleCallback = (state: IdleState) => void;

let lastActivity = Date.now();
let currentState: IdleState = "active";
const listeners = new Set<IdleCallback>();

export function onIdleChange(cb: IdleCallback): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getIdleState(): IdleState { return currentState; }

function setIdleState(state: IdleState): void {
  if (state === currentState) return;
  currentState = state;
  listeners.forEach((cb) => cb(state));
}

if (typeof window !== "undefined") {
  const events = ["mousemove", "keydown", "scroll", "touchstart"];
  events.forEach((e) => window.addEventListener(e, () => {
    lastActivity = Date.now();
    if (currentState !== "active") setIdleState("active");
  }));

  setInterval(() => {
    const idle = Date.now() - lastActivity;
    if (document.hidden) { setIdleState("hidden"); return; }
    if (idle > 120000) setIdleState("idle120");
    else if (idle > 30000) setIdleState("idle30");
    else setIdleState("active");
  }, 10000);

  document.addEventListener("visibilitychange", () => {
    setIdleState(document.hidden ? "hidden" : "active");
    if (!document.hidden) lastActivity = Date.now();
  });
}
