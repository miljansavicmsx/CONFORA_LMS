/**
 * EXAM-REG-1 — Learner exam registration labels and helpers.
 */
import type { LearnerExamRegistrationEligibilityStatus } from "@/lib/api-exam-registration";

const ELIGIBILITY_LABELS: Record<LearnerExamRegistrationEligibilityStatus, string> = {
  ELIGIBLE_TO_REGISTER: "Možete se prijaviti za ispit",
  ALREADY_REGISTERED: "Ispit je već prijavljen",
  ALREADY_PASSED: "Ispit je već položen",
  BLOCKED_EDUCATION_NOT_COMPLETED: "Edukacija nije završena",
  BLOCKED_NO_ACTIVE_EXAM: "Nema aktivnog ispita",
  BLOCKED_NO_AVAILABLE_SESSION: "Nema dostupnog termina",
  BLOCKED_IDENTITY_VERIFICATION_REQUIRED: "Potrebna je provjera identiteta",
  BLOCKED_PAYMENT_REQUIRED: "Potrebno je evidentirano plaćanje",
  NOT_APPLICABLE: "Nije primjenjivo",
};

const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nacrt",
  REGISTERED: "Prijavljen",
  SCHEDULED: "Zakazan",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završeno",
  CANCELLED: "Otkazano",
  RESULT_RECORDED: "Rezultat evidentiran",
};

export const EXAM_REGISTRATION_BOUNDARY_NOTICE =
  "Prijava za ispit je odvojena od certifikacije osoba. Položen ispit može biti jedan od uslova za prijavu za certifikaciju, ali ne predstavlja odluku o certifikaciji niti izdavanje certifikata.";

export const EXAM_REGISTRATION_RESULTS_NOTICE =
  "Rezultati ispita se evidentiraju kroz poseban proces. Ova stranica služi samo za prijavu i pregled statusa prijave.";

export const EXAM_REGISTRATION_AVAILABLE_EMPTY =
  "Trenutno nemate programa spremnog za prijavu na ispit. Prijava je moguća nakon završetka edukacije i objave aktivnog ispita.";

export const EXAM_REGISTRATION_MY_EMPTY =
  "Još nemate evidentiranih prijava za ispit.";

export const EXAM_REGISTRATION_BLOCKED_EMPTY =
  "Nema programa koji čekaju ispunjenje uslova za prijavu.";

export function learnerExamRegistrationEligibilityLabel(
  status: LearnerExamRegistrationEligibilityStatus | string,
): string {
  const u = String(status ?? "").trim().toUpperCase() as LearnerExamRegistrationEligibilityStatus;
  return ELIGIBILITY_LABELS[u] ?? "Status prijave";
}

export function learnerExamRegistrationStatusLabel(status: string | null | undefined): string {
  const u = String(status ?? "").trim().toUpperCase();
  return REGISTRATION_STATUS_LABELS[u] ?? "Status prijave";
}

export function hideRawExamRegistrationEnum(text: string): boolean {
  const u = text.toUpperCase();
  return u.includes("ELIGIBLE_TO_REGISTER") || u.includes("BLOCKED_EDUCATION") || u.includes("COURSE_EXAM");
}
