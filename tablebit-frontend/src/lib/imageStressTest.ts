import { executeImageFlow } from "@/lib/imagePipelineOrchestrator";
import { getRenderReport } from "@/lib/imageRenderAudit";
import { getCacheMetrics } from "@/lib/imageRequestCache";
import { imageScheduler } from "@/lib/imageScheduler";

const TEST_URLS = Array.from({ length: 50 }, (_, i) => `/test/image-${i}.webp`);
const PRIORITIES: Array<"HERO" | "ABOVE_FOLD" | "VISIBLE" | "BELOW_FOLD"> = [
  "HERO", "ABOVE_FOLD", "VISIBLE", "BELOW_FOLD",
];

export async function runStressTest(): Promise<void> {
  if (!import.meta.env.DEV) return;

  console.log("%c[StressTest] Starting with 50 images...", "color: #f59e0b; font-weight: bold");

  const promises = TEST_URLS.map((url, i) =>
    executeImageFlow(url, PRIORITIES[i % PRIORITIES.length])
      .catch(() => {}) // ignore individual failures
  );

  await Promise.all(promises);

  const renderReport = getRenderReport();
  const cacheMetrics = getCacheMetrics();
  const schedulerMetrics = imageScheduler.getMetrics();

  console.log("%c[StressTest] RESULTS", "color: #22c55e; font-weight: bold");
  console.table({
    "Images processed": TEST_URLS.length,
    "Flicker rate": `${renderReport.flickerRisk}%`,
    "Avg render": `${renderReport.avgRenderTime}ms`,
    "Cache efficiency": `${cacheMetrics.efficiency}%`,
    "Scheduler processed": schedulerMetrics.totalProcessed,
    "Stability": `${renderReport.stability}%`,
  });
}
