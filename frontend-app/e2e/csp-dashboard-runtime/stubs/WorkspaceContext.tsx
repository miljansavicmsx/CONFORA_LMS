import { createElement, type JSX, type ReactNode } from "react";

import type { AppWorkspaceId } from "@/lib/app-workspace";

type WorkspaceContextValue = {
  readonly workspace: AppWorkspaceId;
};

/** E2E/test-local stub — not a production WorkspaceContext implementation. */
export function WorkspaceProvider(props: {
  readonly role?: string;
  readonly permissionsSnapshot?: unknown;
  readonly children?: ReactNode;
}): JSX.Element {
  return createElement("div", { "data-testid": "stub-workspace-provider" }, props.children);
}

export function useWorkspaceContext(): WorkspaceContextValue {
  return { workspace: "learning" };
}
