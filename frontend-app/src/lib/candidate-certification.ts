/**
 * Poslovna pravila za kandidatski prikaz prijava (ISO 17024) — čisto na frontendu uz backend statuse.
 */

import type { ApplicationStatus, CertificationApplicationItem } from "@/lib/api-governance";

const EDITABLE_STATUSES = new Set<ApplicationStatus>([
  "DRAFT",
  "AWAITING_MORE_INFO",
  "RETURNED_FOR_MORE_INFO",
  "REQUEST_INFO",
]);

/** Aktivni odborski / sekretarijatski pregled — kandidat ne smije uređivati. */
const COMMITTEE_REVIEW_STATUSES = new Set<ApplicationStatus>([
  "SUBMITTED",
  "SCREENING",
  "PENDING_REVIEW",
  "UNDER_REVIEW",
  "VERIFIERS_CONFIRMED",
  "SENT_TO_COMMITTEE",
  "ELIGIBLE_FOR_DECISION",
  "APPROVED_FOR_DECISION",
]);

const REJECTED_STATUSES = new Set<ApplicationStatus>([
  "REJECTED",
  "REJECTED_AFTER_DECISION",
  "INELIGIBLE",
  "REJECTED_AT_APPLICATION_STAGE",
]);

export function candidateMayEditApplication(app: CertificationApplicationItem): boolean {
  if (app.editLocked === true) {
    return false;
  }
  return EDITABLE_STATUSES.has(app.status);
}

export function isUnderCommitteeReview(app: CertificationApplicationItem): boolean {
  if (app.editLocked === true && !EDITABLE_STATUSES.has(app.status)) {
    return true;
  }
  return COMMITTEE_REVIEW_STATUSES.has(app.status);
}

export function isRejectedApplication(app: CertificationApplicationItem): boolean {
  return REJECTED_STATUSES.has(app.status);
}

export function isApprovedForCertificatePath(app: CertificationApplicationItem): boolean {
  return app.status === "APPROVED" || app.status === "ELIGIBLE_FOR_DECISION";
}

export function isTerminalCertificationApplicationStatus(raw: string): boolean {
  const u = raw.trim().toUpperCase();
  return (
    u === "REJECTED" ||
    u === "REJECTED_AFTER_DECISION" ||
    u === "INELIGIBLE" ||
    u === "REJECTED_AT_APPLICATION_STAGE" ||
    u === "WITHDRAWN" ||
    u === "ARCHIVED" ||
    u === "APPEALED"
  );
}

/** Aktivni tok koji sprječava novu paralelnu prijavu za isti program. */
export function certificationApplicationBlocksNewSubmission(existing: {
  readonly status: ApplicationStatus | string;
}): boolean {
  const u = String(existing.status ?? "").trim().toUpperCase();
  if (!u || u === "DRAFT") {
    return false;
  }
  return !isTerminalCertificationApplicationStatus(String(existing.status));
}

export function statusLabelHr(status: ApplicationStatus): string {
  const labels: Partial<Record<ApplicationStatus, string>> = {
    DRAFT: "Nacrt",
    SUBMITTED: "Podneseno",
    SCREENING: "U pregledu",
    PENDING_REVIEW: "U pregledu",
    UNDER_REVIEW: "U obradi odbora",
    VERIFIERS_CONFIRMED: "Potvrde kontakata primljene",
    SENT_TO_COMMITTEE: "Poslano odboru na odluku",
    AWAITING_MORE_INFO: "Čeka dodatne informacije",
    REQUEST_INFO: "Zatražene dodatne informacije",
    RETURNED_FOR_MORE_INFO: "Vraćeno za dopunu",
    APPROVED_FOR_DECISION: "Spremno za odluku",
    ELIGIBILITY_REVIEW_COMPLETED: "Pregled podobnosti završen",
    EXAM_AUTHORIZATION_COMPLETED: "Odobrenje za ispit završeno",
    CERTIFICATION_DECISION_RECORDED: "Odluka o certifikaciji evidentirana",
    ELIGIBLE_FOR_DECISION: "Prihvatljivo za odluku",
    APPROVED: "Odobreno",
    REJECTED_AT_APPLICATION_STAGE: "Odbijeno (faza prijave)",
    WITHDRAWN: "Povučeno",
    ARCHIVED: "Arhivirano",
    INELIGIBLE: "Nije prihvatljivo",
    REJECTED: "Odbijeno",
    REJECTED_AFTER_DECISION: "Odbijeno (odluka)",
    APPEALED: "Žalba u tijeku",
  };
  return labels[status] ?? status;
}
