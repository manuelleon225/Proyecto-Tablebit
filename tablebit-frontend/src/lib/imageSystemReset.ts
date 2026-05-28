import { clearImageCache } from "@/lib/imageRequestCache";
import { clearAllImageStates } from "@/lib/imageStateStore";
import { imageScheduler } from "@/lib/imageScheduler";
import { cancelAllPrefetches } from "@/lib/imagePrefetch";

export function resetImageSystem(): void {
  imageScheduler.abortAll();
  cancelAllPrefetches();
  clearImageCache();
  clearAllImageStates();
}
