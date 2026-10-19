import type { JSX, ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuthStore } from "@/stores/authStore";
import type { MePermissionsPayload } from "@/lib/permissions";
import {
  clampWorkspace,
  defaultWorkspaceForContext,
  persistWorkspacePreference,
  readWorkspacePreference,
  type AppWorkspaceId,
  workspacesAvailableForIsoContext,
} from "@/lib/app-workspace";
import type { IsoNavContext } from "@/lib/iso-navigation-access";

export type WorkspaceContextValue = {
  readonly workspace: AppWorkspaceId;
  readonly available: readonly AppWorkspaceId[];
  readonly isoCtx: IsoNavContext;
  setWorkspace: (id: AppWorkspaceId) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
  role,
  permissionsSnapshot,
}: {
  readonly children: ReactNode;
  readonly role: string;
  readonly permissionsSnapshot: MePermissionsPayload | null;
}): JSX.Element {
  const cognitoGroups = useAuthStore((s) => s.cognitoGroups);
  const isoCtx = useMemo<IsoNavContext>(
    () => ({
      role,
      cognitoGroups,
      permissionsSnapshot,
    }),
    [role, cognitoGroups, permissionsSnapshot],
  );

  const available = useMemo(() => workspacesAvailableForIsoContext(isoCtx), [isoCtx]);

  const [workspace, setWorkspaceState] = useState<AppWorkspaceId>(() => {
    const initialCtx: IsoNavContext = {
      role,
      cognitoGroups: useAuthStore.getState().cognitoGroups,
      permissionsSnapshot,
    };
    const av = workspacesAvailableForIsoContext(initialCtx);
    const saved = readWorkspacePreference();
    const base = saved && av.includes(saved) ? saved : defaultWorkspaceForContext(av, role);
    return clampWorkspace(base, av);
  });

  useEffect(() => {
    setWorkspaceState((prev) => {
      const saved = readWorkspacePreference();
      const base = saved && available.includes(saved) ? saved : prev;
      const next = clampWorkspace(base, available);
      return next;
    });
  }, [available]);

  const setWorkspace = useCallback(
    (id: AppWorkspaceId) => {
      const next = clampWorkspace(id, available);
      setWorkspaceState(next);
      persistWorkspacePreference(next);
    },
    [available],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      available,
      isoCtx,
      setWorkspace,
    }),
    [workspace, available, isoCtx, setWorkspace],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const v = useContext(WorkspaceContext);
  if (!v) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider");
  }
  return v;
}

/** Sigurno izvan providera (npr. priklijene komponente) — vraća null. */
export function useOptionalWorkspaceContext(): WorkspaceContextValue | null {
  return useContext(WorkspaceContext);
}
