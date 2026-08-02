import type { KnowledgeRegistryClause } from "../knowledge-types";

const wf = (route: string, label: string) => ({ route, label });

/** Interni GRC presjeci — poveznice na CONFORA module, bez novog backenda. */
export const GOVERNANCE_REGISTRY_CLAUSES: readonly KnowledgeRegistryClause[] = [
  {
    id: "grc-abac-trace",
    standardId: "INTERNAL_GRC",
    clauseRef: "CB-INT-ABAC",
    title: "ABAC trag i razdvajanje dužnosti (prikaz)",
    summary: "Orkestracija prikazuje veze ruta i uloga; ne mijenja ABAC motor.",
    facets: ["management_system"],
    requirements: ["Svaka osetljiva ruta implicira ljudsku provjeru ovlasti."],
    controls: ["INT-ABAC-VIEW"],
    evidenceGuidance: ["Matrix uloga", "Audit događaji"],
    auditGuidance: ["Za uzorak korisnika provjerite usklađenost UI i politike."],
    workflowMappings: [wf("/dashboard/admin/roles", "Uloge")],
    governanceMappings: [],
    relatedRisks: ["RISK-PRIV-CREEP"],
    capaTriggers: ["Anomalije u audit uzorku"],
  },
  {
    id: "grc-data-residency-display",
    standardId: "INTERNAL_GRC",
    clauseRef: "CB-INT-DATA",
    title: "Zadržavanje i klasifikacija dokumenata (UI)",
    summary: "Podsjetnici na politiku retencije u knowledge sloju.",
    facets: ["management_system", "information_security"],
    requirements: ["Ne prikazuj PII u knowledge grafu — samo reference na module."],
    controls: ["INT-NO-PII-KG"],
    evidenceGuidance: ["Politika retencije", "Audit trag"],
    auditGuidance: [],
    workflowMappings: [wf("/dashboard/iso/governance", "Governance")],
    governanceMappings: [],
    relatedRisks: [],
    capaTriggers: [],
  },
];
