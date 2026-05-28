let isBalancing = false;

export function startResourceBalancer(): void { isBalancing = true; }
export function stopResourceBalancer(): void { isBalancing = false; }
export function isResourceBalancerActive(): boolean { return isBalancing; }

export function getResourceBalancerMetrics() {
  return { active: isBalancing };
}
