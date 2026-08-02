import type { EvidenceChannelMapping, GovernanceDomain } from "./compliance-types";

/** Kanali dokaza mapirani na domene (orchestration — nije inventar dokumenata). */
export const EVIDENCE_CHANNEL_MAPPINGS: readonly EvidenceChannelMapping[] = [
  {
    channelId: "audit_trail",
    label: "Strukturirani audit eventi",
    entityKinds: ["AUDIT_EVENT"],
    domains: ["auditability", "information_security", "governance"],
    routeHint: "/dashboard/iso/audit",
  },
  {
    channelId: "workflow",
    label: "Workflow / odbor / COI",
    entityKinds: ["WORKFLOW_STATE", "DECISION", "APPLICATION"],
    domains: ["workflows", "certification", "traceability"],
    routeHint: "/dashboard/iso/decisions",
  },
  {
    channelId: "competence",
    label: "Profili kompetencija",
    entityKinds: ["PROCESS"],
    domains: ["competence", "certification"],
    routeHint: "/dashboard/iso/competence",
  },
  {
    channelId: "capa",
    label: "CAPA / NCR trag",
    entityKinds: ["CAPA", "NONCONFORMITY"],
    domains: ["governance", "quality_ms", "auditability"],
    routeHint: "/dashboard/iso/capa",
  },
  {
    channelId: "complaints",
    label: "Pritužbe i žalbe",
    entityKinds: ["COMPLAINT", "APPEAL"],
    domains: ["complaints", "governance"],
    routeHint: "/dashboard/iso/complaints",
  },
  {
    channelId: "mr",
    label: "Management review",
    entityKinds: ["MANAGEMENT_REVIEW", "MANAGEMENT_ACTION"],
    domains: ["governance", "quality_ms"],
    routeHint: "/dashboard/iso/management-review",
  },
  {
    channelId: "certificates",
    label: "Izdani certifikati",
    entityKinds: ["CERTIFICATE"],
    domains: ["certification", "traceability"],
    routeHint: "/dashboard/iso/certificates",
  },
  {
    channelId: "impartiality",
    label: "Impartiality evidencija",
    entityKinds: ["IMPARTIALITY"],
    domains: ["impartiality", "certification"],
    routeHint: "/dashboard/iso/impartiality",
  },
  {
    channelId: "risk",
    label: "Registar rizika",
    entityKinds: ["RISK"],
    domains: ["governance", "auditability"],
    routeHint: "/dashboard/iso/risks",
  },
];

export function channelsForDomain(domain: GovernanceDomain): readonly EvidenceChannelMapping[] {
  return EVIDENCE_CHANNEL_MAPPINGS.filter((c) => c.domains.includes(domain));
}
