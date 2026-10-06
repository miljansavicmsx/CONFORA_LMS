/**
 * PKG-04 complaint-domain classification contracts.
 *
 * Selected options A1, B1, C1, G1, U1.
 * In-memory authorization classification only.
 * This module is not a complaint workflow, intake system, record store,
 * legally confirmed processing activity, appeal module, or ISO/IEC 17024
 * complaints procedure.
 */

export const TECHNICAL_PROCESSING_PURPOSE =
  'IN_MEMORY_AUTHORIZATION_CLASSIFICATION_FOR_A_CERTIFICATION_RELATED_COMPLAINT_CASE' as const;

export const PRIVACY_BASIS_STATUS = 'TECHNICAL_PURPOSE_RECORDED_LEGAL_BASIS_NOT_CONFIRMED' as const;

export const COMPLAINT_DOMAIN = 'COMPLAINT' as const;

export const COMPLAINT_OPERATIONS = [
  'ACKNOWLEDGE',
  'INVESTIGATE',
  'RECOMMEND',
  'FINAL_DECISION',
] as const;

export type ComplaintOperation = (typeof COMPLAINT_OPERATIONS)[number];

/** Complete PKG-04 data-class catalogue. Classification names only. */
export const COMPLAINT_DATA_CLASSES = Object.freeze([
  'AUTHENTICATED_USER_IDENTIFIER',
  'TENANT_IDENTIFIER',
  'COMPLAINT_CONTENT',
  'PUBLIC_REFERENCE',
  'INTERNAL_CASE_IDENTIFIER',
  'EVIDENCE_ATTACHMENT_METADATA',
] as const);

export type ComplaintDataClass = (typeof COMPLAINT_DATA_CLASSES)[number];

export const COMPLAINT_DATA_CLASS_COUNT = COMPLAINT_DATA_CLASSES.length;

/**
 * Future complaint-record retention adopted from the CONFORA baseline.
 * Complaint records only. No clock, deletion, archive, or appeal decision.
 */
export const COMPLAINT_RECORD_RETENTION_PERIOD = 'P10Y' as const;
export const COMPLAINT_RECORD_RETENTION_YEARS = 10 as const;
export const COMPLAINT_RECORD_RETENTION_ACTION = 'RETAIN' as const;

export const COMPLAINT_RECORD_RETENTION_POLICY = Object.freeze({
  period: COMPLAINT_RECORD_RETENTION_PERIOD,
  years: COMPLAINT_RECORD_RETENTION_YEARS,
  action: COMPLAINT_RECORD_RETENTION_ACTION,
  appliesTo: 'COMPLAINT_RECORDS' as const,
  appealRecordsIncluded: false as const,
  effect: 'FUTURE_POLICY_ONLY' as const,
});

export const AUTHENTICATED_INTAKE_ROLES = ['USR_CAND', 'USR_CERT'] as const;

export type AuthenticatedIntakeRole = (typeof AUTHENTICATED_INTAKE_ROLES)[number];

export const UNAUTHENTICATED_PUBLIC_INTAKE =
  'CLASSIFIED_BUT_NO_ROUTE_AND_NO_SUBMISSION_EFFECT' as const;

export const ACKNOWLEDGE_AUTHORITY = 'NONE' as const;
export const INVESTIGATE_AUTHORITY = 'NONE' as const;
export const RECOMMEND_AUTHORITY = 'NONE' as const;
export const FINAL_DECISION_AUTHORITY = 'NONE' as const;

export const COMPLAINT_MUTATION_FORBIDDEN_ROLES = [
  'STAFF_ROLEADM',
  'STAFF_AUD',
  'STAFF_DIR',
  'STAFF_SYSADM',
] as const;

export type ComplaintMutationForbiddenRole = (typeof COMPLAINT_MUTATION_FORBIDDEN_ROLES)[number];

export const COMPLAINT_POLICY_DENIAL_CODES = [
  'INVALID_COMPLAINT_POLICY_INPUT',
  'NON_COMPLAINT_DOMAIN_FORBIDDEN',
  'ACTOR_CONTEXT_REQUIRED',
  'ACTOR_TENANT_REQUIRED',
  'CROSS_TENANT_COMPLAINT_OPERATION_FORBIDDEN',
  'MFA_REQUIRED',
  'COMPLAINT_MUTATION_ROLE_FORBIDDEN',
  'INTAKE_INVESTIGATION_ACTOR_CONFLICT',
  'INTAKE_FINAL_DECISION_ACTOR_CONFLICT',
  'INVESTIGATION_FINAL_DECISION_ACTOR_CONFLICT',
  'COMPLAINT_SUBJECT_DECISION_ACTOR_CONFLICT',
  'COMPLAINT_OPERATION_AUTHORITY_NOT_ASSIGNED',
] as const;

export type ComplaintPolicyDenialCode = (typeof COMPLAINT_POLICY_DENIAL_CODES)[number];

export const COMPLAINT_POLICY_EFFECT = 'POLICY_DENY_ONLY' as const;

export type ComplaintPolicyResult = {
  readonly allowed: false;
  readonly effect: typeof COMPLAINT_POLICY_EFFECT;
  readonly code: ComplaintPolicyDenialCode;
};

export type AuthenticatedPartyReference = {
  readonly kind: 'AUTHENTICATED';
  readonly userId: string;
};

export type UnauthenticatedPublicIntakeReference = {
  readonly kind: 'UNAUTHENTICATED_PUBLIC_INTAKE';
  readonly classification: typeof UNAUTHENTICATED_PUBLIC_INTAKE;
  readonly authority: 'NONE';
};

export type ComplaintPartyReference =
  | AuthenticatedPartyReference
  | UnauthenticatedPublicIntakeReference;

export type AuthenticatedLearnerIntake = {
  readonly kind: 'AUTHENTICATED_LEARNER';
  readonly role: AuthenticatedIntakeRole;
  readonly userId: string;
  readonly authority: 'NONE';
};

export type ComplaintPolicyActor = {
  readonly userId: string;
  readonly tenantId: string;
  readonly roles: readonly string[];
  readonly mfaVerified: boolean;
};
