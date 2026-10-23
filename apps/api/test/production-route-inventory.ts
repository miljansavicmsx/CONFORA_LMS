/**
 * Exact production route inventory.
 * Equality is the check: a new route must be added here in Express registration order.
 * Browser routes and the public catalogue each name the job they do.
 * A further route still fails until it has its own entry.
 */
export const OIDC_BROWSER_ROUTES = [
  {
    route: 'GET /v1/auth/oidc/login',
    reason:
      'Starts Authorization Code + PKCE and keeps the verifier in the sealed transaction cookie.',
  },
  {
    route: 'GET /v1/auth/oidc/callback',
    reason:
      'Exchanges the code and checks state, nonce, organization, and membership before setting the session cookie.',
  },
  {
    route: 'POST /v1/auth/oidc/refresh',
    reason:
      'Rotates the server-held tokens for this cookie session and requires that session CSRF token.',
  },
  {
    route: 'POST /v1/auth/oidc/logout',
    reason:
      'Revokes the refresh token and returns the end-session URL. It requires that session CSRF token.',
  },
  {
    route: 'GET /v1/auth/session',
    reason:
      'Returns the signed-in person and the session CSRF token. It does not return access or refresh tokens.',
  },
] as const;

export const PUBLIC_CATALOG_ROUTES = [
  {
    route: 'GET /v1/public/catalog/courses',
    reason:
      'Lists published programmes only for PUBLIC_CATALOG_TENANT_IDS. An unset or empty allowlist returns an empty list. No people, enrolments, prices, or storage keys, and the caller cannot choose an organization.',
  },
  {
    route: 'GET /v1/public/catalog/courses/:courseId',
    reason:
      'Returns one published programme whose organization is on the server allowlist. A draft, an unknown id, or any other organization is not found.',
  },
] as const;

export const DIRECTORY_CONSENT_WITHDRAWAL_ROUTES = [
  {
    route: 'POST /v1/staff/certificates/:credentialId/directory-consent-withdrawal',
    reason:
      'Interim OD-DIR-33 directory-name withdrawal for one certificate in the caller organization. Existing STAFF_SYSADM only, cookie sessions require the CSRF token, the audit row is append-only, and the certificate status is not changed.',
  },
] as const;

export const PRIOR_PRODUCTION_ROUTE_COUNT = 92;

export const PRODUCTION_ROUTE_INVENTORY = [
  'GET /v1/health',
  ...OIDC_BROWSER_ROUTES.map((entry) => entry.route),
  'GET /v1/me/certification/applications',
  'GET /v1/me/certification/applications/:id',
  'GET /v1/me/learning/courses',
  'GET /v1/me/learning/courses/:courseId',
  'POST /v1/me/learning/enrolments',
  'GET /v1/me/learning/enrolments',
  'GET /v1/me/learning/enrolments/:enrolmentId/player',
  'POST /v1/me/learning/enrolments/:enrolmentId/lessons/:lessonId/progress',
  'POST /v1/me/learning/enrolments/:enrolmentId/quizzes/:quizId/attempts',
  'GET /v1/me/learning/statistics',
  'GET /v1/me/learning/analytics-consent',
  'PUT /v1/me/learning/analytics-consent',
  ...PUBLIC_CATALOG_ROUTES.map((entry) => entry.route),
  'POST /v1/staff/exams/items',
  'GET /v1/staff/exams/items',
  'POST /v1/staff/exams/items/:itemId/draft',
  'POST /v1/staff/exams/items/:itemId/versions',
  'POST /v1/staff/exams/items/:itemId/transitions',
  'GET /v1/staff/exams/blueprints',
  'POST /v1/staff/exams/blueprints',
  'POST /v1/staff/exams/blueprints/:blueprintId/domains',
  'POST /v1/staff/exams/blueprints/:blueprintId/standard-setting',
  'POST /v1/staff/exams/standard-settings/:recordId/ratings',
  'POST /v1/staff/exams/standard-settings/:recordId/approve',
  'POST /v1/staff/exams/blueprints/:blueprintId/approve',
  'POST /v1/staff/exams/blueprints/:blueprintId/assemble',
  'GET /v1/staff/exams/forms/:formId/psychometrics',
  'POST /v1/staff/exams/sessions',
  'POST /v1/staff/exams/sessions/:sessionId/identity-check',
  'POST /v1/staff/exams/sessions/:sessionId/proctor-flags',
  'POST /v1/staff/exams/proctor-flags/:flagId/reviews',
  'GET /v1/me/exams/sessions',
  'POST /v1/me/exams/sessions/:sessionId/start',
  'GET /v1/me/exams/sessions/:sessionId',
  'PUT /v1/me/exams/sessions/:sessionId/answers',
  'POST /v1/me/exams/sessions/:sessionId/submit',
  'GET /v1/me/exams/sessions/:sessionId/result',
  'GET /v1/committee/exams/queue',
  'POST /v1/committee/exams/decisions',
  'POST /v1/committee/certificates',
  'POST /v1/committee/certificates/:credentialId/status',
  'POST /v1/committee/certificates/:credentialId/amf-proposals',
  'GET /v1/me/certificates',
  'GET /v1/me/certificates/:credentialId/pdf-url',
  'GET /v1/me/certificates/:credentialId/pdf',
  'GET /v1/me/certificates/:credentialId/credential',
  'POST /v1/me/certificates/:credentialId/cpd',
  'GET /v1/me/certificates/:credentialId/reminders',
  'GET /v1/public/certificates/status-list',
  'GET /v1/public/certificates/jwks',
  'GET /v1/public/certificates',
  'GET /v1/public/certificates/:publicUid/pdf',
  'GET /v1/public/certificates/:publicUid',
  ...DIRECTORY_CONSENT_WITHDRAWAL_ROUTES.map((entry) => entry.route),
  'POST /v1/staff/schemes/:schemeVersionId/levels',
  'POST /v1/staff/schemes/:schemeVersionId/decision-makers',
  'POST /v1/staff/schemes/:schemeVersionId/case-rules',
  'POST /v1/me/certification-cases',
  'GET /v1/me/certification-cases',
  'GET /v1/me/certification-cases/:caseId',
  'POST /v1/me/certification-cases/:caseId/dossier',
  'POST /v1/me/certification-cases/:caseId/evidence',
  'POST /v1/me/certification-cases/:caseId/referees',
  'POST /v1/me/certification-cases/:caseId/link-exam',
  'GET /v1/me/documents/education',
  'GET /v1/me/documents/exam-passes',
  'PUT /v1/me/documents/:verificationId/name-consent',
  'GET /v1/committee/cases',
  'GET /v1/committee/cases/:caseId',
  'POST /v1/committee/cases/:caseId/propose',
  'POST /v1/committee/cases/:caseId/confirm',
  'POST /v1/committee/cases/:caseId/votes',
  'POST /v1/committee/cases/:caseId/evidence-assessment',
  'POST /v1/committee/cases/:caseId/assist',
  'POST /v1/committee/cases/:caseId/issue-authorization',
  'POST /v1/committee/cases/:caseId/conflict-declaration',
  'POST /v1/committee/exam-passes/:attestationId/release',
  'GET /v1/public/documents/:verificationId/pdf',
  'GET /v1/public/documents/:verificationId',
  'POST /v1/public/referees/:token',
  'POST /v1/staff/schemes/:schemeVersionId/annual-fee',
  'GET /v1/staff/schemes/:schemeVersionId/annual-fee',
  'GET /v1/me/notices',
  'POST /v1/me/notices/:noticeId/read',
  'POST /v1/staff/notices/reminders',
  'POST /v1/staff/notices/:jobId/bounce',
  'POST /v1/staff/notices/:jobId/complaint',
  'GET /v1/me/annual-fees',
  'POST /v1/committee/annual-fees/non-payment',
  'POST /v1/committee/annual-fees/recertification',
  'GET /v1/staff/reports/certification-applications/by-status',
  'GET /v1/staff/reports/certification-applications/by-scheme-ref',
  'POST /v1/role-administration/commands',
] as const;

export const PRODUCTION_ROUTE_COUNT = PRODUCTION_ROUTE_INVENTORY.length;

export function justifiedProductionRouteCount(): number {
  const reasons = new Set<string>();
  const inventory = new Set<string>(PRODUCTION_ROUTE_INVENTORY);
  for (const entry of [
    ...OIDC_BROWSER_ROUTES,
    ...PUBLIC_CATALOG_ROUTES,
    ...DIRECTORY_CONSENT_WITHDRAWAL_ROUTES,
  ]) {
    if (
      entry.reason.trim().length < 40 ||
      reasons.has(entry.reason) ||
      !inventory.has(entry.route)
    ) {
      throw new Error(`route ${entry.route} needs its own reason in the inventory`);
    }
    reasons.add(entry.reason);
  }
  const justified =
    OIDC_BROWSER_ROUTES.length +
    PUBLIC_CATALOG_ROUTES.length +
    DIRECTORY_CONSENT_WITHDRAWAL_ROUTES.length;
  const expected = PRIOR_PRODUCTION_ROUTE_COUNT + justified;
  if (PRODUCTION_ROUTE_INVENTORY.length !== expected) {
    throw new Error(
      `inventory length ${String(PRODUCTION_ROUTE_INVENTORY.length)} is not ${String(PRIOR_PRODUCTION_ROUTE_COUNT)} plus ${String(justified)} justified routes`,
    );
  }
  return expected;
}
