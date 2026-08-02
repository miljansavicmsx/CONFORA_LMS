import type { FrameworkId, RequirementGroup } from "./compliance-types";

export const COMPLIANCE_FRAMEWORK_LABEL: Record<FrameworkId, string> = {
  ISO17024: "ISO/IEC 17024 — Certification of persons",
  ISO17065: "ISO/IEC 17065 — Product/process/service certification",
  ISO17021: "ISO/IEC 17021 — Management system auditing",
  ISO9001: "ISO 9001 — Quality management",
  ISO27001: "ISO/IEC 27001 — Information security",
  WCAG_GOV: "WCAG 2.x — Governance & accessibility",
  INTERNAL_GRC: "Internal governance & controls",
};

/** Grupa zahtjeva (ne kompletno normativno tijelo — orchestration stub). */
export const REQUIREMENT_GROUPS: readonly RequirementGroup[] = [
  {
    id: "17024-person-cert",
    frameworkId: "ISO17024",
    label: "Certification of persons — core",
    clauseRef: "ISO/IEC 17024 (cl. 4–8 heurist.)",
    domains: ["certification", "competence", "traceability"],
    evidenceHints: ["APPLICATION", "DECISION", "CERTIFICATE", "EXAM"],
  },
  {
    id: "17024-impartiality",
    frameworkId: "ISO17024",
    label: "Impartiality & conflict",
    clauseRef: "ISO/IEC 17024 (impartiality annex cues)",
    domains: ["impartiality", "certification", "governance"],
    evidenceHints: ["IMPARTIALITY", "COI", "DECISION"],
  },
  {
    id: "17024-complaints",
    frameworkId: "ISO17024",
    label: "Complaints & appeals",
    clauseRef: "ISO/IEC 17024 (complaints/appeals)",
    domains: ["complaints", "governance", "workflows"],
    evidenceHints: ["COMPLAINT", "APPEAL"],
  },
  {
    id: "17065-structure",
    frameworkId: "ISO17065",
    label: "Conformity assessment structure",
    clauseRef: "ISO/IEC 17065 (organizational integrity — stub)",
    domains: ["governance", "auditability", "certification"],
    evidenceHints: ["AUDIT_EVENT", "MANAGEMENT_REVIEW"],
  },
  {
    id: "17021-audit-ms",
    frameworkId: "ISO17021",
    label: "Audit programme discipline",
    clauseRef: "ISO/IEC 17021 (audit process — stub)",
    domains: ["auditability", "traceability", "workflows"],
    evidenceHints: ["AUDIT_EVENT", "WORKFLOW_STATE"],
  },
  {
    id: "9001-ms",
    frameworkId: "ISO9001",
    label: "MS improvement loop",
    clauseRef: "ISO 9001 (CAPA/MR alignment — stub)",
    domains: ["governance", "quality_ms", "traceability"],
    evidenceHints: ["CAPA", "MANAGEMENT_REVIEW", "RISK"],
  },
  {
    id: "27001-isms",
    frameworkId: "ISO27001",
    label: "Operational security evidence",
    clauseRef: "ISO/IEC 27001 (logging/monitoring — stub)",
    domains: ["information_security", "auditability"],
    evidenceHints: ["AUDIT_EVENT", "VERIFICATION_HASH"],
  },
  {
    id: "wcag-governance",
    frameworkId: "WCAG_GOV",
    label: "Accessible governance UX",
    clauseRef: "WCAG 2.x + org policy",
    domains: ["accessibility", "governance"],
    evidenceHints: ["UI_TELEMETRY"],
  },
  {
    id: "internal-grc",
    frameworkId: "INTERNAL_GRC",
    label: "Internal GRC commitments",
    clauseRef: "CB policy pack",
    domains: ["governance", "workflows", "certification"],
    evidenceHints: ["PROCESS", "MANAGEMENT_ACTION"],
  },
];

export function groupsByFramework(frameworkId: FrameworkId): readonly RequirementGroup[] {
  return REQUIREMENT_GROUPS.filter((g) => g.frameworkId === frameworkId);
}

export function listFrameworkIds(): readonly FrameworkId[] {
  return [
    "ISO17024",
    "ISO17065",
    "ISO17021",
    "ISO9001",
    "ISO27001",
    "WCAG_GOV",
    "INTERNAL_GRC",
  ];
}
