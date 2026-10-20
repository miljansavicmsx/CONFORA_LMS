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

const hits = new Map<string, number[]>();

export function resetPublicRateLimit(): void {
  hits.clear();
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
