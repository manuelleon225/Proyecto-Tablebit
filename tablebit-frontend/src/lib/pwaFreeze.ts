let frozen = false;

export function freezePWAArchitecture(): void { frozen = true; }
export function unfreezePWAArchitecture(): void { frozen = false; }
export function isPWAFrozen(): boolean { return frozen; }

export function assertPWAFrozen(): void {
  if (frozen) throw new Error("PWA architecture is frozen. No modifications allowed.");
}
