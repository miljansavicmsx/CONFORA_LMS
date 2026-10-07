/**
 * PKG-05 appeal-domain classification contract.
 *
 * Selected options A1, B1, C1, D1, E1, F1, G1, H1, J1, K1, L1, M1, N1, O1, P1.
 * In-memory authorization classification for a certification-related appeal case.
 * Legal basis is not confirmed. DPO or controller validation is required before
 * any data-bearing use.
 *
 * This module is not an appeal workflow, submission system, record store,
 * committee constitution, complaint module, or ISO/IEC 17024 appeals procedure.
 */

export const TECHNICAL_PROCESSING_PURPOSE =
  'IN_MEMORY_AUTHORIZATION_CLASSIFICATION_FOR_A_CERTIFICATION_RELATED_APPEAL_CASE' as const;

export const PRIVACY_BASIS_STATUS = 'TECHNICAL_PURPOSE_RECORDED_LEGAL_BASIS_NOT_CONFIRMED' as const;

export const DPO_OR_CONTROLLER_VALIDATION_BEFORE_DATA_BEARING_USE = 'REQUIRED' as const;

/** Certification-appeal domain marker. Complaints are a separate module. */
export const CERTIFICATION_APPEAL_DOMAIN = 'APPEAL' as const;

/**
 * Live backlog prose is "acknowledge, void, start, or record the appeal outcome".
 * These four tokens are that prose, normalized to executable policy identifiers.
 */
export const APPEAL_OPERATIONS = ['ACKNOWLEDGE', 'VOID', 'START', 'RECORD_OUTCOME'] as const;

export type AppealOperation = (typeof APPEAL_OPERATIONS)[number];

/** Complete PKG-05 data-class catalogue. Classification names only. */
export const APPEAL_DATA_CLASSES = Object.freeze([
  'AUTHENTICATED_USER_IDENTIFIER',
  'TENANT_IDENTIFIER',
  'APPEAL_CONTENT',
  'CERTIFICATION_DECISION_REFERENCE',
  'COMMITTEE_IDENTIFIER',
  'INTERNAL_CASE_IDENTIFIER',
] as const);

export type AppealDataClass = (typeof APPEAL_DATA_CLASSES)[number];

export const APPEAL_DATA_CLASS_COUNT = APPEAL_DATA_CLASSES.length;

/**
 * Future appeal-record retention. Appeal records only.
 * No clock, deletion, archive, job, or complaint-record decision.
 */
export const APPEAL_RECORD_RETENTION_PERIOD = 'P10Y' as const;
export const APPEAL_RECORD_RETENTION_YEARS = 10 as const;
export const APPEAL_RECORD_RETENTION_ACTION = 'RETAIN' as const;
export const APPEAL_RETENTION_SCOPE = 'FUTURE_APPEAL_RECORDS_ONLY' as const;

export const APPEAL_RECORD_RETENTION_POLICY = Object.freeze({
  period: APPEAL_RECORD_RETENTION_PERIOD,
  years: APPEAL_RECORD_RETENTION_YEARS,
  action: APPEAL_RECORD_RETENTION_ACTION,
  scope: APPEAL_RETENTION_SCOPE,
  complaintRecordsIncluded: false as const,
  appealRecordsIncluded: true as const,
});

export const AUTHENTICATED_APPELLANT_ROLES = ['USR_CAND', 'USR_CERT'] as const;

export type AuthenticatedAppellantRole = (typeof AUTHENTICATED_APPELLANT_ROLES)[number];

export const APPELLANT_AUTHORITY = 'NONE' as const;
export const APPEAL_ADMISSIBILITY_AUTHORITY = 'NONE' as const;
export const APPEAL_INVESTIGATION_AUTHORITY = 'NONE' as const;
export const APPEAL_RECOMMENDATION_AUTHORITY = 'NONE' as const;
export const APPEAL_OUTCOME_AUTHORITY = 'NONE' as const;
export const APPEAL_COMMITTEE_AUTHORITY = 'NONE' as const;
export const COMMITTEE_CONSTITUTION_PROOF_STATUS = 'NOT_DEFINED' as const;
export const COMMITTEE_QUORUM_POLICY = 'NOT_DEFINED' as const;
export const CONFLICT_OF_INTEREST_DECLARATION_WORKFLOW = 'NOT_DEFINED' as const;
export const OUTCOME_RATIONALE_REQUIREMENT = 'NOT_DEFINED' as const;
export const APPEAL_NOTIFICATION_POLICY = 'NOT_DEFINED' as const;
export const APPEAL_FILING_DEADLINE = 'NOT_DEFINED' as const;
export const APPEAL_RESOLUTION_TARGET = 'NOT_DEFINED' as const;
export const UNAUTHENTICATED_PUBLIC_APPEAL_INTAKE = 'NOT_AVAILABLE' as const;

/** Rejection label only. Not a canonical RBAC role and not committee proof. */
export const LEGACY_APPEALS_COMMITTEE_LABEL = 'appeals_committee' as const;

export const APPEAL_MUTATION_FORBIDDEN_ROLES = [
  'STAFF_ROLEADM',
  'STAFF_AUD',
  'STAFF_DIR',
  'STAFF_SYSADM',
  'COMPLAINT_HANDLER',
] as const;

export type AppealMutationForbiddenRole = (typeof APPEAL_MUTATION_FORBIDDEN_ROLES)[number];

export const APPEAL_POLICY_DENIAL_CODES = [
  'INVALID_APPEAL_POLICY_INPUT',
  'CERTIFICATION_APPEAL_DOMAIN_REQUIRED',
  'APPEAL_OPERATION_UNSUPPORTED',
  'ACTOR_CONTEXT_REQUIRED',
  'ACTOR_USER_IDENTIFIER_REQUIRED',
  'ACTOR_TENANT_REQUIRED',
  'APPEAL_TENANT_REQUIRED',
  'CROSS_TENANT_APPEAL_FORBIDDEN',
  'AUTHENTICATED_APPELLANT_REQUIRED',
  'APPELLANT_ROLE_NOT_ELIGIBLE',
  'MFA_REQUIRED',
  'APPEAL_MUTATION_ROLE_FORBIDDEN',
  'ORIGINAL_CERTIFICATION_DECISION_MAKER_FORBIDDEN',
  'APPEAL_COMMITTEE_AUTHORITY_NOT_DEFINED',
  'APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED',
] as const;

export type AppealPolicyDenialCode = (typeof APPEAL_POLICY_DENIAL_CODES)[number];

export const APPEAL_POLICY_EFFECT = 'POLICY_DENY_ONLY' as const;

/** Deny-only. An allow or applied effect is not representable. */
export type AppealPolicyResult = {
  readonly allowed: false;
  readonly effect: typeof APPEAL_POLICY_EFFECT;
  readonly code: AppealPolicyDenialCode;
};

export type AuthenticatedAppellantClassification = {
  readonly kind: 'AUTHENTICATED_APPELLANT';
  readonly role: AuthenticatedAppellantRole;
  readonly userId: string;
  readonly authority: typeof APPELLANT_AUTHORITY;
};

/**
 * Server-derived actor context. Role labels and committee strings in this
 * object are not appeal authority.
 */
export type ServerDerivedAppealActor = {
  readonly userId: string;
  readonly tenantId: string;
  readonly roles: readonly string[];
  readonly mfaVerified: boolean;
};

export const APPEAL_IMPLEMENTATION_NONCLAIMS = Object.freeze({
  completeAppealsProcessImplemented: false as const,
  isoIec17024ConformityClaimed: false as const,
  iso21001ConformityClaimed: false as const,
  isoIec27001ConformityClaimed: false as const,
  appealSubmissionImplemented: false as const,
  appealInvestigationImplemented: false as const,
  appealDecisionImplemented: false as const,
  appealNotificationImplemented: false as const,
  appealPersistenceImplemented: false as const,
  appealAuditImplemented: false as const,
  committeeConstitutionImplemented: false as const,
  legalBasisConfirmed: false as const,
});
