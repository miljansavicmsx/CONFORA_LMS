/**
 * APPEALS-COMPLAINTS-1 — Learner-safe labels for appeals and complaints.
 * žalba ≠ prigovor; contact request remains separate.
 */

export const APPEAL_COMPLAINT_BOUNDARY_NOTICE =
  "Žalba (appeal) je formalni zahtjev za preispitivanje odluke. Prigovor (complaint) je izraz nezadovoljstva procesom ili uslugom. Kontakt podrške nije ni žalba ni prigovor.";

export const APPEAL_SECTION_NOTICE =
  "Žalba služi za preispitivanje odluke koja vas neposredno pogađa (npr. podobnost, odluka o certifikaciji, životni ciklus). Podnošenje žalbe ne mijenja automatski status certifikacije niti rezultat ispita.";

export const COMPLAINT_SECTION_NOTICE =
  "Prigovor služi za nezadovoljstvo procesom, uslugom, ponašanjem, kašnjenjem ili komunikacijom. Prigovor nije žalba na odluku i ne pokreće izdavanje certifikata.";

export const CONTACT_BOUNDARY_NOTICE =
  "Zahtjev za podršku / kontakt ostaje odvojen. Opći upit ne postaje automatski žalba ni prigovor.";

const APPEAL_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Podneseno",
  ACKNOWLEDGED: "Zaprimljeno",
  VOIDED: "Poništeno",
  PENDING_ASSIGNMENT: "Čeka dodjelu",
  UNDER_REVIEW: "U obradi",
  DECIDED: "Odlučeno",
  CLOSED: "Zatvoreno",
  WITHDRAWN: "Povučeno",
};

const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Podneseno",
  ACKNOWLEDGED: "Zaprimljeno",
  VOIDED: "Poništeno",
  UNDER_REVIEW: "U obradi",
  ASSIGNED: "Dodijeljeno",
  IN_PROGRESS: "U toku",
  RESOLVED: "Riješeno",
  CLOSED: "Zatvoreno",
  REJECTED: "Odbijeno",
};

const APPEAL_TYPE_LABELS: Record<string, string> = {
  CERTIFICATION_DECISION_APPEAL: "Žalba na odluku o certifikaciji",
  EXAM_RESULT_APPEAL: "Žalba na rezultat ispita",
  ELIGIBILITY_APPEAL: "Žalba na podobnost",
  RECERTIFICATION_DECISION_APPEAL: "Žalba na odluku o recertifikaciji",
  LIFECYCLE_ACTION_APPEAL: "Žalba na životni ciklus certifikata",
  ADMINISTRATIVE_REJECTION_APPEAL: "Žalba na administrativno odbijanje",
};

const COMPLAINT_CATEGORY_LABELS: Record<string, string> = {
  complaint: "Prigovor na proces / uslugu",
  technical_support: "Tehnički prigovor (platforma)",
  improvement_proposal: "Prijedlog poboljšanja",
  training_proposal: "Prijedlog obuke",
  PROCESS_COMPLAINT: "Prigovor na proces",
  STAFF_CONDUCT_COMPLAINT: "Prigovor na ponašanje osoblja",
  TECHNICAL_SERVICE_COMPLAINT: "Tehnički prigovor",
  OTHER_COMPLAINT: "Ostalo",
};

export function learnerAppealStatusLabel(status: string): string {
  const key = String(status ?? "").trim().toUpperCase();
  return APPEAL_STATUS_LABELS[key] ?? "Status prijave";
}

export function learnerComplaintStatusLabel(status: string): string {
  const key = String(status ?? "").trim().toUpperCase();
  return COMPLAINT_STATUS_LABELS[key] ?? "Status prigovora";
}

export function learnerAppealTypeLabel(appealType: string): string {
  const key = String(appealType ?? "").trim().toUpperCase();
  return APPEAL_TYPE_LABELS[key] ?? "Žalba";
}

export function learnerComplaintCategoryLabel(category: string): string {
  const key = String(category ?? "").trim();
  return COMPLAINT_CATEGORY_LABELS[key] ?? COMPLAINT_CATEGORY_LABELS[key.toUpperCase()] ?? "Prigovor";
}

/** Raw internal enums that must never appear in learner UI copy. */
export const FORBIDDEN_LEARNER_GRIEVANCE_ENUMS = [
  "CERTIFICATION_DECISION_APPEAL",
  "PROCESS_COMPLAINT",
  "APPEAL_SUBMITTED",
  "COMPLAINT_SUBMITTED",
  "ISSUED",
  "ACTIVE",
] as const;
