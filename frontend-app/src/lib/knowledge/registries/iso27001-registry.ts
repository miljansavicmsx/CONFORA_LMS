import type { KnowledgeRegistryClause } from "../knowledge-types";

const wf = (route: string, label: string) => ({ route, label });

export const ISO27001_CLAUSES: readonly KnowledgeRegistryClause[] = [
  {
    id: "27001-isms-scope",
    standardId: "ISO27001",
    clauseRef: "§4 stub",
    title: "ISMS opseg i politika",
    summary: "Za CB: zaštita informacija u certifikacijskom lancu (ispiti, identiteti, tragovi).",
    facets: ["information_security", "management_system"],
    requirements: ["Definiran ISMS opseg.", "Politika sigurnosti."],
    controls: ["ISMS-SCOPE"],
    evidenceGuidance: ["Dokument opsega", "Politika", "SoA presjek (gdje postoji)"],
    auditGuidance: ["Povežite kontrole s audit događajima u platformi."],
    workflowMappings: [wf("/dashboard/iso/audit", "Audit trag"), wf("/dashboard/admin/audit-logs", "Sigurnosni trag")],
    governanceMappings: [],
    relatedRisks: ["RISK-DATA-EXFIL"],
    capaTriggers: ["Visok volumen osjetljivih audit flagova"],
  },
  {
    id: "27001-access-logging",
    standardId: "ISO27001",
    clauseRef: "A.5/A.8 stub",
    title: "Pristup i logiranje",
    summary: "Dokaz o nadzoru pristupa i zadržavanju logova.",
    facets: ["information_security"],
    requirements: ["Kontrolisani privilegijski pristup.", "Retencija logova prema politici."],
    controls: ["ACC-LOG"],
    evidenceGuidance: ["Izvještaji pristupa", "Audit log iz platforme"],
    auditGuidance: [],
    workflowMappings: [wf("/dashboard/iso/audit", "Audit")],
    governanceMappings: [],
    relatedRisks: [],
    capaTriggers: [],
  },
];
