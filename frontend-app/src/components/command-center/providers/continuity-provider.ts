import { History, Link2, ScrollText } from "lucide-react";

import type { CommandEntity } from "@/components/command-center/command-entity-types";
import { continueInvestigationHint, readInvestigationSnapshot, relatedWorkspaceJumps } from "@/lib/workspace-continuity";

function ce(partial: Omit<CommandEntity, "source"> & { readonly id: string }): CommandEntity {
  return {
    ...partial,
    source: "continuity",
  };
}

/** IA continuity — investigation memory in command palette (session; no backend). */
export function continuityCommandProvider(): CommandEntity[] {
  const snap = readInvestigationSnapshot();
  const cont = continueInvestigationHint(snap);
  const related = relatedWorkspaceJumps(snap);
  const out: CommandEntity[] = [];
  if (cont) {
    out.push(
      ce({
        id: "ia:cont:resume",
        entityType: "report",
        title: cont.label,
        subtitle: cont.rationale,
        workspace: cont.workspace,
        route: cont.route,
        icon: History,
        tags: ["continuity", "investigation", "nastavi"],
        resultBucket: "continuity",
      }),
    );
  }
  for (const j of related) {
    const icon = j.route.includes("knowledge") ? ScrollText : Link2;
    out.push(
      ce({
        id: `ia:cont:jump:${j.route}`,
        entityType: "report",
        title: j.label,
        subtitle: j.rationale,
        workspace: j.workspace,
        route: j.route,
        icon,
        tags: ["continuity", "workspace", "trag"],
        resultBucket: "continuity",
      }),
    );
  }
  return out;
}
