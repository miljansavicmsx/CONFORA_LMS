/**
 * CERT-ELIGIBILITY-UX-1 — Learner certification eligibility labels and section helpers.
 */

export type LearnerCertEligibilityStatus =
  | "ELIGIBLE_TO_APPLY"
  | "IN_PROGRESS_APPLICATION"
  | "BLOCKED_EDUCATION_NOT_COMPLETED"
  | "BLOCKED_EXAM_NOT_PASSED"
  | "BLOCKED_REQUIREMENTS_MISSING"
  | "BLOCKED_SCHEME_UNAVAILABLE"
  | "BLOCKED_IDENTITY_VERIFICATION_REQUIRED"
  | "ALREADY_CERTIFIED"
  | "NOT_APPLICABLE";

export type LearnerCertEligibilityItem = {
  readonly schemeId: string | null;
  readonly schemeTitle: string;
  readonly programmeId: string;
  readonly programmeTitle: string;
  readonly eligibilityStatus: LearnerCertEligibilityStatus;
  readonly learnerLabel: string;
  readonly reason: string | null;
  readonly nextStep: string;
  readonly activeApplicationId: string | null;
  readonly activeApplicationStatus: string | null;
  readonly publicSchemeUrl: string | null;
  readonly publicProgrammeUrl: string | null;
  readonly canApply: boolean;
};

export const CERT_ELIGIBILITY_BOUNDARY_NOTICE =
  "Certifikacija osobe je odvojen postupak od edukacije i ispita. Završena edukacija ili položen ispit mogu biti uslov za prijavu, ali ne predstavljaju odluku o certifikaciji. Odluku donosi nadležna certifikaciona struktura u skladu sa šemom certifikacije.";

export const CERT_APPLY_FORM_PENDING_COPY =
  "Prijava će biti omogućena nakon aktivacije obrasca za ovu šemu.";

const BLOCKED_STATUSES: readonly LearnerCertEligibilityStatus[] = [
  "BLOCKED_EDUCATION_NOT_COMPLETED",
  "BLOCKED_EXAM_NOT_PASSED",
  "BLOCKED_REQUIREMENTS_MISSING",
  "BLOCKED_SCHEME_UNAVAILABLE",
  "BLOCKED_IDENTITY_VERIFICATION_REQUIRED",
  "ALREADY_CERTIFIED",
];

export function isBlockedEligibilityStatus(status: LearnerCertEligibilityStatus): boolean {
  return BLOCKED_STATUSES.includes(status);
}

export function isAvailableEligibilityStatus(status: LearnerCertEligibilityStatus): boolean {
  return status === "ELIGIBLE_TO_APPLY";
}

export function isInProgressEligibilityStatus(status: LearnerCertEligibilityStatus): boolean {
  return status === "IN_PROGRESS_APPLICATION";
}

export function splitEligibilityItems(items: readonly LearnerCertEligibilityItem[]): {
  available: LearnerCertEligibilityItem[];
  inProgress: LearnerCertEligibilityItem[];
  blocked: LearnerCertEligibilityItem[];
} {
  const available: LearnerCertEligibilityItem[] = [];
  const inProgress: LearnerCertEligibilityItem[] = [];
  const blocked: LearnerCertEligibilityItem[] = [];
  for (const item of items) {
    if (isAvailableEligibilityStatus(item.eligibilityStatus)) {
      available.push(item);
    } else if (isInProgressEligibilityStatus(item.eligibilityStatus)) {
      inProgress.push(item);
    } else if (isBlockedEligibilityStatus(item.eligibilityStatus)) {
      blocked.push(item);
    }
  }
  return { available, inProgress, blocked };
}

/** Hide internal enum strings from learner UI when backend sends raw status. */
export function sanitizeLearnerEligibilityLabel(label: string): string {
  const u = label.trim().toUpperCase();
  const map: Record<string, string> = {
    ELIGIBLE_TO_APPLY: "Možete podnijeti prijavu",
    IN_PROGRESS_APPLICATION: "Prijava je već u toku",
    BLOCKED_EDUCATION_NOT_COMPLETED: "Edukacija nije završena",
    BLOCKED_EXAM_NOT_PASSED: "Ispit nije položen",
    BLOCKED_REQUIREMENTS_MISSING: "Nedostaju uslovi",
    BLOCKED_SCHEME_UNAVAILABLE: "Šema trenutno nije dostupna",
    BLOCKED_IDENTITY_VERIFICATION_REQUIRED: "Potrebna je provjera identiteta",
    ALREADY_CERTIFIED: "Već imate certifikat",
    NOT_APPLICABLE: "Nije primjenjivo",
  };
  return map[u] ?? label;
}
