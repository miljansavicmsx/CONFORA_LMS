import { KNOWLEDGE_GLOSSARY, type GlossaryEntry } from "./knowledge-glossary";
import type { KnowledgeRegistryClause } from "./knowledge-types";
import { listAllRegistryClauses } from "./registries";

/** Semantički aliasi za command center (lokalna ekspanzija tokena). */
export const KNOWLEDGE_QUERY_ALIASES: ReadonlyArray<{ readonly phrases: readonly string[]; readonly inject: readonly string[] }> = [
  { phrases: ["impartiality", "nepristranost"], inject: ["iso17024", "coi", "committee"] },
  { phrases: ["conflict of interest", "coi", "sukob interesa"], inject: ["impartiality", "17024", "odbor"] },
  { phrases: ["surveillance", "nadzor"], inject: ["17024", "surveillance", "certificates"] },
  { phrases: ["recertification", "recertifikacija", "obnova"], inject: ["renewal", "competence", "scheme"] },
  { phrases: ["competence validity", "valjanost kompetencije"], inject: ["competence", "profiles", "iso17024"] },
  { phrases: ["appeals", "žalbe"], inject: ["appeals", "17024", "committee"] },
  { phrases: ["complaints", "pritužbe", "prigovor"], inject: ["complaints", "capa", "iso17024"] },
  { phrases: ["examination", "ispit", "item bank"], inject: ["examination", "item-bank", "17024"] },
  { phrases: ["management review", "pregled rukovodstva"], inject: ["management-review", "mr", "governance"] },
  { phrases: ["isms", "27001", "information security"], inject: ["iso27001", "audit", "security"] },
  { phrases: ["innovation", "inovacije", "56001"], inject: ["iso56001", "improvement", "mr"] },
];

export function expandKnowledgeQueryTokens(raw: string): string[] {
  const base = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/gu, " ");
  const bag = new Set(base.split(/[:\s,/]+/u).filter((t) => t.length > 1));
  for (const rule of KNOWLEDGE_QUERY_ALIASES) {
    if (rule.phrases.some((p) => base.includes(p))) {
      for (const t of rule.inject) bag.add(t);
    }
  }
  return [...bag];
}

export function searchRegistryClauses(query: string, limit = 24): KnowledgeRegistryClause[] {
  const tokens = expandKnowledgeQueryTokens(query);
  const clauses = listAllRegistryClauses();
  if (tokens.length === 0) return [...clauses].slice(0, limit);
  const scored = clauses.map((c) => {
    const hay = `${c.title} ${c.summary} ${c.clauseRef} ${c.id} ${c.facets.join(" ")}`.toLowerCase();
    let s = 0;
    for (const t of tokens) {
      if (hay.includes(t)) s += t.length >= 4 ? 6 : 4;
    }
    return { c, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored.filter((x) => x.s > 0).slice(0, limit).map((x) => x.c);
}

export function glossaryMatch(query: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...KNOWLEDGE_GLOSSARY];
  return KNOWLEDGE_GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(q) ||
      g.definition.toLowerCase().includes(q) ||
      g.aliases.some((a) => a.includes(q) || q.includes(a)),
  );
}
