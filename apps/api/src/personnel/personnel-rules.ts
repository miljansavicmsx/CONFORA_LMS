/** Personnel certificate rules. Issuance is a human act after GRANT, not a consequence of scoring. */

export const PERSONNEL_VALIDITY_YEARS = 3;

export class PersonnelRuleError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'PersonnelRuleError';
  }
}

export type StoredLifecycle = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'WITHDRAWN' | 'SCOPE_REDUCED';
export type PublicCertificateStatus =
  | 'VALID'
  | 'SUSPENDED'
  | 'WITHDRAWN'
  | 'EXPIRED'
  | 'SCOPE_REDUCED';

const TRANSITIONS: Record<StoredLifecycle, readonly StoredLifecycle[]> = {
  ACTIVE: ['SUSPENDED', 'WITHDRAWN'],
  SUSPENDED: ['ACTIVE', 'WITHDRAWN'],
  EXPIRED: ['WITHDRAWN'],
  SCOPE_REDUCED: ['SUSPENDED', 'WITHDRAWN'],
  WITHDRAWN: [],
};

export function addYears(from: Date, years: number): Date {
  const next = new Date(from.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + years);
  return next;
}

export function publicCertificateStatus(
  lifecycle: StoredLifecycle,
  expiresAt: Date | null,
  now: Date,
): PublicCertificateStatus {
  if (lifecycle === 'WITHDRAWN') {
    return 'WITHDRAWN';
  }
  if (lifecycle === 'SUSPENDED') {
    return 'SUSPENDED';
  }
  if (lifecycle === 'SCOPE_REDUCED') {
    return 'SCOPE_REDUCED';
  }
  if (lifecycle === 'EXPIRED' || (expiresAt !== null && expiresAt.getTime() <= now.getTime())) {
    return 'EXPIRED';
  }
  return 'VALID';
}

export function assertStatusTransition(from: StoredLifecycle, to: StoredLifecycle): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw new PersonnelRuleError('STATUS_TRANSITION');
  }
}

export function assertIssuer(input: {
  roles: readonly string[];
  issuerUserId: string;
  holderUserId: string;
  trainerOfCandidate: boolean;
  decisionParticipantIds?: readonly string[];
}): void {
  if (!input.roles.includes('COM_CERT')) {
    throw new PersonnelRuleError('ROLE_SEPARATION');
  }
  if (input.issuerUserId === input.holderUserId) {
    throw new PersonnelRuleError('CANDIDATE_CANNOT_ISSUE');
  }
  if (input.trainerOfCandidate) {
    throw new PersonnelRuleError('TRAINER_CANNOT_ISSUE');
  }
  if ((input.decisionParticipantIds ?? []).includes(input.issuerUserId)) {
    throw new PersonnelRuleError('FOUR_EYES');
  }
}

/**
 * Process-local window only. Another instance does not see these hits.
 * Distributed rate limiting is still a production gap for public lookup.
 */
const hits = new Map<string, number[]>();

export function resetPublicRateLimit(): void {
  hits.clear();
}

/**
 * Process-local deduplication of identical directory-consent refusal writes.
 * Another instance does not see these keys. A failed write releases its key.
 */
const refusalWrites = new Map<string, number>();
const REFUSAL_DEDUP_WINDOW_MS = 60 * 60 * 1000;

export function resetDirectoryConsentRefusalDedup(): void {
  refusalWrites.clear();
}

export function claimDirectoryConsentRefusalWrite(key: string, nowMs: number): boolean {
  const previous = refusalWrites.get(key);
  if (previous !== undefined && nowMs - previous < REFUSAL_DEDUP_WINDOW_MS) {
    return false;
  }
  if (refusalWrites.size > 1024) {
    for (const [stored, stamp] of refusalWrites) {
      if (nowMs - stamp >= REFUSAL_DEDUP_WINDOW_MS) {
        refusalWrites.delete(stored);
      }
    }
  }
  refusalWrites.set(key, nowMs);
  return true;
}

export function releaseDirectoryConsentRefusalWrite(key: string): void {
  refusalWrites.delete(key);
}

export function assertPublicRateLimit(
  key: string,
  nowMs: number,
  limit = 30,
  windowMs = 60_000,
): void {
  const recent = (hits.get(key) ?? []).filter((stamp) => nowMs - stamp < windowMs);
  if (recent.length >= limit) {
    throw new PersonnelRuleError('RATE_LIMIT');
  }
  recent.push(nowMs);
  hits.set(key, recent);
}

export type PersonnelPublicVerification = {
  status: PublicCertificateStatus | 'INVALID';
  documentType: 'PERSONNEL_CERTIFICATE' | null;
  issuedAt: string | null;
  holderName: string | null;
};

/** Same body for an unknown token and for a sequential record number. */
export const HIDDEN_PERSONNEL_VERIFICATION: PersonnelPublicVerification = {
  status: 'INVALID',
  documentType: null,
  issuedAt: null,
  holderName: null,
};

/**
 * OD-DIR-33. A public-directory consent record is active only when the entry is
 * listed, the consent timestamp is present, and that consent has not been withdrawn.
 * A missing timestamp or a revocation fails closed.
 */
export function directoryConsentActive(input: {
  registryListed: boolean;
  registryConsentAt: Date | null;
  registryConsentRevokedAt: Date | null;
}): boolean {
  return (
    input.registryListed &&
    input.registryConsentAt instanceof Date &&
    !Number.isNaN(input.registryConsentAt.getTime()) &&
    input.registryConsentRevokedAt === null
  );
}

/** OD-PP-30: status, type, and issue date. The name is present only while registry consent lasts. */
export function presentPersonnelPublicVerification(input: {
  status: PublicCertificateStatus;
  issuedAt: Date;
  registryListed: boolean;
  registryConsentAt: Date | null;
  registryConsentRevokedAt: Date | null;
  holderName: string;
}): PersonnelPublicVerification {
  return {
    status: input.status,
    documentType: 'PERSONNEL_CERTIFICATE',
    issuedAt: input.issuedAt.toISOString().slice(0, 10),
    holderName: directoryConsentActive(input) ? input.holderName : null,
  };
}

/**
 * Existing system-administrator role (Baseline §6, OD-PP-06).
 * This is not a new role and it is not a certification decision.
 * Baseline §7.5 and OD-PP-18 still keep STAFF_SYSADM out of certification
 * outcomes and the item bank. STAFF_DIR monitors (Baseline §7.4) and does
 * not execute this operational step. STAFF_ROLEADM remains role administration.
 */
export const DIRECTORY_CONSENT_EXECUTOR_ROLE = 'STAFF_SYSADM' as const;

export const DIRECTORY_CONSENT_CHANNELS = ['EMAIL', 'POST', 'IN_PERSON', 'TELEPHONE'] as const;
export type DirectoryConsentChannel = (typeof DIRECTORY_CONSENT_CHANNELS)[number];

/** How identity was checked. The value is the method only: no document copy, number, or secret. */
export const DIRECTORY_CONSENT_VERIFICATION_METHODS = [
  'IN_PERSON_DOCUMENT_SIGHT',
  'VIDEO_DOCUMENT_SIGHT',
  'KNOWN_ACCOUNT_CONFIRMATION',
] as const;
export type DirectoryConsentVerificationMethod =
  (typeof DIRECTORY_CONSENT_VERIFICATION_METHODS)[number];

export function assertDirectoryConsentAdministrator(roles: readonly string[]): void {
  if (!roles.includes(DIRECTORY_CONSENT_EXECUTOR_ROLE)) {
    throw new PersonnelRuleError('ROLE_SEPARATION');
  }
}

/**
 * Existing staff roles (Baseline §6). Not a new role.
 * STAFF_DIR may verify and still must not execute. STAFF_SYSADM may verify
 * a request that a different system administrator executes.
 */
export const DIRECTORY_CONSENT_VERIFIER_ROLES = [
  'STAFF_DIR',
  'STAFF_SYSADM',
  'STAFF_TRAINADM',
  'STAFF_AUD',
  'STAFF_ROLEADM',
] as const;

/** Action recorded on a non-staff verification refusal. Not an evidence reference. */
export const DIRECTORY_CONSENT_VERIFY_ACTION = 'DIRECTORY_CONSENT_VERIFY' as const;

/** Documented procedure. Audit rows cite this runbook and one of its sections. */
export const DIRECTORY_CONSENT_PROCEDURE = 'RB-02' as const;
export const DIRECTORY_CONSENT_PROCEDURE_REF =
  'docs/operations/RB-02-consent-withdrawal.md' as const;
export const DIRECTORY_CONSENT_SECTIONS = {
  request: 'Request',
  identity: 'Identity check',
  execution: 'Execution',
} as const;

/** Internal evidence reference. Not a document number, name, or image. */
export const DIRECTORY_CONSENT_EVIDENCE_REF = /^[A-Za-z0-9][A-Za-z0-9._:-]{2,63}$/;

export function directoryConsentVerifierRole(roles: readonly string[]): string | null {
  for (const role of DIRECTORY_CONSENT_VERIFIER_ROLES) {
    if (roles.includes(role)) {
      return role;
    }
  }
  return null;
}

/**
 * The verifier is the authenticated user. The role is the one they hold now.
 * Issuance already rejects a person acting on their own prior act (FOUR_EYES).
 * Execution applies that same rule: the executor cannot be this verifier.
 */
export function assertDirectoryConsentVerifier(input: {
  verifierUserId: string;
  holderUserId: string;
  roles: readonly string[];
}): string {
  if (input.verifierUserId === input.holderUserId) {
    throw new PersonnelRuleError('VERIFIER_IS_HOLDER');
  }
  const role = directoryConsentVerifierRole(input.roles);
  if (!role) {
    throw new PersonnelRuleError('VERIFIER_NOT_STAFF');
  }
  return role;
}

export function assertDirectoryConsentFourEyes(
  executorUserId: string,
  verifierUserId: string,
): void {
  if (executorUserId === verifierUserId) {
    throw new PersonnelRuleError('FOUR_EYES');
  }
}

export function assertDirectoryConsentEvidenceRef(value: string): void {
  if (!DIRECTORY_CONSENT_EVIDENCE_REF.test(value)) {
    throw new PersonnelRuleError('EVIDENCE_REF');
  }
}

/** Received time is the time the organization got the request, not a future stamp. */
export function assertConsentRequestReceivedAt(receivedAt: Date, now: Date): void {
  if (!(receivedAt instanceof Date) || Number.isNaN(receivedAt.getTime())) {
    throw new PersonnelRuleError('RECEIVED_AT');
  }
  if (receivedAt.getTime() > now.getTime() + 120_000) {
    throw new PersonnelRuleError('RECEIVED_AT');
  }
}
