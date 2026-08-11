import type { AppWorkspaceId } from "@/lib/app-workspace";

export type WorkspaceContinuityItem = {
  readonly label: string;
  readonly rationale: string;
};

export type InvestigationJump = {
  readonly workspace: AppWorkspaceId;
  readonly route: string;
  readonly title: string;
  readonly subtitle?: string;
};

export type InvestigationSnapshot = InvestigationJump | null;

export type InvestigationHint = {
  readonly workspace: AppWorkspaceId;
  readonly route: string;
  readonly label: string;
  readonly rationale: string;
};

/** Informational copy only; it does not change navigation or authorization. */
export const IA_RIBBON_LEARNER_TRUST: readonly WorkspaceContinuityItem[] = [
  { label: "Javni verify", rationale: "Provjerite status dokumenta u javnom registru." },
  { label: "Status certifikata", rationale: "Status dokumenta nije odluka o certifikaciji." },
] as const;

let latestInvestigation: InvestigationSnapshot = null;

/** Stores only the current in-memory UI hint; no tenant, identity, token, or server state is persisted. */
export function recordInvestigationJump(jump: InvestigationJump): void {
  latestInvestigation = { ...jump };
}

export function readInvestigationSnapshot(): InvestigationSnapshot {
  return latestInvestigation ? { ...latestInvestigation } : null;
}

export function continueInvestigationHint(snapshot: InvestigationSnapshot): InvestigationHint | null {
  if (!snapshot) return null;
  return {
    ...snapshot,
    label: `Nastavi: ${snapshot.title}`,
    rationale: snapshot.subtitle ?? "Nastavite prethodno otvoreni kontekst.",
  };
}

export function relatedWorkspaceJumps(_snapshot: InvestigationSnapshot): readonly InvestigationHint[] {
  return [];
}
