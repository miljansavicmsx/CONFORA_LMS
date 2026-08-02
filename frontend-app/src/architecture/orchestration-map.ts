/**
 * Orchestration map — which UX layers compose cross-domain flows, without owning backend workflow.
 */

export type OrchestrationSurface = {
  readonly name: string;
  readonly pathHints: readonly string[];
  readonly composes: readonly string[];
  readonly doesNotReplace: readonly string[];
};

export const ORCHESTRATION_SURFACES: readonly OrchestrationSurface[] = [
  {
    name: "Global command center",
    pathHints: ["components/command-center"],
    composes: ["routes", "recent entities", "continuity snapshot", "ISO quick paths"],
    doesNotReplace: ["ABAC decisions", "workflow transitions"],
  },
  {
    name: "Governance dashboard / control tower",
    pathHints: ["pages/admin/GovernanceDashboard", "ExecutiveControlTower"],
    composes: ["digital twin bundle", "operations intelligence", "cockpit bodies"],
    doesNotReplace: ["Audit engine", "committee voting"],
  },
  {
    name: "Knowledge workspace",
    pathHints: ["pages/knowledge", "components/knowledge"],
    composes: ["audit readiness", "graph", "clause explorer", "progressive disclosure"],
    doesNotReplace: ["Authoritative registry writes"],
  },
  {
    name: "StandardsKnowledgeCenter",
    pathHints: ["components/knowledge/StandardsKnowledgeCenter"],
    composes: ["registry UX", "IA ribbons", "lazy graph boundary"],
    doesNotReplace: ["Backend knowledge ingestion jobs"],
  },
  {
    name: "Workspace continuity",
    pathHints: ["lib/workspace-continuity"],
    composes: ["session snapshot", "related jumps"],
    doesNotReplace: ["Server-side investigation audit"],
  },
];
