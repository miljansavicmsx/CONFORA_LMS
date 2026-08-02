import type { TwinNormalizedInput } from "@/lib/digital-twin/twin-types";

import { buildAllKnowledgeRelationships } from "../knowledge/knowledge-relationships";
import type { KnowledgeRegistryClause } from "../knowledge/knowledge-types";
import type { KnowledgeGraph, KnowledgeGraphEdge, KnowledgeGraphNode } from "./knowledge-graph-types";
import { listAllRegistryClauses } from "../knowledge/registries";

function severityForClause(cl: KnowledgeRegistryClause, s: TwinNormalizedInput): number {
  let x = 20;
  if (cl.facets.includes("impartiality")) x += s.impartialityThreats * 5;
  if (cl.facets.includes("complaints")) x += s.openComplaints * 2;
  if (cl.facets.includes("certification_decision")) x += s.coiIncomplete * 4 + s.quorumPending * 2;
  if (cl.facets.includes("management_system")) x += s.managementReviewOverdueActions * 3;
  return Math.min(100, Math.round(x));
}

function trustForClause(cl: KnowledgeRegistryClause): number {
  return Math.min(100, 55 + cl.controls.length * 6 + cl.evidenceGuidance.length * 2);
}

let eid = 0;
function e(): string {
  eid += 1;
  return `kge-${eid}`;
}

export function clusterKnowledgeGraphNodes(nodes: readonly KnowledgeGraphNode[]): Map<string, readonly string[]> {
  const m = new Map<string, string[]>();
  for (const n of nodes) {
    const arr = m.get(n.clusterId) ?? [];
    arr.push(n.id);
    m.set(n.clusterId, arr);
  }
  return new Map([...m.entries()].map(([k, v]) => [k, [...v]] as const));
}

export function buildKnowledgeGraph(
  clauses: readonly KnowledgeRegistryClause[],
  snapshot: TwinNormalizedInput,
): KnowledgeGraph {
  eid = 0;
  const nodes: KnowledgeGraphNode[] = [];
  const edges: KnowledgeGraphEdge[] = [];

  for (const cl of clauses) {
    const nid = `clause:${cl.id}`;
    nodes.push({
      id: nid,
      kind: "clause",
      label: cl.clauseRef,
      sublabel: cl.title,
      severity: severityForClause(cl, snapshot),
      trust: trustForClause(cl),
      standardLabel: cl.standardId,
      clusterId: cl.standardId,
    });

    for (const w of cl.workflowMappings) {
      const wid = `wf:${w.route}`;
      if (!nodes.some((n) => n.id === wid)) {
        nodes.push({
          id: wid,
          kind: "workflow",
          label: w.label,
          sublabel: w.route,
          severity: 35,
          trust: 70,
          clusterId: cl.standardId,
        });
      }
      edges.push({
        id: e(),
        from: nid,
        to: wid,
        kind: "workflow_lineage",
        label: "workflow map",
      });
    }

    for (let i = 0; i < cl.evidenceGuidance.length; i++) {
      const eidn = `ev:${cl.id}:${i}`;
      nodes.push({
        id: eidn,
        kind: "evidence",
        label: "Evidence hint",
        sublabel: cl.evidenceGuidance[i]!.slice(0, 80),
        severity: 25,
        trust: 60,
        clusterId: cl.standardId,
      });
      edges.push({
        id: e(),
        from: nid,
        to: eidn,
        kind: "evidence_lineage",
        label: "evidence",
      });
    }

    if (cl.facets.includes("certification_decision")) {
      const cid = "cert-chain:root";
      if (!nodes.some((n) => n.id === cid)) {
        nodes.push({
          id: cid,
          kind: "cert_chain",
          label: "Certification chain",
          sublabel: "Application → Decision → Certificate",
          severity: 40,
          trust: 68,
          clusterId: "CERT",
        });
      }
      edges.push({ id: e(), from: nid, to: cid, kind: "certification_lineage", label: "scheme chain" });
    }
  }

  const rels = buildAllKnowledgeRelationships(clauses);
  for (const r of rels) {
    if (r.sourceKind !== "clause") continue;
    const tid =
      r.targetKind === "workflow"
        ? `wf:${r.targetId}`
        : `entity:${r.targetId}:${r.relationshipType}`;
    if (!nodes.some((n) => n.id === tid)) {
      nodes.push({
        id: tid,
        kind: r.targetKind === "workflow" ? "workflow" : "governance",
        label: r.label,
        sublabel: r.explainHint.slice(0, 72),
        severity: 30,
        trust: 62,
        clusterId: "REL",
      });
    }
    edges.push({
      id: e(),
      from: `clause:${r.sourceId}`,
      to: tid,
      kind: "governance_lineage",
      label: r.relationshipType,
    });
  }

  const clauseNodes = nodes.filter((n) => n.kind === "clause");
  const evidenceNodes = nodes.filter((n) => n.kind === "evidence");
  const orphanEvidence = evidenceNodes.filter((n) => !edges.some((e) => e.to === n.id)).length;
  const orphanReqProxy = clauseNodes.filter((c) => c.severity >= 85).length;

  const unresolved = edges.filter((ed) => ed.kind === "governance_lineage").length;
  const telemetry = {
    coverageDensity: Math.min(100, Math.round((edges.length / Math.max(1, nodes.length)) * 40)),
    orphanRequirements: orphanReqProxy,
    orphanEvidence,
    unresolvedRelationships: unresolved,
    governanceBlindSpots: snapshot.openGovernanceCases > 6 ? snapshot.openGovernanceCases : 0,
    weakAuditTraceability: snapshot.openAuditFindings > snapshot.internalAuditRecords ? 1 : 0,
    weakEvidenceConfidence: orphanEvidence > 3 ? 1 : 0,
  };

  return {
    nodes,
    edges,
    clusters: clusterKnowledgeGraphNodes(nodes),
    telemetry,
  };
}

export function buildDefaultKnowledgeGraph(snapshot: TwinNormalizedInput): KnowledgeGraph {
  return buildKnowledgeGraph(listAllRegistryClauses(), snapshot);
}

export * from "./knowledge-graph-types";
