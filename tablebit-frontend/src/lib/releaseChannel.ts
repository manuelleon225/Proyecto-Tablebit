import { getSystemHealthScore } from "@/lib/systemHealthEngine";
import { runProductionCertification } from "@/lib/productionCertification";

type ReleaseChannel = "stable" | "candidate" | "experimental";
const STORAGE_KEY = "tbit_release_channel";

export function getReleaseChannel(): ReleaseChannel {
  return (localStorage.getItem(STORAGE_KEY) as ReleaseChannel) || "stable";
}

export function setReleaseChannel(channel: ReleaseChannel): boolean {
  if (channel === "experimental" && getSystemHealthScore() < 70) return false;
  if (channel === "candidate" && !runProductionCertification().passed) return false;
  localStorage.setItem(STORAGE_KEY, channel);
  return true;
}

export function isExperimental(): boolean { return getReleaseChannel() === "experimental"; }

export function validateReleaseCompatibility(): boolean {
  return getReleaseChannel() !== "experimental" || getSystemHealthScore() >= 70;
}
