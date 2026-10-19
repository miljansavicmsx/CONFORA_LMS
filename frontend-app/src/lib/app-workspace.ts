/** Application workspaces are presentation contexts, not authorization grants. */
export type AppWorkspaceId = "learning" | "governance" | "system";

export const APP_WORKSPACE_LABELS: Readonly<Record<AppWorkspaceId, string>> = {
  learning: "Learning",
  governance: "Governance",
  system: "System",
};

const WORKSPACE_STORAGE_KEY = "confora.workspace.v1";

export function persistWorkspacePreference(id: AppWorkspaceId): void {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
  } catch {
    /* private mode */
  }
}

export function readWorkspacePreference(): AppWorkspaceId | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw === "learning" || raw === "governance" || raw === "system") return raw;
  } catch {
    return null;
  }
  return null;
}

/** Presentation grouping only. A learner stays in the learning workspace. */
export function workspacesAvailableForIsoContext(ctx: {
  readonly role?: string | null;
}): readonly AppWorkspaceId[] {
  const role = String(ctx.role ?? "").trim().toLowerCase();
  if (role === "learner" || role === "candidate" || role === "usr_cand" || role === "usr_cert") {
    return ["learning"];
  }
  return ["learning", "governance", "system"];
}

export function defaultWorkspaceForContext(
  available: readonly AppWorkspaceId[],
  role: string,
): AppWorkspaceId {
  const normalized = role.trim().toLowerCase();
  if (
    (normalized === "learner" || normalized === "candidate") &&
    available.includes("learning")
  ) {
    return "learning";
  }
  return available[0] ?? "learning";
}

export function clampWorkspace(
  workspace: AppWorkspaceId,
  available: readonly AppWorkspaceId[],
): AppWorkspaceId {
  if (available.includes(workspace)) return workspace;
  return available[0] ?? workspace;
}
