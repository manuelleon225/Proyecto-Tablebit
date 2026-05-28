import { imageScheduler } from "@/lib/imageScheduler";
import type { ImagePriority } from "@/lib/imagePriority";

export function prefetchImage(url: string, priority: ImagePriority = "VISIBLE"): Promise<void> {
  return imageScheduler.enqueue(url, priority);
}

export function prefetchVisibleImages(container?: HTMLElement): void {
  if (typeof IntersectionObserver === "undefined") return;
  const images = (container || document).querySelectorAll<HTMLImageElement>(
    "img[loading='lazy']:not([data-prefetched])"
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.dataset.prefetched = "true";
          if (img.dataset.src) {
            prefetchImage(img.dataset.src, "VISIBLE");
          }
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: "200px" }
  );
  images.forEach((img) => observer.observe(img));
}

export function prefetchNextViewport(currentIndex: number, total: number, getUrl: (i: number) => string): void {
  const nextIndices = [];
  if (currentIndex + 1 < total) nextIndices.push(currentIndex + 1);
  if (currentIndex + 2 < total) nextIndices.push(currentIndex + 2);
  if (currentIndex - 1 >= 0) nextIndices.push(currentIndex - 1);
  nextIndices.forEach((i) => prefetchImage(getUrl(i), "BELOW_FOLD"));
}

export function flushIdleQueue(): void {
  imageScheduler.flushIdleQueue();
}

export function cancelAllPrefetches(): void {
  /* scheduler handles internally */
}
