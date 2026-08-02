import type { KnowledgeRegistryClause } from "../knowledge-types";

const wf = (route: string, label: string) => ({ route, label });

export const ISO9001_CLAUSES: readonly KnowledgeRegistryClause[] = [
  {
    id: "9001-context-leadership",
    standardId: "ISO9001",
    clauseRef: "§4–5 stub",
    title: "Kontekst organizacije i vodstvo",
    summary: "MS povezuje strateške ciljeve i kvalitetu — presjek za CB podršku.",
    facets: ["management_system"],
    requirements: ["Razumijevanje interesiranih strana.", "Politika kvalitete."],
    controls: ["CTX-MS"],
    evidenceGuidance: ["SWOT / kontekst", "Politika", "Ciljevi"],
    auditGuidance: ["Povežite ciljeve s MR ulazima."],
    workflowMappings: [wf("/dashboard/iso/governance", "Governance"), wf("/dashboard/iso/management-review", "MR")],
    governanceMappings: [],
    relatedRisks: [],
    capaTriggers: [],
  },
  {
    id: "9001-improvement",
    standardId: "ISO9001",
    clauseRef: "§10 stub",
    title: "Poboljšanje i CAPA",
    summary: "Nusklađenosti, korektivne akcije i kontinuirano poboljšanje.",
    facets: ["management_system", "complaints"],
    requirements: ["CAPA metodologija", "Učinkovitost akcija."],
    controls: ["IMPR-CAPA"],
    evidenceGuidance: ["NCR", "CAPA kartice", "Effectiveness review"],
    auditGuidance: ["Pratite zatvaranje uzoraka nalaza."],
    workflowMappings: [wf("/dashboard/iso/capa", "CAPA")],
    governanceMappings: [],
    relatedRisks: [],
    capaTriggers: [],
  },
];
