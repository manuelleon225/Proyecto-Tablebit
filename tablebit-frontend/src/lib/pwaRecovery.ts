export async function resetPWAEnvironment(): Promise<void> {
  const keys = await caches.keys();
  for (const key of keys) {
    await caches.delete(key);
  }
  localStorage.removeItem("tbit_offline_queue");
  localStorage.removeItem("tbit_offline_snapshot");
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      await reg.unregister();
    }
  }
  window.location.reload();
}

export async function isCacheHealthy(): Promise<boolean> {
  try {
    const keys = await caches.keys();
    return keys.length > 0;
  } catch { return false; }
}
