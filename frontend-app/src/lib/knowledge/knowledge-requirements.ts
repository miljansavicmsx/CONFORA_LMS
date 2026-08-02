import type { KnowledgeFacetId, KnowledgeRegistryClause, KnowledgeRequirement } from "./knowledge-types";

/** Atomizira registry klauzule u redove za matrice (UI / heuristike). */
export function buildKnowledgeRequirementsFromRegistry(clauses: readonly KnowledgeRegistryClause[]): KnowledgeRequirement[] {
  const out: KnowledgeRequirement[] = [];
  for (const cl of clauses) {
    const facet: KnowledgeFacetId = cl.facets[0] ?? "general";
    let i = 0;
    for (const text of cl.requirements) {
      i += 1;
      out.push({
        id: `${cl.id}-rq-${i}`,
        clauseId: cl.id,
        standardId: cl.standardId,
        text,
        facet,
        weight: 1 + i * 0.05,
      });
    }
    let j = 0;
    for (const text of cl.controls) {
      j += 1;
      out.push({
        id: `${cl.id}-ctl-${j}`,
        clauseId: cl.id,
        standardId: cl.standardId,
        text: `Kontrola: ${text}`,
        facet,
        weight: 1.2 + j * 0.05,
      });
    }
  }
  return out;
}

export function requirementsForClause(clause: KnowledgeRegistryClause, all: readonly KnowledgeRequirement[]): KnowledgeRequirement[] {
  return all.filter((r) => r.clauseId === clause.id);
}
