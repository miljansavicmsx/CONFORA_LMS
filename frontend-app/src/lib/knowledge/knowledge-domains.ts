import type { KnowledgeDomain, KnowledgeFacetId } from "./knowledge-types";

export const KNOWLEDGE_DOMAINS: readonly KnowledgeDomain[] = [
  {
    id: "impartiality",
    label: "Impartiality & integrity",
    labelBs: "Nepristranost",
    description: "Threat analysis, COI, committee independence narratives.",
    relatedFacets: ["certification_decision", "management_system"],
  },
  {
    id: "competence",
    label: "Personnel competence",
    labelBs: "Kompetencija osoblja",
    description: "Validity, training evidence, assessor calibration proxies.",
    relatedFacets: ["examination", "certification_decision"],
  },
  {
    id: "examination",
    label: "Examination integrity",
    labelBs: "Ispit",
    description: "Item bank hygiene, secure delivery, grading trace.",
    relatedFacets: ["competence", "certification_decision"],
  },
  {
    id: "certification_decision",
    label: "Certification decisions",
    labelBs: "Odluka o certifikaciji",
    description: "Quorum, traceability, scheme alignment.",
    relatedFacets: ["impartiality", "surveillance"],
  },
  {
    id: "surveillance",
    label: "Surveillance",
    labelBs: "Nadzor",
    description: "Post-certification monitoring, sampling posture.",
    relatedFacets: ["recertification", "complaints"],
  },
  {
    id: "recertification",
    label: "Recertification",
    labelBs: "Recertifikacija",
    description: "Continued competence, renewal cadence.",
    relatedFacets: ["competence", "surveillance"],
  },
  {
    id: "appeals",
    label: "Appeals",
    labelBs: "Žalbe",
    description: "Appeal handling, committee independence.",
    relatedFacets: ["complaints", "certification_decision"],
  },
  {
    id: "complaints",
    label: "Complaints",
    labelBs: "Pritužbe",
    description: "Complaint intake, CAPA hooks, impartiality linkage.",
    relatedFacets: ["management_system", "appeals"],
  },
  {
    id: "management_system",
    label: "Management system (CB)",
    labelBs: "Upravljački sustav",
    description: "MR, document control, internal audit program alignment.",
    relatedFacets: ["impartiality", "information_security"],
  },
  {
    id: "information_security",
    label: "Information security",
    labelBs: "Informacijska sigurnost",
    description: "ISMS controls cross-walk (subset for CB context).",
    relatedFacets: ["management_system"],
  },
  {
    id: "innovation_governance",
    label: "Innovation governance",
    labelBs: "Inovacije",
    description: "ISO 56001-oriented learning / improvement signals (orchestration only).",
    relatedFacets: ["management_system"],
  },
  {
    id: "general",
    label: "General",
    labelBs: "Opće",
    description: "Cross-cutting clauses.",
    relatedFacets: [],
  },
];

export function domainByFacet(id: KnowledgeFacetId): KnowledgeDomain | undefined {
  return KNOWLEDGE_DOMAINS.find((d) => d.id === id);
}
