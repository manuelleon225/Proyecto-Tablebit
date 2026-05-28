type ImageState = "loading" | "ready" | "error" | "decoding";

const store = new Map<string, ImageState>();
const subscribers = new Map<string, Set<(state: ImageState) => void>>();

export function setImageState(url: string, state: ImageState): void {
  const prev = store.get(url);
  if (prev === state) return;
  store.set(url, state);
  const subs = subscribers.get(url);
  if (subs) subs.forEach((fn) => fn(state));
}

export function getImageState(url: string): ImageState | undefined {
  return store.get(url);
}

export function subscribeImageState(url: string, callback: (state: ImageState) => void): () => void {
  if (!subscribers.has(url)) subscribers.set(url, new Set());
  subscribers.get(url)!.add(callback);
  return () => { subscribers.get(url)?.delete(callback); };
}

export function clearAllImageStates(): void {
  store.clear();
  subscribers.clear();
}
