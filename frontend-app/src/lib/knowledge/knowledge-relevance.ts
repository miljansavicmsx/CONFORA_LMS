import type { KnowledgeFacetId, KnowledgeRegistryClause } from "./knowledge-types";

/** Lagana relevantnost klauzule za snapshot teksta (bez LLM-a). */
export function clauseRelevanceScore(clause: KnowledgeRegistryClause, contextTokens: readonly string[]): number {
  const hay = `${clause.title} ${clause.summary} ${clause.requirements.join(" ")}`.toLowerCase();
  let s = 0;
  for (const t of contextTokens) {
    const x = t.toLowerCase();
    if (x.length < 2) continue;
    if (hay.includes(x)) s += x.length >= 5 ? 8 : 5;
  }
  for (const f of clause.facets) {
    if (contextTokens.some((t) => t.toLowerCase() === f)) s += 6;
  }
  return s;
}

export function rankClausesByRelevance(
  clauses: readonly KnowledgeRegistryClause[],
  contextTokens: readonly string[],
  limit = 12,
): KnowledgeRegistryClause[] {
  const scored = clauses.map((c) => ({ c, s: clauseRelevanceScore(c, contextTokens) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.filter((x) => x.s > 0).slice(0, limit).map((x) => x.c);
}

export function facetBoost(facet: KnowledgeFacetId, pressure: Partial<Record<KnowledgeFacetId, number>>): number {
  const v = pressure[facet];
  return typeof v === "number" ? v : 0;
}
