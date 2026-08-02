import type { KnowledgeWorkspaceTelemetry } from "../knowledge/knowledge-types";

export type KnowledgeGraphNodeKind = "clause" | "evidence" | "workflow" | "governance" | "cert_chain";

export type KnowledgeGraphNode = {
  readonly id: string;
  readonly kind: KnowledgeGraphNodeKind;
  readonly label: string;
  readonly sublabel?: string;
  /** 0 = calm, 100 = hot — UI boja */
  readonly severity: number;
  /** 0–100 trust u registry kontekstu (statika + signali) */
  readonly trust: number;
  readonly standardLabel?: string;
  readonly clusterId: string;
};

export type KnowledgeGraphEdge = {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly kind: "requirement_lineage" | "evidence_lineage" | "workflow_lineage" | "governance_lineage" | "certification_lineage";
  readonly label: string;
};

export type KnowledgeGraph = {
  readonly nodes: readonly KnowledgeGraphNode[];
  readonly edges: readonly KnowledgeGraphEdge[];
  readonly clusters: ReadonlyMap<string, readonly string[]>;
  readonly telemetry: KnowledgeWorkspaceTelemetry;
};
