import type { AppWorkspaceId } from "@/lib/app-workspace";

import type { InvestigationSnapshot } from "./investigation-context";

export interface WorkspaceJumpHint {
  readonly label: string;
  readonly route: string;
  readonly workspace: AppWorkspaceId;
  readonly rationale: string;
}

export function relatedWorkspaceJumps(prev: InvestigationSnapshot | null): readonly WorkspaceJumpHint[] {
  if (!prev) return [];
  const r = prev.route.toLowerCase();
  const out: WorkspaceJumpHint[] = [
    {
      label: "Standards Intelligence",
      route: "/dashboard/knowledge",
      workspace: "knowledge",
      rationale: "Registry klauzula i trag za ISO/IEC 17024 presjek.",
    },
    {
      label: "Executive Control Tower",
      route: "/dashboard/admin/governance",
      workspace: "governance",
      rationale: "Operativni i governance presjek u jednom cockpit-u.",
    },
  ];
  if (r.includes("/knowledge")) {
    return out.filter((j) => j.route !== "/dashboard/knowledge");
  }
  if (r.includes("/admin/governance") && prev.workspace === "governance") {
    return out.filter((j) => j.route !== "/dashboard/admin/governance");
  }
  return out;
}

export function continueInvestigationHint(prev: InvestigationSnapshot | null): WorkspaceJumpHint | null {
  if (!prev) return null;
  return {
    label: `Nastavi: ${prev.title}`,
    route: prev.route.startsWith("/") ? prev.route : `/${prev.route}`,
    workspace: prev.workspace,
    rationale: `Zadnji IA kontekst (${new Date(prev.recordedAt).toLocaleString()})`,
  };
}
