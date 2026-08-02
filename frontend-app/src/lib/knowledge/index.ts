import type { DashboardContextPayload } from "@/lib/dashboard-context-api";
import type { GovernanceCommitteeRow } from "@/lib/api-governance";
import { normalizeTwinInput } from "@/lib/digital-twin/twin-governance";

import { buildDefaultKnowledgeGraph } from "@/lib/knowledge-graph";

import { buildKnowledgeInsights } from "./knowledge-insights";
import { KNOWLEDGE_EVIDENCE_CHANNELS } from "./knowledge-evidence";
import { buildKnowledgeRequirementsFromRegistry } from "./knowledge-requirements";
import { buildAllKnowledgeRelationships } from "./knowledge-relationships";
import type { KnowledgeWorkspaceBundle } from "./knowledge-types";
import { listAllRegistryClauses } from "./registries";

export type KnowledgeBuildOptions = {
  readonly governanceDocumentCount: number;
  readonly internalAuditRecords: number;
  readonly openAuditFindings: number;
};

export function buildKnowledgeWorkspaceBundle(
  ctx: DashboardContextPayload,
  committees: readonly GovernanceCommitteeRow[],
  options: KnowledgeBuildOptions,
): KnowledgeWorkspaceBundle {
  const snapshot = normalizeTwinInput(
    ctx,
    committees,
    options.governanceDocumentCount,
    options.internalAuditRecords,
    options.openAuditFindings,
  );
  const clauses = listAllRegistryClauses();
  const requirements = buildKnowledgeRequirementsFromRegistry(clauses);
  const relationships = buildAllKnowledgeRelationships(clauses);
  const graph = buildDefaultKnowledgeGraph(snapshot);
  const insights = buildKnowledgeInsights(graph, snapshot);

  const ariaSummary = [
    `Standards knowledge: ${clauses.length} registry klauzula, ${requirements.length} zahtjeva u matrici.`,
    `Graf čvorova ${graph.nodes.length}, bridova ${graph.edges.length}.`,
    insights.length ? `Insighti: ${insights.map((i) => i.title).join("; ")}.` : "Bez kritičnih insighta u heuristici.",
  ].join(" ");

  return {
    clauses,
    requirements,
    relationships,
    evidenceChannels: KNOWLEDGE_EVIDENCE_CHANNELS,
    ariaSummary,
    graphTelemetry: graph.telemetry,
    insights,
  };
}

export * from "./knowledge-types";
export * from "./registries";
export * from "./knowledge-domains";
export * from "./knowledge-taxonomy";
export * from "./knowledge-requirements";
export * from "./knowledge-relationships";
export * from "./knowledge-evidence";
export * from "./knowledge-glossary";
export * from "./knowledge-search";
export * from "./knowledge-relevance";
export * from "./knowledge-explainability";
export * from "./knowledge-insights";
export * from "./knowledge-confidence";
