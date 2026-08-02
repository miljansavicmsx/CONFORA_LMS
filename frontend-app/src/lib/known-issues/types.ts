/** Phase I — internal registry for pilot / RC tracking (frontend-only). */

export type KnownIssueSeverity = "blocker" | "high" | "medium" | "low" | "informational";

export type KnownIssue = {
  readonly id: string;
  readonly title: string;
  readonly severity: KnownIssueSeverity;
  readonly summary: string;
  readonly workaround?: string;
  readonly affectedModules: readonly string[];
  readonly mitigation?: string;
  readonly pilotImpact: string;
  readonly productionImpact: string;
};
