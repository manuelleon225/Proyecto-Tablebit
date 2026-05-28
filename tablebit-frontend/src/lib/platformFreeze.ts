let platformFrozen = false;

export function freezePlatform(): void {
  platformFrozen = true;
}

export function unfreezePlatform(): void {
  platformFrozen = false;
}

export function isPlatformFrozen(): boolean {
  return platformFrozen;
}

export function assertPlatformWritable(): void {
  if (platformFrozen) throw new Error("Platform is frozen. No writes allowed.");
}

export function getPlatformFreezeState() {
  return { frozen: platformFrozen };
}
