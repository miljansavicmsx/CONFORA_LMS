import type {
  ComplianceHeuristicSnapshot,
  ComplianceRequirement,
  FrameworkId,
  GovernanceDomain,
  RequirementGroup,
  TraceabilityLink,
} from "./compliance-types";
import { REQUIREMENT_GROUPS } from "./compliance-frameworks";
import { EntityKind } from "@/lib/entity-relationships";

function req(
  id: string,
  group: RequirementGroup,
  title: string,
  clauseRef: string,
  domains: readonly GovernanceDomain[],
  weight: number,
): ComplianceRequirement {
  return {
    id,
    groupId: group.id,
    frameworkId: group.frameworkId,
    title,
    clauseRef,
    domains,
    weight,
  };
}

/** Atomski zahtjevi za matricu pokrivenosti (stubovi za UX). */
export function buildComplianceRequirements(): readonly ComplianceRequirement[] {
  const g = (id: string) => REQUIREMENT_GROUPS.find((x) => x.id === id)!;

  const out: ComplianceRequirement[] = [
    req("r-17024-cmp", g("17024-person-cert"), "Kompetencija ocjenjivača i kandidata", "§7.x stub", g("17024-person-cert").domains, 1.2),
    req("r-17024-imp", g("17024-impartiality"), "Nepristranost i COI kontrola", "§6.x stub", g("17024-impartiality").domains, 1.3),
    req("r-17024-ca", g("17024-person-cert"), "Certifikacijski odlučni trag", "§8.x stub", ["certification", "traceability", "workflows"], 1.25),
    req("r-17024-cmp-h", g("17024-complaints"), "Pritužbe i žalbe — trag", "§9.x stub", g("17024-complaints").domains, 1.1),
    req("r-17065-gov", g("17065-structure"), "Struktura CA tijela", "§4 stub", g("17065-structure").domains, 1),
    req("r-17021-ap", g("17021-audit-ms"), "Program internih/eksternih audit dokaza", "§stub", g("17021-audit-ms").domains, 1.05),
    req("r-9001-capa", g("9001-ms"), "CAPA i kontinuirano poboljšanje", "§10 stub", ["governance", "quality_ms"], 1.1),
    req("r-27001-ev", g("27001-isms"), "Sigurnosni audit trag", "A.12 stub", g("27001-isms").domains, 1),
    req("r-wcag", g("wcag-governance"), "Pristupačnost upravljačkih površina", "2.4 stub", g("wcag-governance").domains, 0.85),
    req("r-int-ctl", g("internal-grc"), "Interna politika i odobrenja", "CB-INT stub", g("internal-grc").domains, 1),
  ];

  return out;
}

export function requirementsForFramework(frameworkId: FrameworkId): readonly ComplianceRequirement[] {
  return buildComplianceRequirements().filter((r) => r.frameworkId === frameworkId);
}

export function requirementById(id: string): ComplianceRequirement | undefined {
  return buildComplianceRequirements().find((r) => r.id === id);
}

/**
 * Tragovi usklađeni s entity relationship vokabularom (predloženi linkovi — nisu DB edge).
 */
export function buildRequirementTraceability(
  requirementId: string,
  s: ComplianceHeuristicSnapshot,
): TraceabilityLink[] {
  const req = requirementById(requirementId);
  if (!req) return [];

  const links: TraceabilityLink[] = [];

  const push = (relationshipType: string, targetKind: string, targetLabel: string, deepLink?: string) => {
    links.push(
      deepLink !== undefined
        ? { requirementId, relationshipType, targetKind, targetLabel, deepLink }
        : { requirementId, relationshipType, targetKind, targetLabel },
    );
  };

  if (req.domains.includes("certification") || req.domains.includes("traceability")) {
    push("EVIDENCE_FOR", EntityKind.DECISION, `Otvorene odluke (proxy ${s.decisionsOpen})`, "/dashboard/iso/decisions");
    push("PART_OF", EntityKind.APPLICATION, `Certifikacijski queue (proxy ${s.certQueue})`, "/dashboard/iso/applications");
  }
  if (req.domains.includes("competence")) {
    push("RELATED_TO", EntityKind.PROCESS, `Kompetencija pod pritiskom (${s.competenceDue})`, "/dashboard/iso/competence");
  }
  if (req.domains.includes("complaints")) {
    push("TRIGGERED", EntityKind.COMPLAINT, `Otvorene pritužbe (${s.openComplaints})`, "/dashboard/iso/complaints");
    push("ESCALATED_TO", EntityKind.APPEAL, `Žalbe (${s.openAppeals})`, "/dashboard/iso/appeals");
  }
  if (req.domains.includes("impartiality")) {
    push("MITIGATES", EntityKind.IMPARTIALITY, `Impartiality prijetnje (${s.impartialityThreats})`, "/dashboard/iso/impartiality");
  }
  if (req.domains.includes("quality_ms") || req.domains.includes("governance")) {
    push("RESULTED_IN", EntityKind.CAPA, `CAPA otvorenost (${s.capaOpen + s.capaOverdue})`, "/dashboard/iso/capa");
    push("REVIEWED_IN", EntityKind.MANAGEMENT_REVIEW, `MR čekanje (${s.managementReviewPendingApproval})`, "/dashboard/iso/management-review");
    push("MITIGATES", EntityKind.RISK, `Rizici HIGH/CRIT (${s.riskOpenHighCritical})`, "/dashboard/iso/risks");
  }
  if (req.domains.includes("auditability") || req.domains.includes("information_security")) {
    push("EVIDENCE_FOR", EntityKind.AUDIT_EVENT, `Audit događaji (uzorak ${s.auditEventsRecent})`, "/dashboard/iso/audit");
  }
  if (req.domains.includes("certification")) {
    push("GENERATED", EntityKind.CERTIFICATE, "Registar certifikata", "/dashboard/iso/certificates");
  }

  return links;
}

export function buildAllTraceability(
  requirements: readonly ComplianceRequirement[],
  s: ComplianceHeuristicSnapshot,
): TraceabilityLink[] {
  const out: TraceabilityLink[] = [];
  for (const r of requirements.slice(0, 6)) {
    out.push(...buildRequirementTraceability(r.id, s));
  }
  return out;
}
