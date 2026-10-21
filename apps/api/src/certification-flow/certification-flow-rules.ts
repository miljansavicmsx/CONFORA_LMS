/** Distinct documents and case rules. Humans decide; these functions only classify. */

export const EDUCATION_STATEMENT =
  'Ovo je potvrda o završetku edukacije. Utrošeno vrijeme je dokaz učešća, a ne dokaz kompetencije. Ovo nije profesionalni certifikat.';

export const EXAM_PASS_STATEMENT =
  'Ovo je potvrda o rezultatu ispita. Ovo NIJE profesionalna certifikacija.';

export const REFEREE_LINK_DAYS = 14;

export class FlowRuleError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'FlowRuleError';
  }
}

export type JourneyPath = 'CONFORA_EDUCATION' | 'DIRECT';
export type PassDisposition = 'NONE' | 'AUTO' | 'REVIEW';
export type ExclusionReason = 'CANDIDATE' | 'TRAINER' | 'EXAMINER' | 'CONFLICT' | 'AUTHORISATION';

export type LevelCriterion = {
  code: string;
  rank: number;
  minExperienceMonths: number;
  requiresExamPass: boolean;
};

export function examPassDisposition(input: {
  passed: boolean;
  itemTypes: readonly string[];
  openIrregularity: boolean;
}): PassDisposition {
  if (!input.passed) {
    return 'NONE';
  }
  const objective =
    input.itemTypes.length > 0 &&
    input.itemTypes.every(
      (itemType) => itemType === 'SINGLE_CHOICE' || itemType === 'MULTIPLE_CHOICE',
    );
  if (objective && !input.openIrregularity) {
    return 'AUTO';
  }
  return 'REVIEW';
}

/** Both paths are equal. Training completion never gates the exam. */
export function examEligibility(input: {
  schemePublished: boolean;
  prerequisitesAcknowledged: boolean;
  path: JourneyPath;
  trainingCompleted: boolean;
}): { eligible: boolean; trainingGates: false; path: JourneyPath } {
  void input.trainingCompleted;
  return {
    eligible: input.schemePublished && input.prerequisitesAcknowledged,
    trainingGates: false,
    path: input.path,
  };
}

/** A referee confirmation never satisfies a scheme requirement by itself. */
export function requirementsSatisfiedByReferee(): false {
  return false;
}

export function exclusionReason(input: {
  userId: string;
  candidateUserId: string;
  trainerUserIds: readonly string[];
  examinerUserIds: readonly string[];
  conflictUserIds: readonly string[];
  authorised: boolean;
}): ExclusionReason | null {
  if (input.userId === input.candidateUserId) {
    return 'CANDIDATE';
  }
  if (input.trainerUserIds.includes(input.userId)) {
    return 'TRAINER';
  }
  if (input.examinerUserIds.includes(input.userId)) {
    return 'EXAMINER';
  }
  if (input.conflictUserIds.includes(input.userId)) {
    return 'CONFLICT';
  }
  if (!input.authorised) {
    return 'AUTHORISATION';
  }
  return null;
}

/** Highest predefined rank whose criteria are met. The committee does not choose a level. */
export function computeEligibleLevel(input: {
  experienceMonths: number;
  examPassed: boolean;
  criteria: readonly LevelCriterion[];
}): string | null {
  const met = input.criteria.filter(
    (criterion) =>
      input.experienceMonths >= criterion.minExperienceMonths &&
      (!criterion.requiresExamPass || input.examPassed),
  );
  met.sort((left, right) => right.rank - left.rank);
  return met[0]?.code ?? null;
}

export function levelChosenByCommittee(computed: string | null): string | null {
  return computed;
}

export function voteResult(input: {
  grants: number;
  denies: number;
  quorum: number;
}): 'GRANT' | 'DENY' | 'PENDING' {
  if (input.grants + input.denies < input.quorum) {
    return 'PENDING';
  }
  if (input.grants > input.denies) {
    return 'GRANT';
  }
  if (input.denies > input.grants) {
    return 'DENY';
  }
  return 'PENDING';
}

export function assertFourEyes(
  actorUserId: string,
  decisionParticipantIds: readonly string[],
): void {
  if (decisionParticipantIds.includes(actorUserId)) {
    throw new FlowRuleError('FOUR_EYES');
  }
}

export function assertRole(roles: readonly string[], required: string): void {
  if (!roles.includes(required)) {
    throw new FlowRuleError('ROLE_SEPARATION');
  }
}

export const PUBLIC_VERIFICATION_STATEMENT =
  'Javna provjera autentičnosti dokumenta. Ime se prikazuje samo uz poseban pristanak nosioca.';

export type PublicDocumentType = 'EDUCATION_COMPLETION' | 'EXAM_PASS';

export type PublicVerificationView = {
  status: 'VALID' | 'INVALID';
  documentType: PublicDocumentType | null;
  issuedAt: string | null;
  holderName: string | null;
};

export const INVALID_PUBLIC_VERIFICATION: PublicVerificationView = {
  status: 'INVALID',
  documentType: null,
  issuedAt: null,
  holderName: null,
};

/** Public EDU/EXM view: status, type, and issue date. Name only while consent is active. */
export function presentPublicVerification(input: {
  documentType: PublicDocumentType;
  issuedAt: Date | null;
  nameConsentAt: Date | null;
  holderName: string | null;
}): PublicVerificationView {
  if (!input.issuedAt) {
    return INVALID_PUBLIC_VERIFICATION;
  }
  return {
    status: 'VALID',
    documentType: input.documentType,
    issuedAt: input.issuedAt.toISOString().slice(0, 10),
    holderName: input.nameConsentAt ? input.holderName : null,
  };
}

export function publicVerificationPdfLines(view: PublicVerificationView): readonly string[] {
  if (view.status !== 'VALID' || !view.documentType || !view.issuedAt) {
    return ['Status: INVALID'];
  }
  const typeLabel =
    view.documentType === 'EDUCATION_COMPLETION'
      ? 'Potvrda o završetku edukacije'
      : 'Potvrda o ispitu';
  const lines = [`Vrsta: ${typeLabel}`, `Datum izdavanja: ${view.issuedAt}`];
  if (view.holderName) {
    lines.push(`Ime: ${view.holderName}`);
  }
  return lines;
}
