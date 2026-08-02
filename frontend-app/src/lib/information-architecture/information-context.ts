import type { AppWorkspaceId } from "@/lib/app-workspace";

/** Cross-surface orchestration context (no backend). */
export interface InformationSurfaceContext {
  readonly workspace: AppWorkspaceId;
  readonly route: string;
  readonly surfaceLabel: string;
  readonly entityLabel?: string;
  readonly clauseId?: string;
}

export function isGovernanceRoute(route: string): boolean {
  const r = route.toLowerCase();
  return r.includes("/iso/") || r.includes("/committee/") || r.includes("/governance");
}
