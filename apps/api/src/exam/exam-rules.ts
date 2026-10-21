/**
 * Certification exam rules (ISO/IEC 17024).
 * Training enrolment and AMF membership are not inputs: neither is an eligibility gate.
 * Item stems and answer keys stay out of these pure projections for candidates.
 */

export class ExamRuleError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'ExamRuleError';
  }
}

export type SchemeItemStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'RETIRED';
export type SchemeItemType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';

export type StaffAction =
  | 'ITEM_WRITE'
  | 'ITEM_APPROVE'
  | 'BLUEPRINT_WRITE'
  | 'BLUEPRINT_APPROVE'
  | 'ASSEMBLE'
  | 'PSYCHOMETRICS_READ'
  | 'SESSION_SCHEDULE'
  | 'IDENTITY_CONFIRM'
  | 'PROCTOR_FLAG'
  | 'PROCTOR_REVIEW'
  | 'DECIDE';

const ACTION_ROLES: Record<StaffAction, readonly string[]> = {
  ITEM_WRITE: ['COM_TECH', 'SME'],
  ITEM_APPROVE: ['COM_TECH'],
  BLUEPRINT_WRITE: ['COM_TECH', 'EXAMINER'],
  BLUEPRINT_APPROVE: ['COM_TECH'],
  ASSEMBLE: ['COM_TECH', 'EXAMINER'],
  PSYCHOMETRICS_READ: ['COM_TECH', 'EXAMINER'],
  SESSION_SCHEDULE: ['COM_TECH', 'EXAMINER'],
  IDENTITY_CONFIRM: ['INVIGILATOR'],
  PROCTOR_FLAG: ['INVIGILATOR', 'EXAMINER', 'COM_TECH'],
  PROCTOR_REVIEW: ['INVIGILATOR', 'EXAMINER', 'COM_TECH'],
  DECIDE: ['COM_CERT'],
};

export const MIN_RETAKE_WINDOW_DAYS = 90;
export const IDENTITY_DOCUMENT_TYPES = [
  'PASSPORT',
  'ID_CARD',
  'DRIVING_LICENCE',
  'RESIDENCE_PERMIT',
] as const;
export type IdentityDocumentType = (typeof IDENTITY_DOCUMENT_TYPES)[number];
export const EXAM_MFA_REFERENCE = 'ASSURED';
export const P_VALUE_LOW = 0.2;
export const P_VALUE_HIGH = 0.95;
export const DISCRIMINATION_LOW = 0.15;
export const KR20_LOW = 0.7;

export function assertStaffAction(roles: readonly string[], action: StaffAction): void {
  const allowed = ACTION_ROLES[action];
  if (!roles.some((role) => allowed.includes(role))) {
    throw new ExamRuleError('ROLE_SEPARATION');
  }
}

export function assertItemTransition(input: {
  from: SchemeItemStatus;
  to: SchemeItemStatus;
  actorUserId: string;
  authorUserId: string;
  roles: readonly string[];
}): void {
  const { from, to, actorUserId, authorUserId, roles } = input;
  const allowed =
    (from === 'DRAFT' && to === 'REVIEW') ||
    (from === 'REVIEW' && (to === 'APPROVED' || to === 'DRAFT')) ||
    (from === 'APPROVED' && to === 'RETIRED');
  if (!allowed) {
    throw new ExamRuleError('ITEM_TRANSITION_FORBIDDEN');
  }
  if (to === 'APPROVED' || to === 'RETIRED' || (from === 'REVIEW' && to === 'DRAFT')) {
    assertStaffAction(roles, 'ITEM_APPROVE');
    if (actorUserId === authorUserId) {
      throw new ExamRuleError('AUTHOR_CANNOT_APPROVE');
    }
    return;
  }
  if (actorUserId !== authorUserId) {
    assertStaffAction(roles, 'ITEM_APPROVE');
    return;
  }
  assertStaffAction(roles, 'ITEM_WRITE');
}

export type ItemChoiceInput = {
  choiceKey: string;
  text: string;
  isCorrect: boolean;
};

export function assertChoiceSet(
  itemType: SchemeItemType,
  choices: readonly ItemChoiceInput[],
): void {
  if (choices.length < 2) {
    throw new ExamRuleError('CHOICES_REQUIRED');
  }
  const keys = new Set(choices.map((choice) => choice.choiceKey));
  if (keys.size !== choices.length) {
    throw new ExamRuleError('DUPLICATE_CHOICE_KEY');
  }
  const correct = choices.filter((choice) => choice.isCorrect).length;
  if (itemType === 'SINGLE_CHOICE' && correct !== 1) {
    throw new ExamRuleError('SINGLE_CORRECT_KEY');
  }
  if (itemType === 'MULTIPLE_CHOICE' && correct < 1) {
    throw new ExamRuleError('MULTIPLE_CORRECT_KEYS');
  }
}

export function itemIsCorrect(
  itemType: SchemeItemType,
  correctKeys: readonly string[],
  selected: readonly string[],
): boolean {
  const chosen = [...new Set(selected)].sort();
  const expected = [...new Set(correctKeys)].sort();
  if (itemType === 'SINGLE_CHOICE') {
    return chosen.length === 1 && chosen[0] === expected[0];
  }
  if (chosen.length !== expected.length) {
    return false;
  }
  return chosen.every((key, index) => key === expected[index]);
}

export type BlueprintDomainInput = {
  domainCode: string;
  title: string;
  weightBasisPoints: number;
  itemCount: number;
};

export function assertBlueprintDomains(domains: readonly BlueprintDomainInput[]): void {
  if (domains.length === 0) {
    throw new ExamRuleError('DOMAINS_REQUIRED');
  }
  const codes = new Set(domains.map((domain) => domain.domainCode));
  if (codes.size !== domains.length) {
    throw new ExamRuleError('DUPLICATE_DOMAIN');
  }
  const weight = domains.reduce((sum, domain) => sum + domain.weightBasisPoints, 0);
  if (weight !== 10_000) {
    throw new ExamRuleError('WEIGHTS_MUST_SUM_TO_10000');
  }
  for (const domain of domains) {
    if (!Number.isInteger(domain.weightBasisPoints) || domain.weightBasisPoints < 1) {
      throw new ExamRuleError('DOMAIN_WEIGHT');
    }
    if (!Number.isInteger(domain.itemCount) || domain.itemCount < 1) {
      throw new ExamRuleError('DOMAIN_ITEM_COUNT');
    }
  }
}

export function assertRetakeWindowDays(days: number): void {
  if (!Number.isInteger(days) || days < MIN_RETAKE_WINDOW_DAYS) {
    throw new ExamRuleError('RETAKE_WINDOW_TOO_SHORT');
  }
}

export type BankItemRef = {
  id: string;
  domainCode: string;
  exposureCount: number;
  status: SchemeItemStatus;
};

export function selectItemsForBlueprint(
  domains: readonly BlueprintDomainInput[],
  items: readonly BankItemRef[],
): { itemId: string; domainCode: string; sequence: number }[] {
  const selected: { itemId: string; domainCode: string; sequence: number }[] = [];
  let sequence = 1;
  const ordered = [...domains].sort((left, right) =>
    left.domainCode < right.domainCode ? -1 : left.domainCode > right.domainCode ? 1 : 0,
  );
  for (const domain of ordered) {
    const pool = items
      .filter((item) => item.domainCode === domain.domainCode && item.status === 'APPROVED')
      .sort((left, right) => {
        if (left.exposureCount !== right.exposureCount) {
          return left.exposureCount - right.exposureCount;
        }
        return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
      });
    if (pool.length < domain.itemCount) {
      throw new ExamRuleError('INSUFFICIENT_APPROVED_ITEMS');
    }
    for (const item of pool.slice(0, domain.itemCount)) {
      selected.push({ itemId: item.id, domainCode: domain.domainCode, sequence });
      sequence += 1;
    }
  }
  return selected;
}

export type AngoffRating = {
  itemId: string;
  panelistUserId: string;
  probabilityBasisPoints: number;
};

/** Mean of per-item panel means. At least two panelists. Returns percent-correct cut in basis points. */
export function angoffCutScoreBasisPoints(ratings: readonly AngoffRating[]): number {
  if (ratings.length === 0) {
    throw new ExamRuleError('RATINGS_REQUIRED');
  }
  const panelists = new Set(ratings.map((rating) => rating.panelistUserId));
  if (panelists.size < 2) {
    throw new ExamRuleError('PANEL_TOO_SMALL');
  }
  const byItem = new Map<string, number[]>();
  for (const rating of ratings) {
    if (
      !Number.isInteger(rating.probabilityBasisPoints) ||
      rating.probabilityBasisPoints < 0 ||
      rating.probabilityBasisPoints > 10_000
    ) {
      throw new ExamRuleError('RATING_OUT_OF_RANGE');
    }
    const list = byItem.get(rating.itemId) ?? [];
    list.push(rating.probabilityBasisPoints);
    byItem.set(rating.itemId, list);
  }
  let sum = 0;
  for (const values of byItem.values()) {
    sum += values.reduce((total, value) => total + value, 0) / values.length;
  }
  return Math.round(sum / byItem.size);
}

export function scoreBasisPoints(correct: number, total: number): number {
  if (total <= 0) {
    throw new ExamRuleError('EMPTY_FORM');
  }
  return Math.round((correct / total) * 10_000);
}

export type DomainTally = {
  domainCode: string;
  correct: number;
  total: number;
};

export function domainFeedbackForCandidate(
  passed: boolean,
  domains: readonly DomainTally[],
): DomainTally[] {
  if (passed) {
    return [];
  }
  return domains.map((domain) => ({ ...domain }));
}

/** Application approved for this scheme. Training and membership are not consulted. */
export function assertApplicationEligible(
  application: { status: string; schemeRef: string; applicantUserId: string } | null,
  candidateUserId: string,
  schemeCode: string,
): void {
  if (!application || application.applicantUserId !== candidateUserId) {
    throw new ExamRuleError('APPLICATION_REQUIRED');
  }
  if (application.status !== 'APPROVED') {
    throw new ExamRuleError('APPLICATION_NOT_APPROVED');
  }
  if (application.schemeRef !== schemeCode) {
    throw new ExamRuleError('SCHEME_MISMATCH');
  }
}

export function assertRetakeWindow(
  previousSubmittedAt: Date | null,
  windowDays: number,
  now: Date,
): void {
  if (!previousSubmittedAt) {
    return;
  }
  const next = previousSubmittedAt.getTime() + windowDays * 86_400_000;
  if (now.getTime() < next) {
    throw new ExamRuleError('RETAKE_WINDOW');
  }
}

/** The wait starts only after a failed attempt. A pass does not open the window. */
export function retakeWindowAnchor(
  previous: { submittedAt: Date | null; passed: boolean } | null,
): Date | null {
  if (!previous || previous.passed) {
    return null;
  }
  return previous.submittedAt;
}

/**
 * A session is ready only when a human recorded document type, verifier, time and method,
 * and no image was stored.
 */
export function assertNonImageIdentity(input: {
  documentType: string;
  method: string;
  outcome: string;
  reviewerUserId: string;
  subjectUserId: string;
  candidateUserId: string;
  checkedAt: Date | null;
  hasImage: boolean;
}): void {
  if (input.hasImage) {
    throw new ExamRuleError('IDENTITY_IMAGE_FORBIDDEN');
  }
  if (!IDENTITY_DOCUMENT_TYPES.includes(input.documentType as IdentityDocumentType)) {
    throw new ExamRuleError('IDENTITY_DOCUMENT_TYPE');
  }
  if (input.method !== 'HUMAN_VISUAL') {
    throw new ExamRuleError('IDENTITY_METHOD');
  }
  if (input.outcome !== 'VERIFIED') {
    throw new ExamRuleError('IDENTITY_NOT_VERIFIED');
  }
  if (!input.checkedAt) {
    throw new ExamRuleError('IDENTITY_CHECK_REQUIRED');
  }
  if (
    input.subjectUserId !== input.candidateUserId ||
    input.reviewerUserId === input.candidateUserId
  ) {
    throw new ExamRuleError('IDENTITY_VERIFIER');
  }
}

export function sessionExpiry(
  startedAt: Date,
  durationSeconds: number,
  extraTimePercent: number,
): Date {
  const factor = 1 + Math.max(0, extraTimePercent) / 100;
  return new Date(startedAt.getTime() + Math.round(durationSeconds * factor * 1000));
}

export function remainingSeconds(expiresAt: Date, now: Date): number {
  return Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
}

export function assertWithinWindow(expiresAt: Date, now: Date): void {
  if (now.getTime() > expiresAt.getTime()) {
    throw new ExamRuleError('TIME_EXPIRED');
  }
}

export function assertStartAcknowledgements(input: {
  rulesAccepted: boolean;
  ndaAccepted: boolean;
  mfaVerified: boolean;
}): void {
  if (!input.rulesAccepted) {
    throw new ExamRuleError('RULES_REQUIRED');
  }
  if (!input.ndaAccepted) {
    throw new ExamRuleError('NDA_REQUIRED');
  }
  if (!input.mfaVerified) {
    throw new ExamRuleError('MFA_REQUIRED');
  }
}

/**
 * ISO/IEC 17024 certification decision only.
 * Scoring or grading the exam the person ran is a different act and does not use this gate.
 * The decision maker must not have trained the candidate and must not have examined them.
 */
export function assertCertificationDecision(input: {
  makerUserId: string;
  candidateUserId: string;
  roles: readonly string[];
  trainerOfCandidate: boolean;
  examinedCandidate: boolean;
}): { independentOfTraining: true; trainerOfCandidate: false } {
  assertStaffAction(input.roles, 'DECIDE');
  if (input.makerUserId === input.candidateUserId) {
    throw new ExamRuleError('CANDIDATE_CANNOT_DECIDE');
  }
  if (input.trainerOfCandidate) {
    throw new ExamRuleError('TRAINER_CANNOT_DECIDE');
  }
  if (input.examinedCandidate) {
    throw new ExamRuleError('EXAMINER_CANNOT_DECIDE');
  }
  return { independentOfTraining: true, trainerOfCandidate: false };
}

export type CandidateItemView = {
  id: string;
  domainCode: string;
  stem: string;
  itemType: SchemeItemType;
  choices: readonly { choiceKey: string; text: string }[];
};

export function toCandidateItem(item: {
  id: string;
  domainCode: string;
  stem: string;
  itemType: SchemeItemType;
  choices: readonly { choiceKey: string; text: string; isCorrect?: boolean }[];
}): CandidateItemView {
  return {
    id: item.id,
    domainCode: item.domainCode,
    stem: item.stem,
    itemType: item.itemType,
    choices: item.choices.map((choice) => ({ choiceKey: choice.choiceKey, text: choice.text })),
  };
}

export function hashSeed(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 1_677_7619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function shuffleStable<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items];
  const random = mulberry32(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = copy[index] as T;
    copy[index] = copy[swap] as T;
    copy[swap] = current;
  }
  return copy;
}

export function pValue(correctCount: number, attemptCount: number): number {
  if (attemptCount <= 0) {
    throw new ExamRuleError('NO_ATTEMPTS');
  }
  return correctCount / attemptCount;
}

/** Sample point-biserial. Null when an item has no variance or fewer than two attempts. */
export function pointBiserial(
  itemScores: readonly number[],
  totalScores: readonly number[],
): number | null {
  const count = itemScores.length;
  if (count !== totalScores.length || count < 2) {
    return null;
  }
  const correct: number[] = [];
  const wrong: number[] = [];
  for (let index = 0; index < count; index += 1) {
    if (itemScores[index] === 1) {
      correct.push(totalScores[index] ?? 0);
    } else {
      wrong.push(totalScores[index] ?? 0);
    }
  }
  if (correct.length === 0 || wrong.length === 0) {
    return null;
  }
  const average = (values: readonly number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;
  const meanTotal = average(totalScores);
  const variance =
    totalScores.reduce((sum, value) => sum + (value - meanTotal) ** 2, 0) / (count - 1);
  if (variance === 0) {
    return null;
  }
  const proportion = correct.length / count;
  return (
    ((average(correct) - average(wrong)) / Math.sqrt(variance)) *
    Math.sqrt(proportion * (1 - proportion))
  );
}

/** KR-20 with sample variance of total scores (n - 1). */
export function kr20(matrix: readonly (readonly number[])[]): number | null {
  const candidates = matrix.length;
  const items = matrix[0]?.length ?? 0;
  if (candidates < 2 || items < 2) {
    return null;
  }
  const totals = matrix.map((row) => row.reduce((sum, value) => sum + value, 0));
  const mean = totals.reduce((sum, value) => sum + value, 0) / candidates;
  const variance = totals.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (candidates - 1);
  if (variance === 0) {
    return null;
  }
  let itemVariance = 0;
  for (let column = 0; column < items; column += 1) {
    let correct = 0;
    for (const row of matrix) {
      correct += row[column] ?? 0;
    }
    const proportion = correct / candidates;
    itemVariance += proportion * (1 - proportion);
  }
  return (items / (items - 1)) * (1 - itemVariance / variance);
}

export function itemReviewFlag(difficulty: number, discrimination: number | null): string | null {
  const flags: string[] = [];
  if (difficulty < P_VALUE_LOW || difficulty > P_VALUE_HIGH) {
    flags.push('P_VALUE');
  }
  if (discrimination !== null && discrimination < DISCRIMINATION_LOW) {
    flags.push('DISCRIMINATION');
  }
  return flags.length === 0 ? null : flags.join(',');
}

export function formReviewFlag(reliability: number | null): string | null {
  if (reliability === null) {
    return 'INSUFFICIENT_DATA';
  }
  if (reliability < KR20_LOW) {
    return 'KR20';
  }
  return null;
}
