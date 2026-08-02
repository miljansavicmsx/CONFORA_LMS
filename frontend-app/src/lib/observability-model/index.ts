import type { Severity } from "@/design-system/SeverityBadge";
import type { AuditReadinessBand } from "@/lib/audit-readiness";
import type { HealthBand } from "@/lib/operations-intelligence/intelligence-types";

export type ReadinessBandUnified = AuditReadinessBand | "unknown";
export type HealthBandUnified = HealthBand | "unknown";
export type ConfidenceBandUnified = "high" | "medium" | "low" | "unknown";

export function normalizeSeverityLabel(sev: Severity): string {
  switch (sev) {
    case "danger":
      return "kritično";
    case "warning":
      return "upozorenje";
    case "info":
      return "informacija";
    case "success":
      return "stabilno";
    default:
      return sev;
  }
}

export function unifiedReadinessNarration(band: ReadinessBandUnified): string {
  switch (band) {
    case "audit_ready":
      return "Spremnost: spremno za audit (heuristika).";
    case "mostly_ready":
      return "Spremnost: uglavnom spremno uz rizike.";
    case "at_risk":
      return "Spremnost: povećan rizik.";
    case "critical":
      return "Spremnost: kritičan pritisak.";
    default:
      return "Spremnost: nedefinirano.";
  }
}

export function unifiedHealthScore01(healthScore0to100: number): number {
  return Math.max(0, Math.min(1, healthScore0to100 / 100));
}

export function confidenceBandFromScore01(score: number): ConfidenceBandUnified {
  if (score >= 0.72) return "high";
  if (score >= 0.45) return "medium";
  if (score > 0) return "low";
  return "unknown";
}

export function mapHealthToSeverity(band: HealthBandUnified): Severity {
  switch (band) {
    case "excellent":
    case "healthy":
      return "success";
    case "warning":
      return "warning";
    case "critical":
      return "danger";
    default:
      return "info";
  }
}

export function observabilityCompositeScore(parts: readonly { readonly weight: number; readonly score01: number }[]): number {
  const wsum = parts.reduce((a, p) => a + p.weight, 0);
  if (wsum <= 0) return 0;
  const t = parts.reduce((a, p) => a + p.weight * p.score01, 0) / wsum;
  return Math.round(t * 100);
}
