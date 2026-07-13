import type { TFunction } from "i18next";

import type { AppWorkspaceId } from "@/lib/app-workspace";
import type { IsoNavContext } from "@/lib/iso-navigation-access";

import type { CommandEntity } from "./command-entity-types";
import { dedupeEntities } from "./command-search-engine";
import { certificationProvider } from "./providers/certification-provider";
import { governanceNavProvider } from "./providers/governance-provider";
import { learningNavProvider, learningStaticProvider } from "./providers/learning-provider";
import { quickActionsProvider } from "./providers/quick-actions-provider";
import { knowledgeNavProvider } from "./providers/knowledge-provider";
import { systemNavProvider } from "./providers/system-provider";
import { continuityCommandProvider } from "./providers/continuity-provider";

export { fetchRemoteCourseEntities } from "./providers/remote-courses-provider";
export { pinnedProvider } from "./providers/pinned-provider";
export { recentProvider } from "./providers/recent-provider";

/** Statički indeks (sidebar + quick actions) — UVIJEK bez remote API-ja; debloat za performanse. */
export function buildCommandSearchIndex(
  isoCtx: IsoNavContext,
  workspace: AppWorkspaceId,
  t: TFunction,
): CommandEntity[] {
  const merged: CommandEntity[] = [
    ...learningNavProvider(isoCtx, t),
    ...learningStaticProvider(),
    ...governanceNavProvider(isoCtx, t),
    ...knowledgeNavProvider(isoCtx),
    ...continuityCommandProvider(),
    ...certificationProvider(isoCtx, t),
    ...systemNavProvider(isoCtx, t),
    ...quickActionsProvider(workspace),
  ];
  return dedupeEntities(merged);
}
