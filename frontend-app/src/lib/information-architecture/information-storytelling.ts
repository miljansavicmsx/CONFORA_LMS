import type { InformationSignalPriority } from "./information-priority";

/** Slots for calm storytelling (1:1 mapping to cockpit narrative blocks). */
export interface CockpitStorySlots {
  readonly executiveSummary: string /** must be plain language */;
  readonly criticalIssues: readonly string[];
  readonly workflowPressure: readonly string[];
  readonly governanceExposure: readonly string[];
  readonly aiGuidance: readonly string[];
  readonly recommendedActions: readonly string[];
  readonly traceabilityAccess: readonly string[];
}

export function buildStoryPriority(summaryPriority: InformationSignalPriority): InformationSignalPriority {
  return summaryPriority;
}

export function clipBullets(items: readonly string[], cap: number): readonly string[] {
  return items.slice(0, Math.max(0, cap));
}
