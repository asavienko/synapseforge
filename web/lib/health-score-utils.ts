/**
 * Pure, client-safe health score utilities (no prisma imports).
 */

export function healthScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Healthy", color: "#34d399" };
  if (score >= 50) return { label: "Moderate", color: "#fbbf24" };
  if (score >= 20) return { label: "At risk", color: "#f97316" };
  return { label: "Inactive", color: "#ef4444" };
}
