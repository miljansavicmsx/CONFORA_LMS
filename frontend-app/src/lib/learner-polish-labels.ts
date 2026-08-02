/**
 * LEARNER-POLISH-2 — Learner-facing labels, catalog sectors, and safe display helpers.
 */
import type { CatalogCourseRow } from "@/lib/lms-learner-api";
import type { EducationEnrolment } from "@/lib/learner-education-api";

/** User-facing catalog sectors (UI fallback when backend has no sector slug). */
export const CATALOG_SECTOR_LABELS = [
  "Informaciona bezbjednost",
  "Upravljanje kvalitetom",
  "Laboratorijska ispitivanja",
  "Certifikacija osoba",
  "Interni auditi",
  "Upravljanje rizicima",
  "Opšte edukacije",
] as const;

export type CatalogSectorLabel = (typeof CATALOG_SECTOR_LABELS)[number];

const SCOPE_TO_SECTOR: ReadonlyArray<{ pattern: RegExp; sector: CatalogSectorLabel }> = [
  { pattern: /27001|cyber|security|informacion/i, sector: "Informaciona bezbjednost" },
  { pattern: /9001|kvalitet|quality/i, sector: "Upravljanje kvalitetom" },
  { pattern: /17025|laboratorij|lab/i, sector: "Laboratorijska ispitivanja" },
  { pattern: /17024|certifikacij|person/i, sector: "Certifikacija osoba" },
  { pattern: /audit/i, sector: "Interni auditi" },
  { pattern: /rizik|risk/i, sector: "Upravljanje rizicima" },
];

/** Map scope/course metadata to a display sector (safe UI fallback). */
export function resolveCatalogSector(course: CatalogCourseRow): CatalogSectorLabel {
  const haystack = `${course.scope.name} ${course.title} ${course.targetAudience ?? ""}`.toLowerCase();
  for (const { pattern, sector } of SCOPE_TO_SECTOR) {
    if (pattern.test(haystack)) {
      return sector;
    }
  }
  return "Opšte edukacije";
}

export function groupCatalogCoursesBySector(
  courses: readonly CatalogCourseRow[],
): ReadonlyArray<{ sector: CatalogSectorLabel; courses: CatalogCourseRow[] }> {
  const map = new Map<CatalogSectorLabel, CatalogCourseRow[]>();
  for (const label of CATALOG_SECTOR_LABELS) {
    map.set(label, []);
  }
  for (const course of courses) {
    const sector = resolveCatalogSector(course);
    map.get(sector)?.push(course);
  }
  return CATALOG_SECTOR_LABELS.filter((s) => (map.get(s)?.length ?? 0) > 0).map((sector) => ({
    sector,
    courses: map.get(sector) ?? [],
  }));
}

export function isEducationEnrolmentCompleted(e: EducationEnrolment): boolean {
  const enrol = String(e.enrolmentStatus ?? "").trim().toUpperCase();
  const prog = String(e.progressStatus ?? "").trim().toUpperCase();
  return enrol === "COMPLETED" || prog === "COMPLETED" || Boolean(e.completedAt);
}

export function educationEnrolmentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ENROLLED: "Upisan",
    ACTIVE: "Aktivan program",
    IN_PROGRESS: "U tijeku",
    ASSIGNED: "Dodijeljen",
    AVAILABLE: "Dostupan",
    COMPLETED: "Završeno",
    NOT_STARTED: "Nije započeto",
  };
  const u = String(status ?? "").trim().toUpperCase();
  return map[u] ?? status;
}

export function educationProgressStatusLabel(status: string): string {
  const map: Record<string, string> = {
    NOT_STARTED: "Nije započeto",
    IN_PROGRESS: "U tijeku",
    COMPLETED: "Završeno",
  };
  const u = String(status ?? "").trim().toUpperCase();
  return map[u] ?? status;
}

/** Hide technical credential / certificate kind enums from learner UI. */
export function credentialKindLabel(kind: string | null | undefined): string {
  const u = String(kind ?? "").trim().toUpperCase();
  if (u === "EXAM_PASS_CERTIFICATE" || u === "EXAM_PASS" || u === "EXAM PASS") {
    return "Potvrda o položenom ispitu";
  }
  if (u === "PERSON_CERTIFICATION" || u === "PERSON CERTIFICATION") {
    return "Profesionalni certifikat osobe";
  }
  if (u === "EDUCATION_COMPLETION" || u === "COMPLETION") {
    return "Potvrda o završetku edukacije";
  }
  return kind?.trim() ? kind : "Dokument";
}

/** Learner-safe application workflow stage labels (no internal audit detail). */
export function learnerApplicationTimelineLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Nacrt",
    SUBMITTED: "Podneseno",
    SCREENING: "U pregledu",
    PENDING_REVIEW: "U pregledu",
    UNDER_REVIEW: "U pregledu",
    VERIFIERS_CONFIRMED: "U pregledu",
    SENT_TO_COMMITTEE: "Odluka u toku",
    AWAITING_MORE_INFO: "Vraćeno za dopunu",
    REQUEST_INFO: "Vraćeno za dopunu",
    RETURNED_FOR_MORE_INFO: "Vraćeno za dopunu",
    APPROVED_FOR_DECISION: "Odluka u toku",
    ELIGIBLE_FOR_DECISION: "Odluka u toku",
    APPROVED: "Odluka donesena",
    REJECTED: "Završeno",
    REJECTED_AFTER_DECISION: "Završeno",
    INELIGIBLE: "Završeno",
    WITHDRAWN: "Završeno",
    ARCHIVED: "Završeno",
    ISSUING: "Izdavanje u toku",
    ISSUED: "Završeno",
  };
  const u = String(status ?? "").trim().toUpperCase();
  return map[u] ?? status;
}

export function formatInternalIdSecondary(id: string): string {
  const t = id.trim();
  if (t.length <= 20) {
    return t;
  }
  return `${t.slice(0, 8)}…${t.slice(-4)}`;
}

export const LEARNER_CERT_APPLICATION_NOTICE =
  "Prijava za certifikaciju pokreće odvojeni postupak. Certifikacija zahtijeva pregled uslova, dokaza, odluku nadležnog komiteta i izdavanje certifikata.";

export const LEARNER_CERT_APPLICATION_EMPTY =
  "Trenutno nemate program koji ispunjava uslove za prijavu za certifikaciju.";

export const LEARNER_EDUCATION_COMPLETION_BOUNDARY =
  "Završetak edukacije ili potvrda o ispitu nije ISO/IEC 17024 certifikat osobe.";

export const LEARNER_CONFIRMATION_SECTION_NOTICE =
  "Ova potvrda nije ISO/IEC 17024 certifikat osobe.";

/** Learner-safe support request categories (maps to existing ticket types). */
export type LearnerSupportOption = {
  readonly id: string;
  readonly label: string;
  readonly ticketType: "TECHNICAL_SUPPORT" | "SUGGESTION" | "TRAINING_PROPOSAL" | "IMPROVEMENT_PROPOSAL";
};

export const LEARNER_SUPPORT_REQUEST_OPTIONS: readonly LearnerSupportOption[] = [
  { id: "tech", label: "Tehnički problem", ticketType: "TECHNICAL_SUPPORT" },
  { id: "education", label: "Pitanje o edukaciji", ticketType: "TRAINING_PROPOSAL" },
  { id: "exam-app", label: "Pitanje o prijavi za ispit", ticketType: "SUGGESTION" },
  { id: "cert-app", label: "Pitanje o prijavi za certifikaciju", ticketType: "IMPROVEMENT_PROPOSAL" },
  { id: "verify", label: "Pitanje o javnoj verifikaciji", ticketType: "TECHNICAL_SUPPORT" },
  { id: "training-proposal", label: "Prijedlog / inicijativa za novu obuku", ticketType: "TRAINING_PROPOSAL" },
  { id: "privacy", label: "Zahtjev u vezi sa zaštitom podataka", ticketType: "SUGGESTION" },
];

export function shouldShowPublicVerifyLink(lifecycleStatus: string): boolean {
  const s = lifecycleStatus.trim().toUpperCase();
  return s === "ACTIVE" || s === "VALID" || s === "VALIDAN" || s === "ISSUED";
}
