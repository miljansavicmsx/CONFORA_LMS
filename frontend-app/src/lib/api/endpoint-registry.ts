import type { ApiProviderMode } from "./api-config";

/** Endpoint ownership for hybrid routing. */
export type EndpointOwner = "legacy" | "nest";

export type EndpointRisk = "low" | "medium" | "high" | "critical";

export type EndpointGroup =
  | "auth"
  | "dashboard"
  | "learning"
  | "catalog"
  | "exam"
  | "certification"
  | "verification"
  | "sysadmin"
  | "ai"
  | "reports"
  | "payments"
  | "notifications"
  | "accommodations"
  | "contact"
  | "governance";

export type EndpointDefinition = {
  readonly id: string;
  readonly group: EndpointGroup;
  readonly legacyPath?: string;
  readonly nestPath?: string;
  /** Provider used when `VITE_API_PROVIDER=hybrid`. */
  readonly hybridOwner: EndpointOwner;
  readonly risk: EndpointRisk;
  readonly todo?: string;
};

/**
 * Registry of known routes — classification only; domain modules migrate incrementally.
 * @see docs/implementation/P0_CANONICAL_API_CUTOVER_PLAN.md
 */
export const ENDPOINT_DEFINITIONS: readonly EndpointDefinition[] = [
  {
    id: "auth.login",
    group: "auth",
    legacyPath: "/auth/login",
    nestPath: "/auth/login",
    hybridOwner: "legacy",
    risk: "critical",
    todo: "P0-B Keycloak cutover before switching hybridOwner to nest",
  },
  {
    id: "auth.refresh",
    group: "auth",
    legacyPath: "/auth/refresh",
    nestPath: "/auth/refresh",
    hybridOwner: "legacy",
    risk: "critical",
  },
  {
    id: "auth.me",
    group: "auth",
    legacyPath: "/auth/me",
    nestPath: "/auth/me",
    hybridOwner: "legacy",
    risk: "high",
    todo: "Set hybridOwner nest when VITE_AUTH_PROVIDER=nest (P0-E)",
  },
  {
    id: "auth.permissions",
    group: "auth",
    legacyPath: "/api/auth/me/permissions",
    nestPath: "/api/auth/me/permissions",
    hybridOwner: "legacy",
    risk: "high",
    todo: "Follow VITE_AUTH_PROVIDER for Nest permissions snapshot",
  },
  {
    id: "dashboard.context",
    group: "dashboard",
    legacyPath: "/api/dashboard/context",
    nestPath: "/v1/me/dashboard",
    hybridOwner: "legacy",
    risk: "high",
    todo: "Persona dashboard BFF not yet on Nest",
  },
  {
    id: "dashboard.learnerStats",
    group: "dashboard",
    legacyPath: "/api/dashboard/learner/stats",
    nestPath: "/v1/me/dashboard",
    hybridOwner: "legacy",
    risk: "medium",
  },
  {
    id: "dashboard.module1",
    group: "dashboard",
    nestPath: "/v1/me/dashboard",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "learning.progress",
    group: "learning",
    legacyPath: "/api/learning/progress",
    nestPath: "/v1/me/player",
    hybridOwner: "legacy",
    risk: "high",
  },
  {
    id: "learning.player",
    group: "learning",
    nestPath: "/v1/me/player",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "learning.enrollments",
    group: "learning",
    legacyPath: "/api/me/enrollments",
    nestPath: "/v1/me/enrollments",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "catalog.list",
    group: "catalog",
    legacyPath: "/api/courses",
    nestPath: "/v1/catalog/courses",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "catalog.lookup",
    group: "catalog",
    legacyPath: "/api/courses/lookup",
    nestPath: "/api/courses/lookup",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "catalog.detail",
    group: "catalog",
    nestPath: "/v1/catalog/courses",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "exam.engine",
    group: "exam",
    legacyPath: "/api/exams",
    nestPath: "/api/exams",
    hybridOwner: "legacy",
    risk: "critical",
    todo: "P0-E parity tests before hybridOwner nest",
  },
  {
    id: "exam.itemBank",
    group: "exam",
    legacyPath: "/api/exams/item-bank",
    nestPath: "/v1/admin/item-bank",
    hybridOwner: "legacy",
    risk: "high",
  },
  {
    id: "certification.applications",
    group: "certification",
    legacyPath: "/api/certification",
    nestPath: "/api/certification",
    hybridOwner: "legacy",
    risk: "critical",
    todo: "P0-F certification staff queue on Nest (B5-1b); learner reads/writes/submit on Nest (B3-2/B3-3c/B4-b)",
  },
  {
    id: "certification.applications.staff.read.list",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/staff/certification/applications",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B5-1b staff certification application queue on Nest",
  },
  {
    id: "certification.applications.staff.read.detail",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/staff/certification/applications",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B5-1b staff certification application detail on Nest",
  },
  {
    id: "certification.applications.staff.assignment.read",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/staff/certification/applications",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B5-2b staff assignment read (Nest-only)",
  },
  {
    id: "certification.applications.staff.assignment.assign",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/staff/certification/applications",
    hybridOwner: "nest",
    risk: "medium",
    todo: "P1-B5-2b staff assignment create/reassign (Nest-only)",
  },
  {
    id: "certification.applications.staff.assignment.accept",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/staff/certification/applications",
    hybridOwner: "nest",
    risk: "medium",
    todo: "P1-B5-2b staff assignment accept (Nest-only)",
  },
  {
    id: "certification.applications.staff.assignment.decline",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/staff/certification/applications",
    hybridOwner: "nest",
    risk: "medium",
    todo: "P1-B5-2b staff assignment decline (Nest-only)",
  },
  {
    id: "certification.applications.staff.review.status",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/staff/certification/applications",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B5-3b staff begin-review status read (Nest-only)",
  },
  {
    id: "certification.applications.staff.review.start",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/staff/certification/applications",
    hybridOwner: "nest",
    risk: "medium",
    todo: "P1-B5-3b staff begin-review start (Nest-only, no legacy fallback)",
  },
  {
    id: "certification.applications.read.list",
    group: "certification",
    legacyPath: "/api/certification/my-applications",
    nestPath: "/v1/me/certification/applications",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B3-2 read-only learner application list on Nest",
  },
  {
    id: "certification.applications.read.detail",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/me/certification/applications",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B3-2 read-only learner application detail on Nest",
  },
  {
    id: "certification.applications.write.createDraft",
    group: "certification",
    legacyPath: "/api/certification/draft",
    nestPath: "/v1/me/certification/applications",
    hybridOwner: "nest",
    risk: "medium",
    todo: "P1-B3-3c hybrid draft create on Nest",
  },
  {
    id: "certification.applications.write.patchDraft",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/me/certification/applications",
    hybridOwner: "nest",
    risk: "medium",
    todo: "P1-B3-3c hybrid draft patch on Nest",
  },
  {
    id: "certification.applications.write.submit",
    group: "certification",
    legacyPath: "/api/certification/applications",
    nestPath: "/v1/me/certification/applications",
    hybridOwner: "nest",
    risk: "critical",
    todo: "P1-B4-b hybrid submit on Nest; rollback via VITE_API_PROVIDER=legacy",
  },
  {
    id: "verification.publicHash",
    group: "verification",
    legacyPath: "/api/public/verify",
    nestPath: "/api/public/verify",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B1-5 legacy FastAPI read-only fallback; decommission when monitoring shows zero legacy traffic",
  },
  {
    id: "verification.publicHashCertificatesPath",
    group: "verification",
    legacyPath: "/api/public/certificates/verify",
    nestPath: "/api/public/certificates/verify",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B1-5 legacy FastAPI read-only fallback; decommission when monitoring shows zero legacy traffic",
  },
  {
    id: "verification.canonicalUid",
    group: "verification",
    nestPath: "/verify",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B1 canonical owner; legacy GET /verify/{hash} remains read-only fallback only",
  },
  {
    id: "certification.learnerWallet",
    group: "certification",
    legacyPath: "/api/certificates/my",
    nestPath: "/v1/me/certificates",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B2 read-only wallet on Nest; legacy rollback via VITE_API_PROVIDER=legacy",
  },
  {
    id: "certification.learnerWalletPdf",
    group: "certification",
    legacyPath: "/api/certificates/my",
    nestPath: "/v1/me/certificates",
    hybridOwner: "nest",
    risk: "low",
    todo: "P1-B2-6 presigned PDF URL on Nest; legacy pdf-url rollback in legacy mode only",
  },
  {
    id: "verification.applicant",
    group: "verification",
    nestPath: "/v1/public/verify-applicant",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "sysadmin.platform",
    group: "sysadmin",
    legacyPath: "/api/admin/sys",
    nestPath: "/v1/sysadmin",
    hybridOwner: "legacy",
    risk: "high",
  },
  {
    id: "ai.tutorSse",
    group: "ai",
    legacyPath: "/ai-tutor/chat",
    nestPath: "/v1/ai/invoke",
    hybridOwner: "legacy",
    risk: "medium",
    todo: "FastAPI SSE until ai-service; invoke already nest",
  },
  {
    id: "ai.invoke",
    group: "ai",
    nestPath: "/v1/ai/invoke",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "reports.overview",
    group: "reports",
    nestPath: "/v1/staff/reports/overview",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "reports.catalog",
    group: "reports",
    legacyPath: "/v1/admin/reports/catalog",
    nestPath: "/v1/staff/reports/catalog",
    hybridOwner: "nest",
    risk: "low",
    todo: "Legacy catalog alias fallback only when VITE_REPORTS_CANONICAL_ENABLED=false (F4-8e)",
  },
  {
    id: "reports.export",
    group: "reports",
    nestPath: "/v1/staff/reports/export",
    hybridOwner: "nest",
    risk: "low",
    todo: "POST export only — GET /api/reports/export removed in F4-8e",
  },
  {
    id: "payments.checkout",
    group: "payments",
    legacyPath: "/payments/create-session",
    nestPath: "/v1/me/checkout/stripe",
    hybridOwner: "legacy",
    risk: "high",
  },
  {
    id: "payments.billing",
    group: "payments",
    legacyPath: "/api/billing",
    nestPath: "/v1/me/finance",
    hybridOwner: "legacy",
    risk: "high",
  },
  {
    id: "notifications.me",
    group: "notifications",
    nestPath: "/v1/notifications/me",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "accommodations.public",
    group: "accommodations",
    nestPath: "/v1/public/equitable-access",
    hybridOwner: "nest",
    risk: "low",
  },
  {
    id: "contact.publicSubmit",
    group: "contact",
    legacyPath: "/v1/public/contact",
    nestPath: "/v1/public/contact-requests",
    hybridOwner: "nest",
    risk: "low",
    todo: "F4-8b canonical default; legacy alias fallback via VITE_CONTACT_CANONICAL_ENABLED=false",
  },
  {
    id: "complaints.publicSubmit",
    group: "contact",
    nestPath: "/v1/public/complaints",
    hybridOwner: "nest",
    risk: "low",
    todo: "F4-8c canonical default; legacy alias fallback via VITE_COMPLAINTS_CANONICAL_ENABLED=false",
  },
  {
    id: "complaints.learner",
    group: "contact",
    legacyPath: "/v1/me/complaints",
    nestPath: "/v1/learner/complaints",
    hybridOwner: "nest",
    risk: "low",
    todo: "F4-8c canonical default; legacy alias fallback via VITE_COMPLAINTS_CANONICAL_ENABLED=false",
  },
  {
    id: "complaints.staff",
    group: "contact",
    legacyPath: "/v1/admin/complaints",
    nestPath: "/v1/staff/complaints",
    hybridOwner: "nest",
    risk: "low",
    todo: "F4-8c canonical default; legacy alias fallback via VITE_COMPLAINTS_CANONICAL_ENABLED=false",
  },
  {
    id: "appeals.learner",
    group: "contact",
    legacyPath: "/v1/me/appeals",
    nestPath: "/v1/learner/appeals",
    hybridOwner: "nest",
    risk: "low",
    todo: "F4-8d canonical default; legacy alias fallback via VITE_APPEALS_CANONICAL_ENABLED=false",
  },
  {
    id: "appeals.staff",
    group: "contact",
    legacyPath: "/v1/admin/appeals",
    nestPath: "/v1/staff/appeals",
    hybridOwner: "nest",
    risk: "low",
    todo: "F4-8d canonical default; legacy alias fallback via VITE_APPEALS_CANONICAL_ENABLED=false",
  },
  {
    id: "governance.schemesPublic",
    group: "governance",
    legacyPath: "/api/certification-schemes/catalog",
    nestPath: "/public/api/schemes",
    hybridOwner: "legacy",
    risk: "medium",
  },
  {
    id: "public.launchMode",
    group: "catalog",
    legacyPath: "/api/public/launch-mode",
    hybridOwner: "legacy",
    risk: "medium",
    todo: "No Nest equivalent yet",
  },
  {
    id: "public.certificationBodyInfo",
    group: "governance",
    nestPath: "/v1/public/certification-body-info",
    hybridOwner: "nest",
    risk: "low",
  },
] as const;

/** Exact paths routed to Nest in hybrid mode (avoid catching learning subpaths). */
const HYBRID_NEST_EXACT_PATHS: readonly string[] = ["/api/courses"];

/** Path prefixes routed to Nest in hybrid mode (longest-prefix wins via ordered list). */
const HYBRID_NEST_PREFIXES: readonly string[] = [
  "/v1/",
  "/public/api/schemes",
  "/api/public/verify",
  "/api/public/certificates/verify",
  "/api/courses/lookup/",
  "/verify/",
];

/** Auth remains on legacy in hybrid until P0-B completes. */
const HYBRID_LEGACY_PREFIXES: readonly string[] = ["/auth/"];

function matchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(prefix);
}

/**
 * Resolve which backend serves a request path in hybrid mode.
 * Exported for tests and `resolveApiBaseUrl`.
 */
export function resolveHybridOwnerForPath(path: string): EndpointOwner {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  for (const prefix of HYBRID_LEGACY_PREFIXES) {
    if (matchesPrefix(normalized, prefix)) {
      return "legacy";
    }
  }

  for (const exact of HYBRID_NEST_EXACT_PATHS) {
    if (normalized === exact) {
      return "nest";
    }
  }

  for (const prefix of HYBRID_NEST_PREFIXES) {
    if (matchesPrefix(normalized, prefix)) {
      return "nest";
    }
  }

  return "legacy";
}

export function resolveOwnerForPath(path: string, provider: ApiProviderMode): EndpointOwner {
  if (provider === "legacy") return "legacy";
  if (provider === "nest") return "nest";
  return resolveHybridOwnerForPath(path);
}

export function getEndpointsByGroup(group: EndpointGroup): readonly EndpointDefinition[] {
  return ENDPOINT_DEFINITIONS.filter((e) => e.group === group);
}
