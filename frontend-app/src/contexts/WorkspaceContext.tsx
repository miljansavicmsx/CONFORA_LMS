import { createContext, createElement, useContext, type JSX, type ReactNode } from "react";

import type { AppWorkspaceId } from "@/lib/app-workspace";
import type { MePermissionsPayload } from "@/lib/permissions";

type WorkspaceContextValue = {
  readonly workspace: AppWorkspaceId;
  readonly permissionsSnapshot: MePermissionsPayload | null;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export type WorkspaceProviderProps = {
  readonly role: string;
  readonly permissionsSnapshot?: MePermissionsPayload | null;
  readonly children: ReactNode;
};

function workspaceFromRole(role: string): AppWorkspaceId {
  if (role === "admin" || role === "training_admin" || role === "sysadmin") {
    return "system";
  }
  if (role === "staff" || role === "cert_staff" || role === "director") {
    return "governance";
  }
  return "learning";
}

export function WorkspaceProvider({
  role,
  permissionsSnapshot = null,
  children,
}: WorkspaceProviderProps): JSX.Element {
  const value: WorkspaceContextValue = {
    workspace: workspaceFromRole(role),
    permissionsSnapshot,
  };
  return createElement(WorkspaceContext.Provider, { value }, children);
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext requires WorkspaceProvider");
  }
  return ctx;
}

export function useOptionalWorkspaceContext(): WorkspaceContextValue | null {
  return useContext(WorkspaceContext);
}
