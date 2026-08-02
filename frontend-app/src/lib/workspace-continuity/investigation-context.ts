import type { AppWorkspaceId } from "@/lib/app-workspace";

export type InvestigationSnapshot = {
  readonly workspace: AppWorkspaceId;
  readonly route: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly recordedAt: string;
};

const SESSION_KEY = "confora.phase-h.investigation.v1";

export function recordInvestigationJump(snapshot: Omit<InvestigationSnapshot, "recordedAt">): void {
  try {
    const payload: InvestigationSnapshot = {
      ...snapshot,
      recordedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

export function readInvestigationSnapshot(): InvestigationSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<InvestigationSnapshot>;
    if (!p.workspace || !p.route || !p.title || !p.recordedAt) return null;
    return p as InvestigationSnapshot;
  } catch {
    return null;
  }
}

export function clearInvestigationSnapshot(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
}
