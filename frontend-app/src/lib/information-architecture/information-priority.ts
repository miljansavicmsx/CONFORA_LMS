/** Information hierarchy — signal tiers for enterprise panels (frontend IA only). */

export type InformationSignalPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW" | "BACKGROUND";

export const INFORMATION_PRIORITY_ORDER: Record<InformationSignalPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
  BACKGROUND: 4,
};

export function compareInformationPriority(a: InformationSignalPriority, b: InformationSignalPriority): number {
  return INFORMATION_PRIORITY_ORDER[a] - INFORMATION_PRIORITY_ORDER[b];
}

export function maxPriority(a: InformationSignalPriority, b: InformationSignalPriority): InformationSignalPriority {
  return compareInformationPriority(a, b) <= 0 ? a : b;
}
