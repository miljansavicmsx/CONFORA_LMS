import { createHash, randomBytes, randomUUID } from 'node:crypto';

import type { Prisma } from '@confora/database';

import type { CaseSuggestionPurpose } from '../certification-flow/case-suggestions';
import {
  decideCompositionAuthority,
  planComposition,
  type CommitteeSlotView,
} from '../certification-flow/committee-composition-policy';
import {
  decideConflictDeclaration,
  isDesignatedConflictClearer,
} from '../certification-flow/conflict-declaration-policy';
import {
  assertFourEyes,
  assertRole,
  computeEligibleLevel,
  EDUCATION_STATEMENT,
  examEligibility,
  examPassDisposition,
  exclusionReason,
  EXAM_PASS_STATEMENT,
  INVALID_PUBLIC_VERIFICATION,
  levelChosenByCommittee,
  presentPublicVerification,
  PUBLIC_VERIFICATION_STATEMENT,
  publicVerificationPdfLines,
  REFEREE_LINK_DAYS,
  requirementsSatisfiedByReferee,
  voteResult,
  FlowRuleError,
  type JourneyPath,
  type PublicVerificationView,
} from '../certification-flow/certification-flow-rules';
import { sealDelivery } from '../certification-flow/referee-delivery';
import {
  assertCertificationDecision,
  candidateWasExaminedBy,
  ExamRuleError,
} from '../exam/exam-rules';
import { drawDocumentPage, openUnicodePdf } from '../personnel/document-pdf';
import { examinationActorsForApplication } from './exam-tenant-store';
import { issuePersonnelCertificate, type PersonnelClient } from './personnel-certificate-store';

export class FlowNotFoundError extends Error {
  constructor() {
    super('FLOW_NOT_FOUND');
    this.name = 'FlowNotFoundError';
  }
}

type Tx = Prisma.TransactionClient;

export type FlowClient = {
  $transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
} & Pick<
  Tx,
  | 'schemeLevelCriterion'
  | 'schemeDecisionMaker'
  | 'schemeCaseRule'
  | 'professionalCase'
  | 'educationCompletionDocument'
  | 'examPassAttestation'
  | 'caseEvidenceItem'
  | 'refereeConfirmation'
  | 'messageOutbox'
  | 'committeeProposal'
  | 'committeeAssessment'
  | 'issuanceAuthorization'
  | 'aiCaseSuggestion'
  | 'committeeConflictDeclaration'
  | 'publicDocumentAccessLog'
  | 'enrolment'
  | 'enrolmentTrainer'
  | 'certificationSchemeVersion'
  | 'certificationExamResult'
  | 'certificationExamSession'
  | 'examCertificationDecision'
>;

type Actor = { userId: string; roles: readonly string[] };

const caseInclude = {
  evidence: true,
  referees: true,
  proposals: true,
  assessments: true,
  authorization: true,
  schemeVersion: { include: { scheme: true, levelCriteria: true, caseRule: true } },
} as const;

type LoadedCase = Prisma.ProfessionalCaseGetPayload<{ include: typeof caseInclude }>;

export function publicAppOrigin(): string {
  const configured = process.env['PUBLIC_APP_ORIGIN']?.trim() ?? '';
  if (configured.length > 0) {
    return configured;
  }
  const env = process.env['NODE_ENV'];
  if (env === 'development' || env === 'test') {
    return 'http://127.0.0.1:3001';
  }
  throw new FlowRuleError('ORIGIN_UNCONFIGURED');
}

function randomVerificationId(): string {
  return randomBytes(32).toString('base64url');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function latestConflictDeclaration(
  client: FlowClient,
  tenantId: string,
  caseId: string,
  userId: string,
) {
  return client.committeeConflictDeclaration.findFirst({
    where: { tenantId, caseId, userId },
    orderBy: [{ signedAt: 'desc' }, { createdAt: 'desc' }],
  });
}

async function assertConflictCleared(
  client: FlowClient,
  tenantId: string,
  caseId: string,
  userId: string,
): Promise<void> {
  const row = await latestConflictDeclaration(client, tenantId, caseId, userId);
  if (!row) {
    throw new FlowRuleError('CONFLICT_UNSIGNED');
  }
  if (row.hasConflict) {
    throw new FlowRuleError('CONFLICT_DECLARED');
  }
}

/** Assignment is a proposal that has not been excluded. Missing and excluded slots are refused. */
async function assertAssigned(
  client: FlowClient,
  tenantId: string,
  caseId: string,
  userId: string,
): Promise<void> {
  const slot = await client.committeeProposal.findFirst({
    where: { tenantId, caseId, userId, state: { not: 'EXCLUDED' } },
    select: { id: true },
  });
  if (!slot) {
    throw new FlowRuleError('NOT_ASSIGNED');
  }
}

function numbered(prefix: string, year: number, count: number): string {
  return `${prefix}-${String(year)}-${String(count + 1).padStart(4, '0')}`;
}

async function loadCase(client: FlowClient, tenantId: string, caseId: string): Promise<LoadedCase> {
  const row = await client.professionalCase.findFirst({
    where: { tenantId, id: caseId },
    include: caseInclude,
  });
  if (!row) {
    throw new FlowNotFoundError();
  }
  return row;
}

function profileName(profile: { givenName: string; familyName: string } | null): string | null {
  if (!profile) {
    return null;
  }
  const name = `${profile.givenName} ${profile.familyName}`.trim();
  return name.length > 0 ? name : null;
}

function criteriaOf(row: LoadedCase) {
  return row.schemeVersion.levelCriteria.map((criterion) => ({
    code: criterion.code,
    rank: criterion.rank,
    minExperienceMonths: criterion.minExperienceMonths,
    requiresExamPass: criterion.requiresExamPass,
  }));
}

function present(row: LoadedCase, examPassed: boolean) {
  return {
    caseId: row.id,
    path: row.path,
    phase: row.phase,
    trainingGates: false as const,
    experienceMonths: row.experienceMonths,
    computedLevelCode: row.computedLevelCode,
    eligibleLevel: levelChosenByCommittee(
      computeEligibleLevel({
        experienceMonths: row.experienceMonths,
        examPassed,
        criteria: criteriaOf(row),
      }),
    ),
    scheme: row.schemeVersion.scheme.title,
    schemeVersion: row.schemeVersion.versionLabel,
    examResultId: row.examResultId,
    evidence: row.evidence.map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      summary: item.summary,
    })),
    referees: row.referees.map((referee) => ({
      id: referee.id,
      refereeName: referee.refereeName,
      organization: referee.organization,
      state: referee.state,
      confirmedAt: referee.confirmedAt?.toISOString() ?? null,
      discrepancies: referee.discrepancies,
      credible: referee.credible,
      relevanceNote: referee.relevanceNote,
      requirementsSatisfied: requirementsSatisfiedByReferee(),
    })),
    proposals: row.proposals.map((proposal) => ({
      userId: proposal.userId,
      state: proposal.state,
      exclusionReason: proposal.exclusionReason,
    })),
    assessments: row.assessments.map((assessment) => ({
      memberUserId: assessment.memberUserId,
      ballot: assessment.ballot,
      reasoning: assessment.reasoning,
    })),
    authorizedByUserId: row.authorization?.authorisedByUserId ?? null,
  };
}

async function examPassedFor(
  client: FlowClient,
  tenantId: string,
  resultId: string | null,
): Promise<boolean> {
  if (!resultId) {
    return false;
  }
  const result = await client.certificationExamResult.findFirst({
    where: { tenantId, id: resultId },
  });
  return Boolean(result?.passed);
}

export async function saveLevel(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    schemeVersionId: string;
    code: string;
    title: string;
    rank: number;
    minExperienceMonths: number;
    requiresExamPass: boolean;
  },
) {
  assertRole(input.actor.roles, 'COM_TECH');
  const version = await client.certificationSchemeVersion.findFirst({
    where: { tenantId: input.tenantId, id: input.schemeVersionId },
  });
  if (!version) {
    throw new FlowNotFoundError();
  }
  const existing = await client.schemeLevelCriterion.findFirst({
    where: { tenantId: input.tenantId, schemeVersionId: input.schemeVersionId, code: input.code },
  });
  if (existing) {
    return { levelId: existing.id, code: existing.code };
  }
  const id = randomUUID();
  await client.schemeLevelCriterion.create({
    data: {
      id,
      tenantId: input.tenantId,
      schemeVersionId: input.schemeVersionId,
      code: input.code,
      title: input.title,
      rank: input.rank,
      minExperienceMonths: input.minExperienceMonths,
      requiresExamPass: input.requiresExamPass,
    },
  });
  return { levelId: id, code: input.code };
}

export async function saveDecisionMaker(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    schemeVersionId: string;
    userId: string;
    competenceNote: string;
    authorisedFrom: Date;
    authorisedUntil: Date;
  },
) {
  assertRole(input.actor.roles, 'COM_TECH');
  const existing = await client.schemeDecisionMaker.findFirst({
    where: {
      tenantId: input.tenantId,
      schemeVersionId: input.schemeVersionId,
      userId: input.userId,
    },
  });
  if (existing) {
    return { decisionMakerId: existing.id, userId: existing.userId };
  }
  const id = randomUUID();
  await client.schemeDecisionMaker.create({
    data: {
      id,
      tenantId: input.tenantId,
      schemeVersionId: input.schemeVersionId,
      userId: input.userId,
      competenceNote: input.competenceNote,
      authorisedFrom: input.authorisedFrom,
      authorisedUntil: input.authorisedUntil,
    },
  });
  return { decisionMakerId: id, userId: input.userId };
}

export async function saveCaseRule(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    schemeVersionId: string;
    votingQuorum: number;
    experienceMayFollowExam: boolean;
    experienceMode: 'INDEPENDENT_REFERENCES' | 'OTHER_VERIFIABLE_EVIDENCE';
    referenceCount: number;
  },
) {
  assertRole(input.actor.roles, 'COM_TECH');
  const existing = await client.schemeCaseRule.findFirst({
    where: { tenantId: input.tenantId, schemeVersionId: input.schemeVersionId },
  });
  if (existing) {
    return { ruleId: existing.id, votingQuorum: existing.votingQuorum };
  }
  const id = randomUUID();
  await client.schemeCaseRule.create({
    data: {
      id,
      tenantId: input.tenantId,
      schemeVersionId: input.schemeVersionId,
      votingQuorum: input.votingQuorum,
      experienceMayFollowExam: input.experienceMayFollowExam,
      experienceMode: input.experienceMode,
      referenceCount: input.referenceCount,
    },
  });
  return { ruleId: id, votingQuorum: input.votingQuorum };
}

export async function openProfessionalCase(
  client: FlowClient,
  input: {
    tenantId: string;
    userId: string;
    schemeVersionId: string;
    path: JourneyPath;
    prerequisitesAcknowledged: boolean;
    certificationApplicationId: string;
    experienceMonths: number;
    now: Date;
  },
) {
  const version = await client.certificationSchemeVersion.findFirst({
    where: { tenantId: input.tenantId, id: input.schemeVersionId },
  });
  if (!version) {
    throw new FlowNotFoundError();
  }
  const gate = examEligibility({
    schemePublished: version.lifecycle === 'PUBLISHED',
    prerequisitesAcknowledged: input.prerequisitesAcknowledged,
    path: input.path,
    trainingCompleted: false,
  });
  if (!gate.eligible) {
    throw new FlowRuleError('NOT_ELIGIBLE');
  }
  const id = randomUUID();
  await client.professionalCase.create({
    data: {
      id,
      tenantId: input.tenantId,
      applicantUserId: input.userId,
      schemeVersionId: input.schemeVersionId,
      certificationApplicationId: input.certificationApplicationId,
      path: input.path,
      phase: 'ELIGIBILITY',
      prerequisitesAcknowledgedAt: input.now,
      experienceMonths: input.experienceMonths,
    },
  });
  return {
    caseId: id,
    eligible: true,
    trainingGates: false as const,
    path: input.path,
    phase: 'ELIGIBILITY' as const,
  };
}

export async function listMyCases(client: FlowClient, tenantId: string, userId: string) {
  const rows = await client.professionalCase.findMany({
    where: { tenantId, applicantUserId: userId },
    include: caseInclude,
    orderBy: { createdAt: 'desc' },
  });
  return Promise.all(
    rows.map(async (row) => present(row, await examPassedFor(client, tenantId, row.examResultId))),
  );
}

export async function readApplicantCase(
  client: FlowClient,
  tenantId: string,
  userId: string,
  caseId: string,
) {
  const row = await loadCase(client, tenantId, caseId);
  if (row.applicantUserId !== userId) {
    throw new FlowRuleError('NOT_APPLICANT');
  }
  return present(row, await examPassedFor(client, tenantId, row.examResultId));
}

export async function readCommitteeCase(
  client: FlowClient,
  tenantId: string,
  actor: Actor,
  caseId: string,
) {
  assertRole(actor.roles, 'COM_CERT');
  await assertAssigned(client, tenantId, caseId, actor.userId);
  await assertConflictCleared(client, tenantId, caseId, actor.userId);
  const row = await loadCase(client, tenantId, caseId);
  return present(row, await examPassedFor(client, tenantId, row.examResultId));
}

export async function listCommitteeCases(client: FlowClient, tenantId: string, actor: Actor) {
  assertRole(actor.roles, 'COM_CERT');
  const rows = await client.professionalCase.findMany({
    where: {
      tenantId,
      proposals: { some: { userId: actor.userId, state: { not: 'EXCLUDED' } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((row) => ({
    caseId: row.id,
    phase: row.phase,
    assigned: true as const,
  }));
}

export async function signConflictDeclaration(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    caseId: string;
    subjectUserId?: string | undefined;
    hasConflict: boolean;
    statement: string;
    now: Date;
  },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  await loadCase(client, input.tenantId, input.caseId);
  await assertAssigned(client, input.tenantId, input.caseId, input.actor.userId);
  const subjectUserId = input.subjectUserId ?? input.actor.userId;
  const latest = await latestConflictDeclaration(
    client,
    input.tenantId,
    input.caseId,
    subjectUserId,
  );
  const actorLatest =
    input.actor.userId === subjectUserId
      ? latest
      : await latestConflictDeclaration(client, input.tenantId, input.caseId, input.actor.userId);
  const decision = decideConflictDeclaration({
    actorUserId: input.actor.userId,
    subjectUserId,
    hasConflict: input.hasConflict,
    designatedClearer: isDesignatedConflictClearer(input.actor.roles),
    actorHasConflict: actorLatest?.hasConflict === true,
    latest: latest
      ? { hasConflict: latest.hasConflict, recordedByUserId: latest.recordedByUserId }
      : null,
  });
  if (decision.action === 'deny') {
    throw new FlowRuleError(decision.code);
  }
  if (decision.action === 'unchanged' && latest) {
    return {
      caseId: input.caseId,
      hasConflict: latest.hasConflict,
      signedAt: latest.signedAt.toISOString(),
      created: false as const,
      reason: latest.hasConflict ? ('conflict' as const) : ('no-conflict' as const),
    };
  }
  if (decision.action !== 'append') {
    throw new FlowRuleError('CONFLICT_CLEARANCE_REQUIRED');
  }
  await client.committeeConflictDeclaration.create({
    data: {
      id: randomUUID(),
      tenantId: input.tenantId,
      caseId: input.caseId,
      userId: subjectUserId,
      recordedByUserId: input.actor.userId,
      hasConflict: input.hasConflict,
      statement: input.statement,
      signedAt: input.now,
    },
  });
  return {
    caseId: input.caseId,
    hasConflict: input.hasConflict,
    signedAt: input.now.toISOString(),
    created: true as const,
    reason: decision.reason,
  };
}

export async function linkExamResult(
  client: FlowClient,
  input: { tenantId: string; userId: string; caseId: string; resultId: string },
) {
  const row = await loadCase(client, input.tenantId, input.caseId);
  if (row.applicantUserId !== input.userId) {
    throw new FlowRuleError('NOT_APPLICANT');
  }
  const result = await client.certificationExamResult.findFirst({
    where: { tenantId: input.tenantId, id: input.resultId },
    include: { session: true },
  });
  if (!result || result.session.candidateUserId !== input.userId) {
    throw new FlowNotFoundError();
  }
  if (!result.passed) {
    throw new FlowRuleError('EXAM_NOT_PASSED');
  }
  await client.professionalCase.update({
    where: { tenantId_id: { tenantId: input.tenantId, id: row.id } },
    data: { examResultId: result.id, phase: row.phase === 'ELIGIBILITY' ? 'DOSSIER' : row.phase },
  });
  return { caseId: row.id, phase: 'DOSSIER' as const, examResultId: result.id };
}

export async function addEvidence(
  client: FlowClient,
  input: {
    tenantId: string;
    userId: string;
    caseId: string;
    kind: 'EDUCATION' | 'QUALIFICATION' | 'EXPERIENCE' | 'WORK' | 'OTHER';
    title: string;
    summary?: string;
    objectKey?: string;
  },
) {
  const row = await loadCase(client, input.tenantId, input.caseId);
  if (row.applicantUserId !== input.userId) {
    throw new FlowRuleError('NOT_APPLICANT');
  }
  if (row.phase === 'ISSUED' || row.phase === 'DENIED' || row.phase === 'APPROVED_FOR_ISSUANCE') {
    throw new FlowRuleError('CASE_CLOSED');
  }
  const id = randomUUID();
  await client.caseEvidenceItem.create({
    data: {
      id,
      tenantId: input.tenantId,
      caseId: row.id,
      kind: input.kind,
      title: input.title,
      summary: input.summary ?? null,
      objectKey: input.objectKey ?? null,
    },
  });
  return { evidenceId: id, kind: input.kind };
}

export async function completeDossier(
  client: FlowClient,
  input: { tenantId: string; userId: string; caseId: string; experienceMonths: number },
) {
  const row = await loadCase(client, input.tenantId, input.caseId);
  if (row.applicantUserId !== input.userId) {
    throw new FlowRuleError('NOT_APPLICANT');
  }
  if (!row.examResultId) {
    throw new FlowRuleError('EXAM_REQUIRED');
  }
  const rule = row.schemeVersion.caseRule;
  const experienceAllowedLater = rule?.experienceMayFollowExam ?? true;
  const hasExperience =
    input.experienceMonths > 0 ||
    row.evidence.some((item) => item.kind === 'EXPERIENCE' || item.kind === 'WORK');
  if (!experienceAllowedLater && !hasExperience) {
    throw new FlowRuleError('EXPERIENCE_REQUIRED');
  }
  await client.professionalCase.update({
    where: { tenantId_id: { tenantId: input.tenantId, id: row.id } },
    data: { phase: 'COMMITTEE', experienceMonths: input.experienceMonths },
  });
  await ensureCommitteeAssignments(client, input.tenantId, row, new Date());
  return { caseId: row.id, phase: 'COMMITTEE' as const };
}

export async function requestReferee(
  client: FlowClient,
  input: {
    tenantId: string;
    userId: string;
    caseId: string;
    refereeName: string;
    organization: string;
    email: string;
    requestedFacts: string;
    now: Date;
  },
) {
  const row = await loadCase(client, input.tenantId, input.caseId);
  if (row.applicantUserId !== input.userId) {
    throw new FlowRuleError('NOT_APPLICANT');
  }
  const token = randomBytes(32).toString('base64url');
  const id = randomUUID();
  const expiresAt = new Date(input.now.getTime() + REFEREE_LINK_DAYS * 86_400_000);
  const link = `${publicAppOrigin()}/referee/${token}`;
  await client.refereeConfirmation.create({
    data: {
      id,
      tenantId: input.tenantId,
      caseId: row.id,
      refereeName: input.refereeName,
      organization: input.organization,
      email: input.email,
      tokenHash: hashToken(token),
      expiresAt,
      requestedFacts: input.requestedFacts,
    },
  });
  await client.messageOutbox.create({
    data: {
      id: randomUUID(),
      tenantId: input.tenantId,
      toAddress: input.email,
      subject: 'Potvrda iskustva',
      body: sealDelivery(link),
      status: 'LOGGED',
    },
  });
  return {
    refereeId: id,
    expiresAt: expiresAt.toISOString(),
    requirementsSatisfied: requirementsSatisfiedByReferee(),
  };
}

export async function confirmReferee(
  client: FlowClient,
  input: {
    token: string;
    accept: boolean;
    confirmedFacts?: string;
    discrepancies?: string;
    now: Date;
  },
) {
  const tokenHash = hashToken(input.token);
  const updated = await client.refereeConfirmation.updateMany({
    where: {
      tokenHash,
      state: 'PENDING',
      expiresAt: { gt: input.now },
    },
    data: {
      state: input.accept ? 'CONFIRMED' : 'DECLINED',
      confirmedFacts: input.confirmedFacts ?? null,
      discrepancies: input.discrepancies ?? null,
      confirmedAt: input.now,
    },
  });
  if (updated.count === 1) {
    const row = await client.refereeConfirmation.findFirst({ where: { tokenHash } });
    if (!row) {
      throw new FlowNotFoundError();
    }
    return {
      refereeId: row.id,
      state: input.accept ? ('CONFIRMED' as const) : ('DECLINED' as const),
      requirementsSatisfied: requirementsSatisfiedByReferee(),
    };
  }
  const row = await client.refereeConfirmation.findFirst({ where: { tokenHash } });
  if (!row) {
    throw new FlowNotFoundError();
  }
  if (row.expiresAt.getTime() <= input.now.getTime()) {
    if (row.state === 'PENDING') {
      await client.refereeConfirmation.updateMany({
        where: { tokenHash, state: 'PENDING' },
        data: { state: 'EXPIRED' },
      });
    }
    throw new FlowRuleError('LINK_EXPIRED');
  }
  throw new FlowRuleError('LINK_USED');
}

export async function assessReferee(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    caseId: string;
    refereeId: string;
    relevanceNote: string;
    credible: boolean;
    now: Date;
  },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  await assertAssigned(client, input.tenantId, input.caseId, input.actor.userId);
  await assertConflictCleared(client, input.tenantId, input.caseId, input.actor.userId);
  const referee = await client.refereeConfirmation.findFirst({
    where: { tenantId: input.tenantId, id: input.refereeId, caseId: input.caseId },
  });
  if (!referee) {
    throw new FlowNotFoundError();
  }
  await client.refereeConfirmation.update({
    where: { tenantId_id: { tenantId: input.tenantId, id: referee.id } },
    data: {
      relevanceNote: input.relevanceNote,
      credible: input.credible,
      assessedByUserId: input.actor.userId,
      assessedAt: input.now,
    },
  });
  return { refereeId: referee.id, requirementsSatisfied: requirementsSatisfiedByReferee() };
}

async function recordedConflictUserIds(
  client: FlowClient,
  tenantId: string,
  caseId: string,
): Promise<string[]> {
  const rows = await client.committeeConflictDeclaration.findMany({
    where: { tenantId, caseId },
    orderBy: [{ signedAt: 'asc' }, { createdAt: 'asc' }],
    select: { userId: true, hasConflict: true },
  });
  const latest = new Map<string, boolean>();
  for (const row of rows) {
    latest.set(row.userId, row.hasConflict);
  }
  return [...latest.entries()].filter((entry) => entry[1]).map((entry) => entry[0]);
}

async function desiredCommitteeSlots(
  client: FlowClient,
  input: { tenantId: string; row: LoadedCase; now: Date },
): Promise<CommitteeSlotView[]> {
  const makers = await client.schemeDecisionMaker.findMany({
    where: { tenantId: input.tenantId, schemeVersionId: input.row.schemeVersionId },
  });
  const trainers = await client.enrolmentTrainer.findMany({
    where: { tenantId: input.tenantId, enrolment: { userId: input.row.applicantUserId } },
  });
  const examinerIds: string[] = [];
  if (input.row.examResultId) {
    const result = await client.certificationExamResult.findFirst({
      where: { tenantId: input.tenantId, id: input.row.examResultId },
      select: { session: { select: { certificationApplicationId: true } } },
    });
    if (result) {
      const actors = await examinationActorsForApplication(
        client,
        input.tenantId,
        result.session.certificationApplicationId,
      );
      examinerIds.push(...actors.invigilatorUserIds, ...actors.proctorReviewerUserIds);
    }
  }
  const conflictUserIds = await recordedConflictUserIds(client, input.tenantId, input.row.id);
  return makers.map((maker) => {
    const authorised =
      maker.authorisedFrom.getTime() <= input.now.getTime() &&
      maker.authorisedUntil.getTime() >= input.now.getTime();
    const reason = exclusionReason({
      userId: maker.userId,
      candidateUserId: input.row.applicantUserId,
      trainerUserIds: trainers.map((trainer) => trainer.trainerUserId),
      examinerUserIds: examinerIds,
      conflictUserIds,
      authorised,
    });
    return {
      userId: maker.userId,
      state: reason ? ('EXCLUDED' as const) : ('PROPOSED' as const),
      exclusionReason: reason,
    };
  });
}

async function writeCommitteeProposals(
  client: FlowClient,
  input: { tenantId: string; row: LoadedCase; now: Date },
) {
  const desired = await desiredCommitteeSlots(client, input);
  const slots = [];
  for (const slot of desired) {
    await client.committeeProposal.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        caseId: input.row.id,
        userId: slot.userId,
        state: slot.state,
        exclusionReason: slot.exclusionReason,
      },
    });
    slots.push(slot);
  }
  return slots;
}

/** First slots are created when the case reaches the committee, before any member acts. */
async function ensureCommitteeAssignments(
  client: FlowClient,
  tenantId: string,
  row: LoadedCase,
  now: Date,
): Promise<void> {
  const existing = await client.committeeProposal.count({
    where: { tenantId, caseId: row.id },
  });
  if (existing > 0) {
    return;
  }
  await writeCommitteeProposals(client, { tenantId, row, now });
}

function slotView(row: LoadedCase): CommitteeSlotView[] {
  return row.proposals.map((proposal) => ({
    userId: proposal.userId,
    state: proposal.state,
    exclusionReason: proposal.exclusionReason,
  }));
}

export async function proposeCommittee(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    caseId: string;
    reason: string;
    now: Date;
  },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  const row = await loadCase(client, input.tenantId, input.caseId);
  if (row.phase !== 'COMMITTEE' && row.phase !== 'APPROVED_FOR_ISSUANCE') {
    throw new FlowRuleError('NOT_IN_COMMITTEE');
  }
  if (row.authorization) {
    throw new FlowRuleError('COMPOSITION_CLOSED');
  }
  const actorDeclaration = await latestConflictDeclaration(
    client,
    input.tenantId,
    input.caseId,
    input.actor.userId,
  );
  const desired = await desiredCommitteeSlots(client, {
    tenantId: input.tenantId,
    row,
    now: input.now,
  });
  const liveVotes = row.assessments.filter((assessment) => assessment.voidedAt === null);
  const plan = planComposition({
    existing: slotView(row),
    desired,
    votingStarted: liveVotes.length > 0,
  });
  const decision = decideCompositionAuthority({
    actorRoles: input.actor.roles,
    actorSigned: actorDeclaration !== null,
    actorHasConflict: actorDeclaration?.hasConflict === true,
    actorUserId: input.actor.userId,
    reason: input.reason,
    updates: plan.updates,
  });
  if (decision.action === 'deny') {
    throw new FlowRuleError(decision.code);
  }
  if (plan.updates.length === 0) {
    return {
      caseId: row.id,
      slots: slotView(row),
      changed: false as const,
      votesInvalidated: 0,
      reconfirmationRequired: false,
      phase: row.phase,
      purpose: 'UNCHANGED',
    };
  }
  await client.$transaction(async (tx) => {
    if (plan.invalidateVotes) {
      await tx.committeeAssessment.updateMany({
        where: { tenantId: input.tenantId, caseId: row.id, voidedAt: null },
        data: { voidedAt: input.now, voidReason: 'COMPOSITION_CHANGED' },
      });
      if (row.phase === 'APPROVED_FOR_ISSUANCE') {
        await tx.professionalCase.update({
          where: { tenantId_id: { tenantId: input.tenantId, id: row.id } },
          data: { phase: 'COMMITTEE', computedLevelCode: null },
        });
      }
    }
    for (const update of plan.updates) {
      if (update.create) {
        await tx.committeeProposal.create({
          data: {
            id: randomUUID(),
            tenantId: input.tenantId,
            caseId: row.id,
            userId: update.userId,
            state: update.toState,
            exclusionReason: update.exclusionReason,
          },
        });
        continue;
      }
      const current = row.proposals.find((proposal) => proposal.userId === update.userId);
      if (!current) {
        continue;
      }
      await tx.committeeProposal.update({
        where: { tenantId_id: { tenantId: input.tenantId, id: current.id } },
        data: {
          state: update.toState,
          exclusionReason: update.exclusionReason,
          ...(update.clearConfirmation ? { confirmedByUserId: null } : {}),
        },
      });
    }
  });
  const refreshed = await loadCase(client, input.tenantId, input.caseId);
  const purpose = plan.updates
    .map((update) => `${update.userId}:${update.fromState}>${update.toState}`)
    .join(';');
  return {
    caseId: row.id,
    slots: slotView(refreshed),
    changed: true as const,
    votesInvalidated: plan.invalidateVotes ? liveVotes.length : 0,
    reconfirmationRequired: plan.reconfirmationRequired,
    phase: refreshed.phase,
    purpose: plan.invalidateVotes ? `${purpose};votes=${String(liveVotes.length)}` : purpose,
  };
}

export async function confirmProposal(
  client: FlowClient,
  input: { tenantId: string; actor: Actor; caseId: string; memberUserId: string },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  await assertAssigned(client, input.tenantId, input.caseId, input.actor.userId);
  await assertConflictCleared(client, input.tenantId, input.caseId, input.actor.userId);
  const slot = await client.committeeProposal.findFirst({
    where: { tenantId: input.tenantId, caseId: input.caseId, userId: input.memberUserId },
  });
  if (!slot) {
    throw new FlowNotFoundError();
  }
  if (slot.state !== 'PROPOSED') {
    throw new FlowRuleError('NOT_ELIGIBLE');
  }
  await client.committeeProposal.update({
    where: { tenantId_id: { tenantId: input.tenantId, id: slot.id } },
    data: { state: 'CONFIRMED', confirmedByUserId: input.actor.userId },
  });
  return { caseId: input.caseId, memberUserId: input.memberUserId, state: 'CONFIRMED' as const };
}

async function decisionParticipants(
  client: FlowClient,
  tenantId: string,
  row: LoadedCase,
): Promise<string[]> {
  const ids = new Set<string>();
  if (row.examResultId) {
    const decision = await client.examCertificationDecision.findFirst({
      where: { tenantId, resultId: row.examResultId },
    });
    if (decision) {
      ids.add(decision.decidedByUserId);
    }
  }
  for (const assessment of row.assessments) {
    ids.add(assessment.memberUserId);
  }
  for (const proposal of row.proposals) {
    if (proposal.confirmedByUserId) {
      ids.add(proposal.confirmedByUserId);
    }
  }
  return [...ids];
}

/**
 * ISO/IEC 17024 certification decision only. Exam scoring does not use this gate.
 * The confirmer who would be recorded as the decision maker must not have trained
 * or examined the candidate. An examiner may still score the session they ran.
 */
async function assertRecordedDecisionMaker(
  client: FlowClient,
  tenantId: string,
  row: LoadedCase,
  confirmerUserId: string,
  actor: Actor,
): Promise<void> {
  const result = row.examResultId
    ? await client.certificationExamResult.findFirst({
        where: { tenantId, id: row.examResultId },
        select: { session: { select: { certificationApplicationId: true } } },
      })
    : null;
  const actors = result
    ? await examinationActorsForApplication(
        client,
        tenantId,
        result.session.certificationApplicationId,
      )
    : { invigilatorUserIds: [], proctorReviewerUserIds: [] };
  const trainer = await client.enrolmentTrainer.findFirst({
    where: {
      tenantId,
      trainerUserId: confirmerUserId,
      enrolment: { userId: row.applicantUserId },
    },
  });
  try {
    assertCertificationDecision({
      makerUserId: confirmerUserId,
      candidateUserId: row.applicantUserId,
      roles: confirmerUserId === actor.userId ? actor.roles : ['COM_CERT'],
      trainerOfCandidate: Boolean(trainer),
      examinedCandidate: candidateWasExaminedBy({
        userId: confirmerUserId,
        invigilatorUserIds: actors.invigilatorUserIds,
        proctorReviewerUserIds: actors.proctorReviewerUserIds,
      }),
    });
  } catch (error) {
    if (error instanceof ExamRuleError) {
      throw new FlowRuleError(error.code);
    }
    throw error;
  }
}

export async function recordVote(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    caseId: string;
    ballot: 'GRANT' | 'DENY';
    reasoning: string;
    now: Date;
  },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  await assertAssigned(client, input.tenantId, input.caseId, input.actor.userId);
  await assertConflictCleared(client, input.tenantId, input.caseId, input.actor.userId);
  const row = await loadCase(client, input.tenantId, input.caseId);
  const slot = row.proposals.find((proposal) => proposal.userId === input.actor.userId);
  if (!slot || slot.state !== 'CONFIRMED') {
    throw new FlowRuleError('NOT_MEMBER');
  }
  const liveVotes = row.assessments.filter((assessment) => assessment.voidedAt === null);
  const existing = liveVotes.find((assessment) => assessment.memberUserId === input.actor.userId);
  if (existing) {
    throw new FlowRuleError('ALREADY_VOTED');
  }
  const pendingBallots = [...liveVotes.map((assessment) => assessment.ballot), input.ballot];
  const pendingOutcome = voteResult({
    grants: pendingBallots.filter((ballot) => ballot === 'GRANT').length,
    denies: pendingBallots.filter((ballot) => ballot === 'DENY').length,
    quorum: row.schemeVersion.caseRule?.votingQuorum ?? 2,
  });
  if (pendingOutcome === 'GRANT' && row.examResultId) {
    const passedNow = await examPassedFor(client, input.tenantId, row.examResultId);
    const levelNow = levelChosenByCommittee(
      computeEligibleLevel({
        experienceMonths: row.experienceMonths,
        examPassed: passedNow,
        criteria: criteriaOf(row),
      }),
    );
    if (levelNow) {
      const priorDecision = await client.examCertificationDecision.findFirst({
        where: { tenantId: input.tenantId, resultId: row.examResultId },
      });
      if (!priorDecision) {
        const confirmer =
          row.proposals.find((proposal) => proposal.confirmedByUserId)?.confirmedByUserId ??
          input.actor.userId;
        await assertRecordedDecisionMaker(client, input.tenantId, row, confirmer, input.actor);
      }
    }
  }
  await client.committeeAssessment.create({
    data: {
      id: randomUUID(),
      tenantId: input.tenantId,
      caseId: row.id,
      memberUserId: input.actor.userId,
      ballot: input.ballot,
      reasoning: input.reasoning,
    },
  });
  const ballots = [...liveVotes.map((assessment) => assessment.ballot), input.ballot];
  const outcome = voteResult({
    grants: ballots.filter((ballot) => ballot === 'GRANT').length,
    denies: ballots.filter((ballot) => ballot === 'DENY').length,
    quorum: row.schemeVersion.caseRule?.votingQuorum ?? 2,
  });
  if (outcome === 'PENDING') {
    return { caseId: row.id, outcome, phase: row.phase, computedLevelCode: row.computedLevelCode };
  }
  if (outcome === 'DENY') {
    await client.professionalCase.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: row.id } },
      data: { phase: 'DENIED' },
    });
    return { caseId: row.id, outcome, phase: 'DENIED' as const, computedLevelCode: null };
  }
  const passed = await examPassedFor(client, input.tenantId, row.examResultId);
  const level = levelChosenByCommittee(
    computeEligibleLevel({
      experienceMonths: row.experienceMonths,
      examPassed: passed,
      criteria: criteriaOf(row),
    }),
  );
  if (!level || !row.examResultId) {
    return {
      caseId: row.id,
      outcome: 'PENDING' as const,
      phase: row.phase,
      computedLevelCode: null,
    };
  }
  const confirmer =
    row.proposals.find((proposal) => proposal.confirmedByUserId)?.confirmedByUserId ??
    input.actor.userId;
  const prior = await client.examCertificationDecision.findFirst({
    where: { tenantId: input.tenantId, resultId: row.examResultId },
  });
  if (!prior) {
    const trainer = await client.enrolmentTrainer.findFirst({
      where: {
        tenantId: input.tenantId,
        trainerUserId: confirmer,
        enrolment: { userId: row.applicantUserId },
      },
    });
    await client.examCertificationDecision.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        resultId: row.examResultId,
        decidedByUserId: confirmer,
        outcome: 'GRANT',
        rationale: input.reasoning,
        trainerOfCandidate: Boolean(trainer),
        independentOfTraining: !trainer,
        decidedAt: input.now,
      },
    });
  }
  await client.professionalCase.update({
    where: { tenantId_id: { tenantId: input.tenantId, id: row.id } },
    data: { phase: 'APPROVED_FOR_ISSUANCE', computedLevelCode: level },
  });
  return {
    caseId: row.id,
    outcome: 'GRANT' as const,
    phase: 'APPROVED_FOR_ISSUANCE' as const,
    computedLevelCode: level,
  };
}

export async function authorizeIssuance(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    caseId: string;
    holderDisplayName: string;
    registryConsent: boolean;
    note: string;
    now: Date;
  },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  await assertAssigned(client, input.tenantId, input.caseId, input.actor.userId);
  await assertConflictCleared(client, input.tenantId, input.caseId, input.actor.userId);
  const row = await loadCase(client, input.tenantId, input.caseId);
  if (row.phase !== 'APPROVED_FOR_ISSUANCE' && row.phase !== 'ISSUED') {
    throw new FlowRuleError('NOT_APPROVED');
  }
  const participants = await decisionParticipants(client, input.tenantId, row);
  assertFourEyes(input.actor.userId, participants);
  const decision = row.examResultId
    ? await client.examCertificationDecision.findFirst({
        where: { tenantId: input.tenantId, resultId: row.examResultId },
      })
    : null;
  if (!decision) {
    throw new FlowRuleError('DECISION_MISSING');
  }
  const existing = await client.issuanceAuthorization.findFirst({
    where: { tenantId: input.tenantId, caseId: row.id },
  });
  if (!existing) {
    await client.issuanceAuthorization.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        caseId: row.id,
        authorisedByUserId: input.actor.userId,
        note: input.note,
        authorisedAt: input.now,
      },
    });
  }
  const issued = await issuePersonnelCertificate(client as unknown as PersonnelClient, {
    tenantId: input.tenantId,
    actor: input.actor,
    decisionId: decision.id,
    holderDisplayName: input.holderDisplayName,
    registryConsent: input.registryConsent,
    now: input.now,
  });
  await client.professionalCase.update({
    where: { tenantId_id: { tenantId: input.tenantId, id: row.id } },
    data: { phase: 'ISSUED' },
  });
  return issued;
}

export async function assistFacts(
  client: FlowClient,
  input: { tenantId: string; actor: Actor; caseId: string },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  await assertAssigned(client, input.tenantId, input.caseId, input.actor.userId);
  await assertConflictCleared(client, input.tenantId, input.caseId, input.actor.userId);
  const row = await loadCase(client, input.tenantId, input.caseId);
  const facts = [
    `faza ${row.phase}`,
    `put ${row.path}`,
    `dokazi ${String(row.evidence.length)}`,
    `reference ${String(row.referees.length)}`,
    `potvrđene ${String(row.referees.filter((referee) => referee.state === 'CONFIRMED').length)}`,
    `nivo ${row.computedLevelCode ?? 'nije izračunat'}`,
  ].join('; ');
  return { facts };
}

export async function persistSuggestion(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    caseId: string;
    purpose: CaseSuggestionPurpose;
    suggestion: string;
    model: string;
    promptHash: string;
  },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  await assertAssigned(client, input.tenantId, input.caseId, input.actor.userId);
  await assertConflictCleared(client, input.tenantId, input.caseId, input.actor.userId);
  const row = await loadCase(client, input.tenantId, input.caseId);
  const id = randomUUID();
  await client.aiCaseSuggestion.create({
    data: {
      id,
      tenantId: input.tenantId,
      caseId: row.id,
      purpose: input.purpose,
      suggestion: input.suggestion,
      model: input.model,
      promptHash: input.promptHash,
    },
  });
  return { suggestionId: id, suggestion: input.suggestion, model: input.model };
}

function flagOpen(reviews: readonly { disposition: string }[]): boolean {
  if (reviews.length === 0) {
    return true;
  }
  const dismissed = reviews.some((review) => review.disposition === 'DISMISSED');
  const confirmed = reviews.some((review) => review.disposition === 'CONFIRMED_FOR_REVIEW');
  return confirmed || !dismissed;
}

export async function maybeIssueEducation(
  client: FlowClient,
  input: { tenantId: string; enrolmentId: string; now: Date },
) {
  const enrolment = await client.enrolment.findFirst({
    where: { tenantId: input.tenantId, id: input.enrolmentId },
    include: {
      educationCompletionDocument: true,
      lessonProgress: true,
      learner: { include: { profile: true } },
      course: { include: { chapters: { include: { lessons: true } } } },
    },
  });
  if (!enrolment || enrolment.educationCompletionDocument) {
    return null;
  }
  const lessons = enrolment.course.chapters.flatMap((chapter) => chapter.lessons);
  if (lessons.length === 0) {
    return null;
  }
  const done = new Set(
    enrolment.lessonProgress
      .filter((progress) => progress.completedAt)
      .map((progress) => progress.lessonId),
  );
  if (!lessons.every((lesson) => done.has(lesson.id))) {
    return null;
  }
  const seconds = enrolment.lessonProgress.reduce(
    (sum, progress) => sum + progress.timeSpentSeconds,
    0,
  );
  const id = randomUUID();
  const year = input.now.getUTCFullYear();
  const count = await client.educationCompletionDocument.count({
    where: { publicUid: { startsWith: `EDU-${String(year)}-` } },
  });
  const publicUid = numbered('EDU', year, count);
  const verificationId = randomVerificationId();
  await client.educationCompletionDocument.create({
    data: {
      id,
      tenantId: input.tenantId,
      enrolmentId: enrolment.id,
      holderUserId: enrolment.userId,
      publicUid,
      verificationId,
      courseTitle: enrolment.course.title,
      participationSeconds: seconds,
      statement: EDUCATION_STATEMENT,
      issuedAt: input.now,
    },
  });
  return {
    documentId: id,
    publicUid,
    verificationId,
    holderName: profileName(enrolment.learner.profile),
  };
}

export async function maybeIssueExamPass(
  client: FlowClient,
  input: { tenantId: string; resultId: string; now: Date },
) {
  const result = await client.certificationExamResult.findFirst({
    where: { tenantId: input.tenantId, id: input.resultId },
    include: {
      examPass: true,
      session: {
        include: {
          proctorFlags: { include: { reviews: true } },
          form: { include: { items: { include: { item: true } } } },
        },
      },
    },
  });
  if (!result || result.examPass) {
    return null;
  }
  const open = result.session.proctorFlags.some((flag) => flagOpen(flag.reviews));
  const disposition = examPassDisposition({
    passed: result.passed,
    itemTypes: result.session.form.items.map((row) => row.item.itemType),
    openIrregularity: open,
  });
  if (disposition === 'NONE') {
    return null;
  }
  const id = randomUUID();
  const year = input.now.getUTCFullYear();
  const count = await client.examPassAttestation.count({
    where: { publicUid: { startsWith: `EXM-${String(year)}-` } },
  });
  const publicUid = numbered('EXM', year, count);
  const verificationId = randomVerificationId();
  const issued = disposition === 'AUTO';
  await client.examPassAttestation.create({
    data: {
      id,
      tenantId: input.tenantId,
      resultId: result.id,
      holderUserId: result.session.candidateUserId,
      publicUid,
      verificationId,
      state: issued ? 'ISSUED' : 'PENDING_REVIEW',
      examTitle: result.session.form.title,
      passed: result.passed,
      autoIssued: issued,
      statement: EXAM_PASS_STATEMENT,
      issuedAt: issued ? input.now : null,
    },
  });
  return {
    attestationId: id,
    publicUid,
    verificationId,
    state: issued ? ('ISSUED' as const) : ('PENDING_REVIEW' as const),
  };
}

export async function releaseExamPass(
  client: FlowClient,
  input: { tenantId: string; actor: Actor; attestationId: string; now: Date },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  const row = await client.examPassAttestation.findFirst({
    where: { tenantId: input.tenantId, id: input.attestationId },
  });
  if (!row) {
    throw new FlowNotFoundError();
  }
  if (row.state === 'ISSUED') {
    return { attestationId: row.id, publicUid: row.publicUid, state: 'ISSUED' as const };
  }
  await client.examPassAttestation.update({
    where: { tenantId_id: { tenantId: input.tenantId, id: row.id } },
    data: { state: 'ISSUED', issuedAt: input.now, reviewedByUserId: input.actor.userId },
  });
  return { attestationId: row.id, publicUid: row.publicUid, state: 'ISSUED' as const };
}

export async function listEducation(client: FlowClient, tenantId: string, userId: string) {
  const rows = await client.educationCompletionDocument.findMany({
    where: { tenantId, holderUserId: userId },
    orderBy: { issuedAt: 'desc' },
  });
  return rows.map((row) => ({
    documentId: row.id,
    number: row.publicUid,
    verificationId: row.verificationId,
    nameConsent: row.nameConsentAt !== null,
    courseTitle: row.courseTitle,
    participationSeconds: row.participationSeconds,
    statement: row.statement,
    issuedAt: row.issuedAt.toISOString(),
    professionalCertificate: false as const,
  }));
}

export async function listExamPasses(client: FlowClient, tenantId: string, userId: string) {
  const rows = await client.examPassAttestation.findMany({
    where: { tenantId, holderUserId: userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((row) => ({
    attestationId: row.id,
    number: row.publicUid,
    verificationId: row.verificationId,
    nameConsent: row.nameConsentAt !== null,
    examTitle: row.examTitle,
    state: row.state,
    passed: row.passed,
    statement: row.statement,
    issuedAt: row.issuedAt?.toISOString() ?? null,
    professionalCertificate: false as const,
  }));
}

function consentedHolderName(
  profile: {
    givenName: string;
    familyName: string;
    identityVerificationState: string;
  } | null,
  nameConsentAt: Date | null,
): string | null {
  if (!nameConsentAt || profile?.identityVerificationState !== 'VERIFIED') {
    return null;
  }
  return profileName(profile);
}

async function logPublicLookup(
  client: FlowClient,
  input: {
    tenantId: string | null;
    verificationKey: string;
    sourceIp: string;
    outcome: 'VALID' | 'INVALID';
    now: Date;
  },
): Promise<void> {
  await client.publicDocumentAccessLog.create({
    data: {
      id: randomUUID(),
      tenantId: input.tenantId,
      verificationKeyHash: createHash('sha256').update(input.verificationKey).digest('hex'),
      sourceIp: input.sourceIp.slice(0, 64) || 'unknown',
      outcome: input.outcome,
      recordedAt: input.now,
    },
  });
}

export async function publicDocument(
  client: FlowClient,
  input: { verificationId: string; sourceIp: string; now: Date },
): Promise<PublicVerificationView> {
  const key = input.verificationId.trim();
  const education = await client.educationCompletionDocument.findFirst({
    where: { verificationId: key },
    include: { holder: { include: { profile: true } } },
  });
  if (education) {
    const view = presentPublicVerification({
      documentType: 'EDUCATION_COMPLETION',
      issuedAt: education.issuedAt,
      nameConsentAt: education.nameConsentAt,
      holderName: consentedHolderName(education.holder.profile, education.nameConsentAt),
    });
    await logPublicLookup(client, {
      tenantId: education.tenantId,
      verificationKey: key,
      sourceIp: input.sourceIp,
      outcome: view.status,
      now: input.now,
    });
    return view;
  }
  const exam = await client.examPassAttestation.findFirst({
    where: { verificationId: key },
    include: { holder: { include: { profile: true } } },
  });
  const issued = exam?.state === 'ISSUED' ? exam : null;
  const view = issued
    ? presentPublicVerification({
        documentType: 'EXAM_PASS',
        issuedAt: issued.issuedAt,
        nameConsentAt: issued.nameConsentAt,
        holderName: consentedHolderName(issued.holder.profile, issued.nameConsentAt),
      })
    : INVALID_PUBLIC_VERIFICATION;
  await logPublicLookup(client, {
    tenantId: exam?.tenantId ?? null,
    verificationKey: key,
    sourceIp: input.sourceIp,
    outcome: view.status,
    now: input.now,
  });
  return view;
}

export async function publicDocumentPdf(
  client: FlowClient,
  input: { verificationId: string; sourceIp: string; now: Date },
) {
  const document = await publicDocument(client, input);
  const { pdf, font } = await openUnicodePdf();
  const title =
    document.documentType === 'EDUCATION_COMPLETION'
      ? 'Potvrda o završetku edukacije'
      : document.documentType === 'EXAM_PASS'
        ? 'Potvrda o ispitu'
        : 'Provjera dokumenta';
  await drawDocumentPage(pdf, font, {
    kicker: 'Javna provjera',
    title,
    statement: PUBLIC_VERIFICATION_STATEMENT,
    lines: publicVerificationPdfLines(document),
    verifyUrl: `${publicAppOrigin()}/verify/${input.verificationId}`,
  });
  return { bytes: await pdf.save(), filename: 'verification.pdf' };
}

export async function setDocumentNameConsent(
  client: FlowClient,
  input: {
    tenantId: string;
    userId: string;
    verificationId: string;
    granted: boolean;
    now: Date;
  },
) {
  const education = await client.educationCompletionDocument.findFirst({
    where: {
      tenantId: input.tenantId,
      verificationId: input.verificationId,
      holderUserId: input.userId,
    },
  });
  if (education) {
    await client.educationCompletionDocument.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: education.id } },
      data: { nameConsentAt: input.granted ? input.now : null },
    });
    return {
      documentId: education.id,
      recordNumber: education.publicUid,
      documentType: 'EDUCATION_COMPLETION' as const,
      granted: input.granted,
      documentRemainsValid: true as const,
    };
  }
  const exam = await client.examPassAttestation.findFirst({
    where: {
      tenantId: input.tenantId,
      verificationId: input.verificationId,
      holderUserId: input.userId,
    },
  });
  if (!exam) {
    throw new FlowNotFoundError();
  }
  await client.examPassAttestation.update({
    where: { tenantId_id: { tenantId: input.tenantId, id: exam.id } },
    data: { nameConsentAt: input.granted ? input.now : null },
  });
  return {
    documentId: exam.id,
    recordNumber: exam.publicUid,
    documentType: 'EXAM_PASS' as const,
    granted: input.granted,
    documentRemainsValid: exam.state === 'ISSUED',
  };
}
