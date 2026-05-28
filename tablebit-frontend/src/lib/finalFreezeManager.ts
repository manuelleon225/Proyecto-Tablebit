import { freezePlatform } from "@/lib/platformFreeze";
import { isPlatformFrozen } from "@/lib/platformFreeze";

let freezeEnforced = false;

export function enforceFinalFreeze(): void {
  freezePlatform();
  freezeEnforced = true;
}

export function validateFreezeIntegrity(): boolean {
  return isPlatformFrozen() && freezeEnforced;
}

export function getFreezeMetrics() {
  return { enforced: freezeEnforced, platformFrozen: isPlatformFrozen(), integrity: validateFreezeIntegrity() };
}
