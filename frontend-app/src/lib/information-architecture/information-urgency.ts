import type { InformationSignalPriority } from "./information-priority";
import { INFORMATION_PRIORITY_ORDER } from "./information-priority";

/** Numeric urgency 0 (calm) — 100 (hot) derived from priority (deterministic heuristic). */
export function urgencyFromPriority(p: InformationSignalPriority): number {
  const base = 100 - INFORMATION_PRIORITY_ORDER[p] * 18;
  return Math.max(0, Math.min(100, base));
}

export function escalationEmphasis(p: InformationSignalPriority): boolean {
  return p === "CRITICAL" || p === "HIGH";
}
