import { EntityKind } from "@/lib/entity-relationships";

import { clauseById, listAllRegistryClauses } from "./registries";
import type { KnowledgeRegistryClause, KnowledgeRelationship } from "./knowledge-types";

let relCounter = 0;
function rid(): string {
  relCounter += 1;
  return `krel-${relCounter}`;
}

/** Predloženi frontend odnosi standard ↔ operativni trag (nije DB edge). */
export function buildRelationshipsForClause(clause: KnowledgeRegistryClause): KnowledgeRelationship[] {
  const links: KnowledgeRelationship[] = [];

  const push = (
    targetKind: KnowledgeRelationship["targetKind"],
    targetId: string,
    relationshipType: KnowledgeRelationship["relationshipType"],
    label: string,
    explainHint: string,
  ) => {
    links.push({
      id: rid(),
      sourceKind: "clause",
      sourceId: clause.id,
      targetKind,
      targetId,
      relationshipType,
      label,
      explainHint,
    });
  };

  for (const wf of clause.workflowMappings) {
    push("workflow", wf.route, "PART_OF", wf.label, "Klauzula se operacionalizira kroz ovaj workflow trag u CONFORA.");
  }

  if (clause.facets.includes("complaints") || clause.capaTriggers.length) {
    push("entity_kind", EntityKind.COMPLAINT, "RELATED_TO", "Modul pritužbi", "Pritužbe mogu pokrenuti CAPA i eskalacije.");
  }
  if (clause.facets.includes("appeals")) {
    push("entity_kind", EntityKind.APPEAL, "ESCALATED_TO", "Modul žalbi", "Žalbe zahtijevaju neovisno razmatranje.");
  }
  if (clause.facets.includes("management_system") || clause.governanceMappings.length) {
    push("entity_kind", EntityKind.MANAGEMENT_REVIEW, "REVIEWED_IN", "Management review", "MR agregira ulaze iz rizika, CAPA i pritužbi.");
  }
  if (clause.facets.some((f) => f === "impartiality" || f === "certification_decision")) {
    push("entity_kind", EntityKind.IMPARTIALITY, "MITIGATES", "Nepristranost", "COI i prijetnje vezane uz klauzulu.");
  }
  if (clause.facets.includes("certification_decision")) {
    push("entity_kind", EntityKind.DECISION, "RESULTED_IN", "Odluke odbora", "Formalni trag odluke.");
    push("entity_kind", EntityKind.CERTIFICATE, "GENERATED", "Certifikat", "Izlaz certifikacijskog lanca.");
  }
  if (clause.capaTriggers.length || clause.facets.includes("management_system")) {
    push("entity_kind", EntityKind.CAPA, "RESULTED_IN", "CAPA trag", "Korektivne mjere iz nalaza ili pritužbi.");
  }
  if (clause.relatedRisks.length || clause.facets.includes("management_system")) {
    push("entity_kind", EntityKind.RISK, "MITIGATES", "Rizik registar", "Rizični skupovi povezani s kontrolama.");
  }
  push("entity_kind", EntityKind.AUDIT_EVENT, "EVIDENCE_FOR", "Audit događaji", "Strukturirani trag platforme i/ili CB internog audita.");

  if (clause.facets.includes("competence")) {
    push("entity_kind", EntityKind.PROCESS, "RELATED_TO", "Kompetencija", "Profili, edukacije, valjanost.");
  }

  return links;
}

export function buildAllKnowledgeRelationships(clauses: readonly KnowledgeRegistryClause[]): KnowledgeRelationship[] {
  const out: KnowledgeRelationship[] = [];
  for (const cl of clauses) {
    out.push(...buildRelationshipsForClause(cl));
  }
  return out;
}

export function relationshipsForClauseId(clauseId: string): KnowledgeRelationship[] {
  const cl = clauseById(clauseId);
  if (!cl) return [];
  return buildRelationshipsForClause(cl);
}

/** Lineage: n-hop preko istog standarda + dijeljenih facet-a (lagano, čisto frontend). */
export function lineageNeighbors(clauseId: string, maxN = 12): KnowledgeRegistryClause[] {
  const root = clauseById(clauseId);
  if (!root) return [];
  const facets = new Set(root.facets);
  const out: KnowledgeRegistryClause[] = [];
  for (const c of listAllRegistryClauses()) {
    if (c.id === clauseId) continue;
    if (c.standardId !== root.standardId && !c.facets.some((f) => facets.has(f))) continue;
    out.push(c);
    if (out.length >= maxN) break;
  }
  return out;
}
