type KernelState = "booting" | "active" | "degraded" | "recovering" | "frozen" | "shutdown";

let kernelState: KernelState = "booting";

export function bootKernel(): void { kernelState = "active"; }
export function shutdownKernel(): void { kernelState = "shutdown"; }
export function getKernelState(): KernelState { return kernelState; }
export function setKernelState(s: KernelState): void { kernelState = s; }
export function restartKernel(): void { kernelState = "booting"; setTimeout(() => { kernelState = "active"; }, 100); }
export function getKernelStateMetrics() { return { state: kernelState, uptime: process.uptime ? Math.round(process.uptime()) : 0 }; }
