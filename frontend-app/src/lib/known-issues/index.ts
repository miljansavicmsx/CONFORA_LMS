import { KNOWN_ISSUES_REGISTRY } from "./registry";
import type { KnownIssue, KnownIssueSeverity } from "./types";

export type { KnownIssue, KnownIssueSeverity } from "./types";
export { KNOWN_ISSUES_REGISTRY } from "./registry";

export function knownIssuesBySeverity(sev: KnownIssueSeverity): readonly KnownIssue[] {
  return KNOWN_ISSUES_REGISTRY.filter((i) => i.severity === sev);
}

export function knownIssuesAffecting(moduleFragment: string): readonly KnownIssue[] {
  const q = moduleFragment.toLowerCase();
  return KNOWN_ISSUES_REGISTRY.filter((i) => i.affectedModules.some((m) => m.toLowerCase().includes(q)));
}
