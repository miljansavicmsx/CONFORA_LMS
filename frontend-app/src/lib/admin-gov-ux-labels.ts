/**
 * ADMIN-GOV-UX-POLISH-1 — Serbian labels for governance/admin reports and education surfaces.
 * Maps backend enums to human-readable BHS text; never weakens RBAC or data boundaries.
 */
import { applicationStatusLabel, decisionOutcomeLabel, decisionReviewStatusLabel } from "@/lib/certification-ops-labels";
import type { AdminDashboardSummary } from "@/lib/admin-reports-api";
import { educationEnrolmentStatusLabel, educationProgressStatusLabel } from "@/lib/learner-polish-labels";

export const ADMIN_PILOT_SYNTHETIC_NOTICE =
  "Prikazani su lokalni pilot/sintetički podaci.";

export const ADMIN_REPORTS_READONLY_NOTICE =
  "Izvještaj samo za čitanje · završetak edukacije nije certifikacija osobe prema ISO/IEC 17024 · ručna provjera identiteta (bez biometrije).";

export const ADMIN_EDUCATION_READONLY_NOTICE =
  "Izvještaji edukacije su samo za čitanje. Potvrda o završetku edukacije nije certifikat osobe prema ISO/IEC 17024. Objavljivanje programa (PUBLIC) ne odobrava certifikacijsku shemu.";

export const ADMIN_LEGACY_REPORTS_NOTICE =
  "Zastarjeli alat za sastavljanje izvještaja više nije dostupan. Koristite pregledne izvještaje i kontrolirani izvoz u skladu s F4 politikom.";

export const ADMIN_PUBLIC_VERIFY_NOTICE =
  "Javna verifikacija je samo za čitanje i ne zahtijeva prijavu — bez pristupa privatnim dosjeima.";

export const ADMIN_CONTACT_NOT_APPEAL_NOTICE =
  "Kontakt zahtjev nije formalna žalba niti prigovor na odluku o certifikaciji.";

const ADMIN_STATUS_MAP: Record<string, string> = {
  ELIGIBILITY_REVIEW_COMPLETED: "Pregled podobnosti završen",
  WITHDRAWN: "Povučeno",
  DRAFT: "Nacrt",
  EXAM_AUTHORIZATION_COMPLETED: "Odobrenje za ispit završeno",
  SUBMITTED: "Podneseno",
  APPROVED: "Odobreno",
  CERTIFICATION_DECISION_RECORDED: "Odluka o certifikaciji evidentirana",
  UNDER_REVIEW: "U pregledu",
  NOT_STARTED: "Nije započeto",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završeno",
  PUBLIC: "Objavljeno",
  ARCHIVED: "Arhivirano",
  CONTACT: "Kontakt zahtevi",
  APPEALS: "Žalbe",
  COMPLAINTS: "Prigovori",
  PERSON_CERTIFICATION: "Profesionalni certifikat osobe",
  EXAM_PASS_CERTIFICATE: "Potvrda o položenom ispitu",
  PENDING: "Na čekanju",
  VERIFIED: "Verifikovano",
  REJECTED: "Odbijeno",
  ISSUED: "Izdano",
  ACTIVE: "Aktivan",
  SUSPENDED: "Suspendiran",
  REVOKED: "Opozvan",
  EXPIRED: "Istekao",
  ENROLLED: "Upisan",
  IN_REVIEW: "U pregledu",
  DECIDED: "Odluka donesena",
  CERTIFICATION_APPROVED: "Certifikacija odobrena",
  CERTIFICATION_DENIED: "Certifikacija odbijena",
  DENIED: "Odbijeno",
  SCREENING: "U pregledu",
  PENDING_REVIEW: "U pregledu",
  education: "Edukacija",
  certification: "Certifikacija",
  identity: "Identitet",
  governance: "Upravljanje",
};

/** Unified admin/governance status label — certification, education, identity, audit domains. */
export function adminReportStatusLabel(status: string | null | undefined): string {
  const raw = String(status ?? "").trim();
  if (!raw) return "—";
  const u = raw.toUpperCase();
  if (ADMIN_STATUS_MAP[u]) return ADMIN_STATUS_MAP[u];
  const cert = applicationStatusLabel(u);
  if (cert !== u) return cert;
  const decision = decisionReviewStatusLabel(u);
  if (decision !== u) return decision;
  const outcome = decisionOutcomeLabel(u);
  if (outcome !== u && outcome !== "—") return outcome;
  const eduEnrol = educationEnrolmentStatusLabel(u);
  if (eduEnrol !== u) return eduEnrol;
  const eduProg = educationProgressStatusLabel(u);
  if (eduProg !== u) return eduProg;
  const lower = raw.toLowerCase();
  if (ADMIN_STATUS_MAP[lower]) return ADMIN_STATUS_MAP[lower];
  return raw;
}

export function adminAuditDomainLabel(domain: string): string {
  return adminReportStatusLabel(domain);
}

export type ChartRow = { readonly label: string; readonly value: number };

export function mapAdminChartRows(rows: readonly ChartRow[]): ChartRow[] {
  return rows.map((row) => ({
    label: adminReportStatusLabel(row.label),
    value: row.value,
  }));
}

export const RAW_ADMIN_ENUM_DENY_LIST = [
  "ELIGIBILITY_REVIEW_COMPLETED",
  "EXAM_AUTHORIZATION_COMPLETED",
  "CERTIFICATION_DECISION_RECORDED",
  "UNDER_REVIEW",
  "NOT_STARTED",
  "IN_PROGRESS",
  "PERSON_CERTIFICATION",
  "EXAM_PASS_CERTIFICATE",
] as const;

export function adminBodyMustNotExposeRawEnums(bodyText: string): boolean {
  return RAW_ADMIN_ENUM_DENY_LIST.every((token) => !bodyText.includes(token));
}

/** Zeroed pilot summary when dashboard API is unavailable — keeps read-only cards visible. */
export function createAdminPilotEmptyDashboardSummary(): AdminDashboardSummary {
  return {
    generatedAt: new Date(0).toISOString(),
    readOnly: true,
    syntheticLocalPilot: true,
    education: {
      courseCount: 0,
      enrolmentCount: 0,
      completionCount: 0,
      publicCourseCount: 0,
      completionRate: 0,
      enrolmentByStatus: {},
    },
    certification: {
      applicationsByStatus: {},
      decisionsByOutcome: {},
      decisionsRecorded: 0,
      decisionsPending: 0,
      certificatesByStatus: {},
      issuedCount: 0,
      publicVerificationCount: 0,
      quorumEvidence: {
        decisionsWithQuorumConfirmed: 0,
        reviewsInProgress: 0,
        requiredQuorumDefault: 0,
      },
    },
    identity: {
      reviewQueueCount: 0,
      verifiedCount: 0,
      rejectedCount: 0,
      manualNonBiometric: true,
    },
    audit: {
      totalEventCount: 0,
      educationEventCount: 0,
      certificationEventCount: 0,
      identityEventCount: 0,
      governanceEventCount: 0,
      reportExportCount: 0,
    },
    evidence: {
      documentPreviewCount: 0,
      educationCompletionCertificateCount: 0,
    },
    system: {
      activeLocalDemoSurface: true,
      knownNonBlockingGaps: ["Sažetak nadzorne ploče nije učitan — prikazane su nulte pilot vrijednosti."],
    },
    chartData: {
      certificationApplicationsByStatus: [],
      certificationDecisionsByOutcome: [],
      certificateLifecycleByStatus: [],
      educationEnrolmentByStatus: [],
      learnerProgressDistribution: [],
      reportExportActivity: [],
      auditActivityByDomain: [],
    },
    boundaryNote: ADMIN_REPORTS_READONLY_NOTICE,
  };
}
