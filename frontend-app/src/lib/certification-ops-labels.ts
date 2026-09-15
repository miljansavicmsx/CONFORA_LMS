/**
 * MD08 — Certification operations presentation labels (self-contained).
 *
 * Presentation-only string maps for admin/governance UX. No API calls, no RBAC
 * mutation, no certification decisions. Does not import api-governance.
 */

const APPLICATION_STATUS_LABELS: Readonly<Record<string, string>> = {
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

const DECISION_REVIEW_STATUS_LABELS: Readonly<Record<string, string>> = {
  NOT_STARTED: "Nije započeto",
  IN_REVIEW: "U pregledu odluke",
  DECIDED: "Odluka donesena",
};

const DECISION_OUTCOME_LABELS: Readonly<Record<string, string>> = {
  CERTIFICATION_APPROVED: "Certifikacija odobrena",
  CERTIFICATION_DENIED: "Certifikacija odbijena",
  APPROVED: "Odobreno",
  DENIED: "Odbijeno",
};

function normalizeKey(value: string): string {
  return value.trim().toUpperCase();
}

/** Human-readable application status label; unknown values pass through. */
export function applicationStatusLabel(status: string): string {
  const raw = String(status ?? "");
  const key = normalizeKey(raw);
  if (!key) return raw;
  return APPLICATION_STATUS_LABELS[key] ?? raw;
}

/** Human-readable decision-review status label; unknown values pass through. */
export function decisionReviewStatusLabel(status: string): string {
  const raw = String(status ?? "");
  const key = normalizeKey(raw);
  if (!key) return raw;
  return DECISION_REVIEW_STATUS_LABELS[key] ?? raw;
}

/** Human-readable decision outcome label; null/undefined -> em dash. */
export function decisionOutcomeLabel(outcome: string | null | undefined): string {
  if (outcome == null) return "—";
  const raw = String(outcome);
  const key = normalizeKey(raw);
  if (!key) return "—";
  return DECISION_OUTCOME_LABELS[key] ?? raw;
}
