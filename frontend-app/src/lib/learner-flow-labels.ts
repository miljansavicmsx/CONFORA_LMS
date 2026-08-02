/**
 * LEARNER-FLOW-1 — Learner/candidate journey labels, next actions and boundary copy.
 */
import type { ApplicationStatus } from "@/lib/api-governance";
import { certificateLifecycleStatusLabel } from "@/lib/certification-ops-labels";
import { statusLabelHr } from "@/lib/candidate-certification";

export { certificateLifecycleStatusLabel };

/** Fields that must never appear in learner-facing application summaries. */
export const LEARNER_PRIVATE_FIELD_KEYS = [
  "reviewerNotes",
  "committeeDeliberation",
  "identityDocument",
  "auditPayload",
  "dossier",
  "quorumEvidence",
  "internalAudit",
  "eligibilityReviewerNotes",
] as const;

export const LEARNER_EDUCATION_CERT_BOUNDARY_MESSAGE =
  "Završetak edukacije ili potvrda o ispitu nije ISO/IEC 17024 certifikacija. Certifikacija zahtijeva zasebnu prijavu, pregled, odluku odbora i izdavanje.";

export const LEARNER_ISSUED_ACTIVE_BOUNDARY =
  "Izdano (ISSUED) nije isto što i aktivno (ACTIVE) u životnom ciklu certifikata.";

export function moduleProgressLabel(status: string): string {
  const map: Record<string, string> = {
    NOT_STARTED: "Nije započeto",
    IN_PROGRESS: "U tijeku",
    COMPLETED: "Završeno",
  };
  return map[String(status ?? "").trim().toUpperCase()] ?? status;
}

export function candidateApplicationNextStep(status: ApplicationStatus | string): {
  readonly title: string;
  readonly detail: string;
} {
  const u = String(status ?? "").trim().toUpperCase();
  if (u === "DRAFT") {
    return {
      title: "Dovršite i pošaljite prijavu",
      detail: "Otvorite čarobnjak, provjerite dokaze i pošaljite prijavu kada ste spremni.",
    };
  }
  if (u === "SUBMITTED" || u === "SCREENING" || u === "PENDING_REVIEW" || u === "UNDER_REVIEW") {
    return {
      title: "Prijava je na pregledu",
      detail: "Tijelo za certifikaciju pregledava prijavu. Uređivanje je zaključano dok traje aktivni pregled.",
    };
  }
  if (u === "AWAITING_MORE_INFO" || u === "REQUEST_INFO" || u === "RETURNED_FOR_MORE_INFO") {
    return {
      title: "Potrebna je dopuna",
      detail: "Otvorite prijavu i dostavite tražene informacije ili dokaze.",
    };
  }
  if (u === "ELIGIBLE_FOR_DECISION" || u === "APPROVED_FOR_DECISION" || u === "SENT_TO_COMMITTEE") {
    return {
      title: "Čeka se odluka odbora",
      detail: "Odluka o certifikaciji donosi se odvojeno od edukacije. Nema automatskog odobrenja.",
    };
  }
  if (u === "APPROVED") {
    return {
      title: "Odluka pozitivna — izdavanje certifikata",
      detail: "Certifikat se izdaje nakon formalnog postupka. Provjerite „Moji dokumenti“ kada bude dostupan.",
    };
  }
  if (u === "REJECTED" || u === "REJECTED_AFTER_DECISION" || u === "INELIGIBLE") {
    return {
      title: "Odluka ili prijava nije povoljna",
      detail: "Pogledajte status toka i opcije žalbe ako su dostupne.",
    };
  }
  return {
    title: "Pratite status prijave",
    detail: `Trenutni status: ${statusLabelHr(status as ApplicationStatus)}.`,
  };
}

export function containsLearnerPrivateFields(payload: Record<string, unknown>): boolean {
  return LEARNER_PRIVATE_FIELD_KEYS.some((k) => {
    const v = payload[k];
    return v != null && String(v).trim() !== "";
  });
}
