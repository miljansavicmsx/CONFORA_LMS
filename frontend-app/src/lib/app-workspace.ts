/** Application workspaces are presentation contexts, not authorization grants. */
export type AppWorkspaceId = "learning" | "governance" | "system";

export const APP_WORKSPACE_LABELS: Readonly<Record<AppWorkspaceId, string>> = {
  learning: "Learning",
  governance: "Governance",
  system: "System",
};
