let isGovernorActive = false;

export function startExecutionGovernor(): void { isGovernorActive = true; }
export function stopExecutionGovernor(): void { isGovernorActive = false; }
export function isExecutionGovernorActive(): boolean { return isGovernorActive; }

export function getExecutionGovernorMetrics() {
  return { active: isGovernorActive };
}
