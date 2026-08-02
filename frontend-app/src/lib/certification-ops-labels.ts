/**
 * CERT-OPS-1 — Human-readable certification operations labels and workflow stage clarity.
 * Technical enums remain available in details/API; UI shows Croatian labels where applicable.
 */
import type { ApplicationStatus } from "@/lib/api-governance";
import { statusLabelHr } from "@/lib/candidate-certification";

export type CertificationWorkflowStageId =
  | "SUBMITTED"
  | "ASSIGNMENT"
  | "REVIEW"
  | "ELIGIBILITY"
  | "DECISION"
  | "ISSUANCE"
  | "LIFECYCLE"
  | "COMPLETE";

export type WorkflowStagePresentation = {
  readonly stageId: CertificationWorkflowStageId;
  readonly stageLabel: string;
  readonly nextAction: string;
  readonly responsibleRole: string;
  readonly blockedReason: string | null;
};

export function applicationStatusLabel(status: ApplicationStatus | string): string {
  return statusLabelHr(status as ApplicationStatus);
}

export function decisionReviewStatusLabel(status: string): string {
  const map: Record<string, string> = {
    NOT_STARTED: "Nije započeto",
    IN_REVIEW: "U pregledu odluke",
    DECIDED: "Odluka donesena",
  };
  const u = String(status ?? "").trim().toUpperCase();
  return map[u] ?? status;
}

export function decisionOutcomeLabel(outcome: string | null | undefined): string {
  if (!outcome) return "—";
  const map: Record<string, string> = {
    CERTIFICATION_APPROVED: "Certifikacija odobrena",
    CERTIFICATION_DENIED: "Certifikacija odbijena",
    APPROVED: "Odobreno",
    DENIED: "Odbijeno",
  };
  return map[String(outcome).toUpperCase()] ?? outcome;
}

export function certificateLifecycleStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ISSUED: "Izdano",
    ACTIVE: "Aktivan",
    SUSPENDED: "Suspendiran",
    REVOKED: "Opozvan",
    EXPIRED: "Istekao",
    REPLACED: "Zamijenjen",
    WITHDRAWN: "Povučen",
  };
  const u = String(status ?? "").trim().toUpperCase();
  return map[u] ?? status;
}

export function kanbanColumnDescription(bucket: "PENDING_REVIEW" | "APPROVED" | "REJECTED"): string {
  if (bucket === "PENDING_REVIEW") return "Prijave u aktivnom pregledu (nije završena odluka)";
  if (bucket === "APPROVED") return "Odluka odobrila certifikaciju — izdavanje / životni ciklus";
  return "Odluka odbila certifikaciju ili prijava nije prihvatljiva";
}

export function resolveCertificationWorkflowStage(input: {
  readonly applicationStatus: string;
  readonly assignmentState?: string;
  readonly reviewStatus?: string;
  readonly eligibilityStatus?: string;
  readonly decisionStatus?: string;
  readonly issuanceStatus?: string;
  readonly decisionOutcome?: string | null;
}): WorkflowStagePresentation {
  const app = String(input.applicationStatus ?? "").toUpperCase();
  const assignment = String(input.assignmentState ?? "NONE").toUpperCase();
  const review = String(input.reviewStatus ?? "NOT_STARTED").toUpperCase();
  const eligibility = String(input.eligibilityStatus ?? "NOT_STARTED").toUpperCase();
  const decision = String(input.decisionStatus ?? "NOT_STARTED").toUpperCase();
  const issuance = String(input.issuanceStatus ?? "NOT_STARTED").toUpperCase();

  if (decision === "DECIDED" && input.decisionOutcome?.includes("DENIED")) {
    return {
      stageId: "COMPLETE",
      stageLabel: "Odluka — certifikacija odbijena",
      nextAction: "Arhiviranje / obavijest kandidatu",
      responsibleRole: "COM_CERT / sekretarijat",
      blockedReason: null,
    };
  }

  if (issuance === "ISSUED" || issuance === "COMPLETED" || app === "CERTIFICATE_ISSUED") {
    return {
      stageId: "LIFECYCLE",
      stageLabel: "Certifikat izdan — životni ciklus",
      nextAction: "Aktivacija (ACTIVE) odvojena od izdavanja (ISSUED); javna verifikacija read-only",
      responsibleRole: "COM_CERT / registar",
      blockedReason: null,
    };
  }

  if (decision === "DECIDED" || app === "APPROVED" || app === "ELIGIBLE_FOR_DECISION") {
    return {
      stageId: "ISSUANCE",
      stageLabel: "Izdavanje certifikata",
      nextAction: "Generiraj dokument i izdaj certifikat (odvojeno od odluke)",
      responsibleRole: "COM_CERT",
      blockedReason: issuance === "NOT_STARTED" ? "Izdavanje još nije započeto" : null,
    };
  }

  if (decision === "IN_REVIEW" || eligibility === "COMPLETED") {
    return {
      stageId: "DECISION",
      stageLabel: "Certifikacijska odluka",
      nextAction: "COM_CERT finalizira odluku uz valjan kvorum (BR-06)",
      responsibleRole: "COM_CERT",
      blockedReason:
        decision === "IN_REVIEW" ? "Potreban dokaz o kvorumu prije finalizacije" : "Započnite pregled odluke",
    };
  }

  if (eligibility === "IN_PROGRESS" || review === "IN_REVIEW") {
    return {
      stageId: "ELIGIBILITY",
      stageLabel: "Pregled prihvatljivosti (eligibility)",
      nextAction: "Pregledaj kriterije i preporuku — ne donosi certifikacijsku odluku",
      responsibleRole: "Certification reviewer / SME",
      blockedReason: eligibility === "NOT_STARTED" ? "Eligibility pregled nije započet" : null,
    };
  }

  if (assignment === "ASSIGNED" || assignment === "ACCEPTED" || assignment === "IN_REVIEW") {
    return {
      stageId: "REVIEW",
      stageLabel: "Dodjela i početak pregleda",
      nextAction: "Reviewer prihvaća dodjelu i započinje pregled",
      responsibleRole: "Certification reviewer",
      blockedReason: assignment === "ASSIGNED" ? "Reviewer mora prihvatiti dodjelu" : null,
    };
  }

  if (app === "SUBMITTED" || app === "PENDING_REVIEW" || app === "UNDER_REVIEW") {
    return {
      stageId: "ASSIGNMENT",
      stageLabel: "Prijava poslana",
      nextAction: "Dodjela pregledača certifikacijskom osoblju",
      responsibleRole: "Certification staff / sekretarijat",
      blockedReason: assignment === "NONE" ? "Nema dodijeljenog pregledača" : null,
    };
  }

  return {
    stageId: "SUBMITTED",
    stageLabel: applicationStatusLabel(app),
    nextAction: "Pratite status prijave",
    responsibleRole: "Certification staff",
    blockedReason: null,
  };
}

export const ROLE_CONTEXT_BANNERS = {
  director: {
    testId: "cert-ops-director-governance-banner",
    text: "Pregled nadzora (D-01) — direktor ne finalizira certifikacijsku odluku.",
  },
  sysadmin: {
    testId: "cert-ops-sysadmin-system-banner",
    text: "Sistemska administracija — bez poslovnih certifikacijskih odluka ili ID provjere.",
  },
  idVerifier: {
    testId: "cert-ops-id-verifier-banner",
    text: "Ručna provjera identiteta — bez biometrije; ne donosi certifikacijsku odluku.",
  },
} as const;
