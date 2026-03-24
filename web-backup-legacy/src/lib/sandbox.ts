export const SANDBOX_LIMIT = 20;
export const SANDBOX_COST_CAP_USD = 0.50;

export function isSandboxExhausted(sandboxUsed: number): boolean {
  return sandboxUsed >= SANDBOX_LIMIT;
}

export function getSandboxRemaining(sandboxUsed: number): number {
  return Math.max(0, SANDBOX_LIMIT - sandboxUsed);
}
