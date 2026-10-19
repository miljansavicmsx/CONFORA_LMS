import type { KnowledgeRegistryClause } from "../knowledge-types";

const wf = (route: string, label: string) => ({ route, label });

export const ISO56001_CLAUSES: readonly KnowledgeRegistryClause[] = [
  {
    id: "56001-innovation-system",
    standardId: "ISO56001",
    clauseRef: "§5 stub",
    title: "Inovacijski menadžment sustav — okvir",
    summary: "Orkestracija znanja: povezivanje učenja, shema i poboljšanja (ne automatizira inovacije).",
    facets: ["innovation_governance", "management_system"],
    requirements: ["Jasna odgovornost za inovacijski unos u MR/CAPA petlju.", "Dokumentirani eksperimenti (minimalno)."],
    controls: ["INN-GOV"],
    evidenceGuidance: ["MR bilješke", "Pilot zapisi", "Lessons learned"],
    auditGuidance: ["Tražite trag od insight-a do akcije (ručno)."],
    workflowMappings: [wf("/dashboard/iso/management-review", "MR"), wf("/dashboard/iso/capa", "CAPA")],
    governanceMappings: [],
    relatedRisks: ["RISK-INN-THEATRICAL"],
    capaTriggers: ["Ponavljajući piloti bez zatvaranja"],
  },
];
