import { createHash, randomBytes, randomUUID } from 'node:crypto';

import type { Prisma } from '@confora/database';

import type { CaseSuggestionPurpose } from '../certification-flow/case-suggestions';
import { decideConflictDeclaration } from '../certification-flow/conflict-declaration-policy';
import {
  assertFourEyes,
  assertRole,
  computeEligibleLevel,
  EDUCATION_STATEMENT,
  examEligibility,
  examPassDisposition,
  exclusionReason,
  EXAM_PASS_STATEMENT,
  levelChosenByCommittee,
  REFEREE_LINK_DAYS,
  requirementsSatisfiedByReferee,
  voteResult,
  FlowRuleError,
  type JourneyPath,
} from '../certification-flow/certification-flow-rules';
import { drawDocumentPage, openUnicodePdf } from '../personnel/document-pdf';
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
  | 'enrolment'
  | 'enrolmentTrainer'
  | 'certificationSchemeVersion'
  | 'certificationExamResult'
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

function appOrigin(): string {
  return process.env['PUBLIC_APP_ORIGIN'] ?? 'http://127.0.0.1:3001';
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
  const subjectUserId = input.subjectUserId ?? input.actor.userId;
  const latest = await latestConflictDeclaration(
    client,
    input.tenantId,
    input.caseId,
    subjectUserId,
  );
  const decision = decideConflictDeclaration({
    actorUserId: input.actor.userId,
    subjectUserId,
    hasConflict: input.hasConflict,
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
  const link = `${appOrigin()}/referee/${token}`;
  await client.messageOutbox.create({
    data: {
      id: randomUUID(),
      tenantId: input.tenantId,
      toAddress: input.email,
      subject: 'Potvrda iskustva',
      body: `Sigurna veza ističe ${expiresAt.toISOString()}. ${link}`,
      status: 'LOGGED',
    },
  });
  if (process.env['NODE_ENV'] !== 'test') {
    console.info(`referee-outbox ${input.email} ${link}`);
  }
  return {
    refereeId: id,
    expiresAt: expiresAt.toISOString(),
    token,
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
  const row = await client.refereeConfirmation.findFirst({
    where: { tokenHash: hashToken(input.token) },
  });
  if (!row) {
    throw new FlowNotFoundError();
  }
  if (row.expiresAt.getTime() < input.now.getTime()) {
    await client.refereeConfirmation.update({
      where: { tenantId_id: { tenantId: row.tenantId, id: row.id } },
      data: { state: 'EXPIRED' },
    });
    throw new FlowRuleError('LINK_EXPIRED');
  }
  if (row.state !== 'PENDING') {
    throw new FlowRuleError('LINK_USED');
  }
  await client.refereeConfirmation.update({
    where: { tenantId_id: { tenantId: row.tenantId, id: row.id } },
    data: {
      state: input.accept ? 'CONFIRMED' : 'DECLINED',
      confirmedFacts: input.confirmedFacts ?? null,
      discrepancies: input.discrepancies ?? null,
      confirmedAt: input.now,
    },
  });
  return {
    refereeId: row.id,
    state: input.accept ? ('CONFIRMED' as const) : ('DECLINED' as const),
    requirementsSatisfied: requirementsSatisfiedByReferee(),
  };
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

export async function proposeCommittee(
  client: FlowClient,
  input: {
    tenantId: string;
    actor: Actor;
    caseId: string;
    declaredConflictUserIds: readonly string[];
    now: Date;
  },
) {
  assertRole(input.actor.roles, 'COM_CERT');
  await assertConflictCleared(client, input.tenantId, input.caseId, input.actor.userId);
  const row = await loadCase(client, input.tenantId, input.caseId);
  if (row.phase !== 'COMMITTEE' && row.phase !== 'APPROVED_FOR_ISSUANCE') {
    throw new FlowRuleError('NOT_IN_COMMITTEE');
  }
  const makers = await client.schemeDecisionMaker.findMany({
    where: { tenantId: input.tenantId, schemeVersionId: row.schemeVersionId },
  });
  const trainers = await client.enrolmentTrainer.findMany({
    where: { tenantId: input.tenantId, enrolment: { userId: row.applicantUserId } },
  });
  const examinerIds: string[] = [];
  if (row.examResultId) {
    const result = await client.certificationExamResult.findFirst({
      where: { tenantId: input.tenantId, id: row.examResultId },
      include: { session: true },
    });
    if (result) {
      examinerIds.push(result.session.invigilatorUserId);
    }
  }
  await client.committeeProposal.deleteMany({
    where: { tenantId: input.tenantId, caseId: row.id },
  });
  const slots = [];
  for (const maker of makers) {
    const authorised =
      maker.authorisedFrom.getTime() <= input.now.getTime() &&
      maker.authorisedUntil.getTime() >= input.now.getTime();
    const reason = exclusionReason({
      userId: maker.userId,
      candidateUserId: row.applicantUserId,
      trainerUserIds: trainers.map((trainer) => trainer.trainerUserId),
      examinerUserIds: examinerIds,
      conflictUserIds: input.declaredConflictUserIds,
      authorised,
    });
    const id = randomUUID();
    await client.committeeProposal.create({
      data: {
        id,
        tenantId: input.tenantId,
        caseId: row.id,
        userId: maker.userId,
        state: reason ? 'EXCLUDED' : 'PROPOSED',
        exclusionReason: reason,
      },
    });
    slots.push({
      userId: maker.userId,
      state: reason ? 'EXCLUDED' : 'PROPOSED',
      exclusionReason: reason,
    });
  }
  return { caseId: row.id, slots };
}

export async function confirmProposal(
  client: FlowClient,
  input: { tenantId: string; actor: Actor; caseId: string; memberUserId: string },
) {
  assertRole(input.actor.roles, 'COM_CERT');
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
  await assertConflictCleared(client, input.tenantId, input.caseId, input.actor.userId);
  const row = await loadCase(client, input.tenantId, input.caseId);
  const slot = row.proposals.find((proposal) => proposal.userId === input.actor.userId);
  if (!slot || slot.state !== 'CONFIRMED') {
    throw new FlowRuleError('NOT_MEMBER');
  }
  const existing = row.assessments.find(
    (assessment) => assessment.memberUserId === input.actor.userId,
  );
  if (existing) {
    throw new FlowRuleError('ALREADY_VOTED');
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
  const ballots = [...row.assessments.map((assessment) => assessment.ballot), input.ballot];
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
  await client.educationCompletionDocument.create({
    data: {
      id,
      tenantId: input.tenantId,
      enrolmentId: enrolment.id,
      holderUserId: enrolment.userId,
      publicUid,
      courseTitle: enrolment.course.title,
      participationSeconds: seconds,
      statement: EDUCATION_STATEMENT,
      issuedAt: input.now,
    },
  });
  return {
    documentId: id,
    publicUid,
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
  const issued = disposition === 'AUTO';
  await client.examPassAttestation.create({
    data: {
      id,
      tenantId: input.tenantId,
      resultId: result.id,
      holderUserId: result.session.candidateUserId,
      publicUid,
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
    examTitle: row.examTitle,
    state: row.state,
    passed: row.passed,
    statement: row.statement,
    issuedAt: row.issuedAt?.toISOString() ?? null,
    professionalCertificate: false as const,
  }));
}

export async function publicDocument(client: FlowClient, publicUid: string) {
  const education = await client.educationCompletionDocument.findFirst({
    where: { publicUid },
    include: { holder: { include: { profile: true } } },
  });
  if (education) {
    return {
      kind: 'EDUCATION' as const,
      number: education.publicUid,
      holderName: profileName(education.holder.profile),
      title: education.courseTitle,
      issuedAt: education.issuedAt.toISOString(),
      statement: education.statement,
      participationSeconds: education.participationSeconds,
      professionalCertificate: false as const,
    };
  }
  const exam = await client.examPassAttestation.findFirst({
    where: { publicUid, state: 'ISSUED' },
    include: { holder: { include: { profile: true } } },
  });
  if (!exam || !exam.issuedAt) {
    throw new FlowNotFoundError();
  }
  return {
    kind: 'EXAM_PASS' as const,
    number: exam.publicUid,
    holderName: profileName(exam.holder.profile),
    title: exam.examTitle,
    issuedAt: exam.issuedAt.toISOString(),
    statement: exam.statement,
    passed: exam.passed,
    professionalCertificate: false as const,
  };
}

export async function publicDocumentPdf(client: FlowClient, publicUid: string) {
  const document = await publicDocument(client, publicUid);
  const { pdf, font } = await openUnicodePdf();
  const lines =
    document.kind === 'EDUCATION'
      ? [
          `Kurs: ${document.title}`,
          `Broj: ${document.number}`,
          `Izdato: ${document.issuedAt.slice(0, 10)}`,
          `Učešće (sekunde): ${String(document.participationSeconds)}`,
        ]
      : [
          `Ispit: ${document.title}`,
          `Broj: ${document.number}`,
          `Rezultat: ${document.passed ? 'položio' : 'nije položio'}`,
          `Datum: ${document.issuedAt.slice(0, 10)}`,
        ];
  await drawDocumentPage(pdf, font, {
    kicker: document.kind === 'EDUCATION' ? 'ISO 21001' : 'Rezultat ispita',
    title:
      document.kind === 'EDUCATION'
        ? 'Potvrda o završetku edukacije'
        : 'Potvrda o rezultatu ispita',
    statement: document.statement,
    lines,
    verifyUrl: `${appOrigin()}/verify/${document.number}`,
  });
  return { bytes: await pdf.save(), filename: `${document.number}.pdf` };
}
