import { ScrollText } from "lucide-react";

import { listAllRegistryClauses } from "@/lib/knowledge/registries";
import { canAccessKnowledgeWorkspace, type IsoNavContext } from "@/lib/iso-navigation-access";

import type { CommandEntity } from "../command-entity-types";

export function knowledgeNavProvider(isoCtx: IsoNavContext): CommandEntity[] {
  if (!canAccessKnowledgeWorkspace(isoCtx)) return [];
  const workspace = "knowledge" as const;
  const hub: CommandEntity = {
    id: "nav:knowledge:center",
    entityType: "clause",
    title: "Standards Intelligence — centar",
    subtitle: "Registry klauzula, tragovi, audit priprema",
    workspace,
    route: "/dashboard/knowledge",
    icon: ScrollText,
    tags: ["standards", "knowledge", "iso17024", "registry"],
    source: "nav",
    resultBucket: "knowledge",
  };
  const clauses: CommandEntity[] = listAllRegistryClauses().map((cl) => ({
    id: `nav:knowledge:clause:${cl.id}`,
    entityType: "clause" as const,
    title: `${cl.clauseRef} ${cl.title}`,
    subtitle: cl.standardId,
    workspace,
    route: `/dashboard/knowledge?clause=${encodeURIComponent(cl.id)}`,
    tags: [...cl.facets, "clause", cl.standardId.toLowerCase(), "evidence"],
    source: "nav" as const,
    resultBucket: "knowledge" as const,
  }));
  return [hub, ...clauses];
}
