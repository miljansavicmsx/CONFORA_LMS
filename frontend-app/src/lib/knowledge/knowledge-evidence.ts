import type { KnowledgeEvidence, KnowledgeFacetId } from "./knowledge-types";

/** Kanali dokaza mapirani na klauzule / facet-e (orchestration prikaz). */
export const KNOWLEDGE_EVIDENCE_CHANNELS: readonly KnowledgeEvidence[] = [
  {
    id: "ev-audit-platform",
    kind: "audit_event",
    label: "Audit događaji platforme",
    clauseIds: [],
    routeHint: "/dashboard/iso/audit",
    entityKinds: ["AUDIT_EVENT"],
  },
  {
    id: "ev-workflow",
    kind: "workflow_state",
    label: "Workflow stanja (certifikacija)",
    clauseIds: [],
    routeHint: "/dashboard/iso/decisions",
    entityKinds: ["WORKFLOW_STATE", "DECISION"],
  },
  {
    id: "ev-approval",
    kind: "approval",
    label: "Odobrenja odbora / shema",
    clauseIds: [],
    routeHint: "/dashboard/iso/schemes",
    entityKinds: ["SCHEME"],
  },
  {
    id: "ev-competence",
    kind: "competence_profile",
    label: "Profili kompetencija",
    clauseIds: [],
    routeHint: "/dashboard/iso/competence",
    entityKinds: ["PROCESS"],
  },
  {
    id: "ev-capa",
    kind: "capa",
    label: "CAPA i NCR",
    clauseIds: [],
    routeHint: "/dashboard/iso/capa",
    entityKinds: ["CAPA", "NONCONFORMITY"],
  },
  {
    id: "ev-complaint",
    kind: "complaint",
    label: "Pritužbe",
    clauseIds: [],
    routeHint: "/dashboard/iso/complaints",
    entityKinds: ["COMPLAINT"],
  },
  {
    id: "ev-cert",
    kind: "certificate",
    label: "Certifikati",
    clauseIds: [],
    routeHint: "/dashboard/iso/certificates",
    entityKinds: ["CERTIFICATE"],
  },
  {
    id: "ev-mr",
    kind: "management_review",
    label: "Management review",
    clauseIds: [],
    routeHint: "/dashboard/iso/management-review",
    entityKinds: ["MANAGEMENT_REVIEW"],
  },
];

const FACET_CHANNELS: Partial<Record<KnowledgeFacetId, readonly string[]>> = {
  impartiality: ["ev-audit-platform", "ev-workflow", "ev-complaint"],
  competence: ["ev-competence", "ev-audit-platform"],
  examination: ["ev-audit-platform", "ev-workflow"],
  certification_decision: ["ev-workflow", "ev-approval", "ev-cert"],
  surveillance: ["ev-cert", "ev-capa", "ev-audit-platform"],
  recertification: ["ev-cert", "ev-competence", "ev-capa"],
  appeals: ["ev-complaint", "ev-workflow", "ev-audit-platform"],
  complaints: ["ev-complaint", "ev-capa", "ev-mr"],
  management_system: ["ev-mr", "ev-capa", "ev-audit-platform"],
  information_security: ["ev-audit-platform"],
  innovation_governance: ["ev-mr", "ev-capa"],
  general: ["ev-audit-platform"],
};

export function evidenceChannelsForFacet(facet: KnowledgeFacetId): KnowledgeEvidence[] {
  const ids = FACET_CHANNELS[facet] ?? ["ev-audit-platform"];
  return KNOWLEDGE_EVIDENCE_CHANNELS.filter((e) => ids.includes(e.id));
}
