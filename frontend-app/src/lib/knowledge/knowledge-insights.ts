import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";

import type { KnowledgeGraph } from "@/lib/knowledge-graph/knowledge-graph-types";

import { KNOWLEDGE_EVIDENCE_CHANNELS } from "./knowledge-evidence";
import type { KnowledgeInsight } from "./knowledge-types";

export function buildKnowledgeInsights(graph: KnowledgeGraph, snapshot: TwinNormalizedInput): KnowledgeInsight[] {
  const insights: KnowledgeInsight[] = [];

  if (graph.telemetry.orphanEvidence > 0) {
    insights.push({
      id: "ins-orphan-ev",
      severity: "warning",
      title: "Kanali dokaza bez klauzulnih veza",
      detail: "Povežite module (audit, CAPA, MR) s aktivnim shemama u operativnom ciklusu.",
      actionRoute: "/dashboard/iso/audit",
    });
  }
  if (graph.telemetry.unresolvedRelationships > graph.edges.length * 0.35) {
    insights.push({
      id: "ins-rel-density",
      severity: "info",
      title: "Gustoća odnosa ispod praktičnog praga",
      detail: "Razmotrite dublje mapiranje odbora i IMP registra na klauzule nadzora.",
      actionRoute: "/dashboard/iso/impartiality",
    });
  }
  if (snapshot.capaOverdue >= 8) {
    insights.push({
      id: "ins-capa",
      severity: "critical",
      title: "CAPA pritisak utječe na knowledge confidence",
      detail: "Prioritetno zatvorite prekoračene CAPA prije akreditacijskog narativnog presjeka.",
      actionRoute: "/dashboard/iso/capa",
    });
  }
  if (KNOWLEDGE_EVIDENCE_CHANNELS.length < 6) {
    insights.push({
      id: "ins-channels",
      severity: "info",
      title: "Evidence kanali",
      detail: "Registry kanala je statički — proširite ga kad se novi moduli pojave u CB.",
    });
  }
  return insights;
}
