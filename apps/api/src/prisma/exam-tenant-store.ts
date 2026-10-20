import { randomUUID } from 'node:crypto';
import type { Prisma } from '@confora/database';

import {
  angoffCutScoreBasisPoints,
  assertApplicationEligible,
  assertBlueprintDomains,
  assertCertificationDecision,
  assertChoiceSet,
  assertItemTransition,
  assertRetakeWindow,
  assertRetakeWindowDays,
  assertStaffAction,
  assertStartAcknowledgements,
  assertWithinWindow,
  domainFeedbackForCandidate,
  EXAM_MFA_REFERENCE,
  ExamRuleError,
  formReviewFlag,
  hashSeed,
  itemIsCorrect,
  itemReviewFlag,
  kr20,
  pointBiserial,
  pValue,
  remainingSeconds,
  scoreBasisPoints,
  selectItemsForBlueprint,
  sessionExpiry,
  shuffleStable,
  toCandidateItem,
  type BlueprintDomainInput,
  type CandidateItemView,
  type DomainTally,
  type ItemChoiceInput,
  type SchemeItemStatus,
  type SchemeItemType,
  type StaffAction,
} from '../exam/exam-rules';
import { XAPI_VERB } from '../learning/learning-rules';

export class ExamNotFoundError extends Error {
  constructor() {
    super('EXAM_NOT_FOUND');
    this.name = 'ExamNotFoundError';
  }
}

type Tx = Prisma.TransactionClient;

export type ExamClient = {
  $transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
} & Pick<
  Tx,
  | 'schemeExamItem'
  | 'schemeExamItemChoice'
  | 'schemeExamItemCompetence'
  | 'schemeExamItemTransition'
  | 'certificationScheme'
  | 'certificationSchemeVersion'
  | 'examBlueprint'
  | 'examBlueprintDomain'
  | 'standardSettingRecord'
  | 'standardSettingRating'
  | 'assembledExamForm'
  | 'assembledExamFormItem'
  | 'certificationExamSession'
  | 'certificationExamAnswer'
  | 'certificationExamResult'
  | 'examCertificationDecision'
  | 'examProctorFlag'
  | 'examProctorFlagReview'
  | 'examItemStatistic'
  | 'examFormReliability'
  | 'certificationApplication'
  | 'user'
  | 'userAccessibilityNeed'
  | 'enrolmentTrainer'
  | 'learnerAnalyticsConsent'
  | 'learningActivityRecord'
  | 'competence'
>;

type Actor = { userId: string; roles: readonly string[] };

function assertAction(actor: Actor, action: StaffAction): void {
  assertStaffAction(actor.roles, action);
}

async function requireItem(tx: Tx, tenantId: string, itemId: string) {
  const item = await tx.schemeExamItem.findFirst({
    where: { tenantId, id: itemId },
    include: { choices: true, competences: true },
  });
  if (!item) {
    throw new ExamNotFoundError();
  }
  return item;
}

export async function createSchemeItem(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    schemeId: string;
    stem: string;
    itemType: SchemeItemType;
    domainCode: string;
    choices: readonly ItemChoiceInput[];
    competenceIds: readonly string[];
    now: Date;
  },
) {
  assertAction(input.actor, 'ITEM_WRITE');
  assertChoiceSet(input.itemType, input.choices);
  return client.$transaction(async (tx) => {
    const scheme = await tx.certificationScheme.findFirst({
      where: { tenantId: input.tenantId, id: input.schemeId },
    });
    if (!scheme) {
      throw new ExamNotFoundError();
    }
    if (input.competenceIds.length > 0) {
      const found = await tx.competence.count({
        where: { tenantId: input.tenantId, id: { in: [...input.competenceIds] } },
      });
      if (found !== input.competenceIds.length) {
        throw new ExamRuleError('COMPETENCE_NOT_FOUND');
      }
    }
    const id = randomUUID();
    await tx.schemeExamItem.create({
      data: {
        id,
        tenantId: input.tenantId,
        schemeId: input.schemeId,
        familyKey: randomUUID(),
        version: 1,
        stem: input.stem,
        itemType: input.itemType,
        status: 'DRAFT',
        authorUserId: input.actor.userId,
        domainCode: input.domainCode,
        exposureCount: 0,
      },
    });
    await tx.schemeExamItemChoice.createMany({
      data: input.choices.map((choice) => ({
        id: randomUUID(),
        tenantId: input.tenantId,
        itemId: id,
        choiceKey: choice.choiceKey,
        text: choice.text,
        isCorrect: choice.isCorrect,
      })),
    });
    if (input.competenceIds.length > 0) {
      await tx.schemeExamItemCompetence.createMany({
        data: input.competenceIds.map((competenceId) => ({
          id: randomUUID(),
          tenantId: input.tenantId,
          itemId: id,
          competenceId,
        })),
      });
    }
    return { itemId: id, status: 'DRAFT' as const, version: 1 };
  });
}

export async function updateDraftItem(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    itemId: string;
    stem: string;
    choices: readonly ItemChoiceInput[];
  },
) {
  assertAction(input.actor, 'ITEM_WRITE');
  return client.$transaction(async (tx) => {
    const item = await requireItem(tx, input.tenantId, input.itemId);
    if (item.status !== 'DRAFT' || item.authorUserId !== input.actor.userId) {
      throw new ExamRuleError('DRAFT_LOCKED');
    }
    assertChoiceSet(item.itemType, input.choices);
    await tx.schemeExamItemChoice.deleteMany({
      where: { tenantId: input.tenantId, itemId: item.id },
    });
    await tx.schemeExamItem.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: item.id } },
      data: { stem: input.stem },
    });
    await tx.schemeExamItemChoice.createMany({
      data: input.choices.map((choice) => ({
        id: randomUUID(),
        tenantId: input.tenantId,
        itemId: item.id,
        choiceKey: choice.choiceKey,
        text: choice.text,
        isCorrect: choice.isCorrect,
      })),
    });
    return { itemId: item.id, status: item.status };
  });
}

export async function createItemVersion(
  client: ExamClient,
  input: { tenantId: string; actor: Actor; itemId: string },
) {
  assertAction(input.actor, 'ITEM_WRITE');
  return client.$transaction(async (tx) => {
    const item = await requireItem(tx, input.tenantId, input.itemId);
    if (item.status !== 'APPROVED' && item.status !== 'RETIRED') {
      throw new ExamRuleError('VERSION_SOURCE');
    }
    const latest = await tx.schemeExamItem.findFirst({
      where: { tenantId: input.tenantId, familyKey: item.familyKey },
      orderBy: { version: 'desc' },
    });
    const version = (latest?.version ?? item.version) + 1;
    const id = randomUUID();
    await tx.schemeExamItem.create({
      data: {
        id,
        tenantId: input.tenantId,
        schemeId: item.schemeId,
        familyKey: item.familyKey,
        version,
        stem: item.stem,
        itemType: item.itemType,
        status: 'DRAFT',
        authorUserId: input.actor.userId,
        domainCode: item.domainCode,
        exposureCount: 0,
      },
    });
    await tx.schemeExamItemChoice.createMany({
      data: item.choices.map((choice) => ({
        id: randomUUID(),
        tenantId: input.tenantId,
        itemId: id,
        choiceKey: choice.choiceKey,
        text: choice.text,
        isCorrect: choice.isCorrect,
      })),
    });
    if (item.competences.length > 0) {
      await tx.schemeExamItemCompetence.createMany({
        data: item.competences.map((link) => ({
          id: randomUUID(),
          tenantId: input.tenantId,
          itemId: id,
          competenceId: link.competenceId,
        })),
      });
    }
    return { itemId: id, version, familyKey: item.familyKey, status: 'DRAFT' as const };
  });
}

export async function transitionItem(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    itemId: string;
    toStatus: SchemeItemStatus;
    note?: string;
    now: Date;
  },
) {
  return client.$transaction(async (tx) => {
    const item = await requireItem(tx, input.tenantId, input.itemId);
    assertItemTransition({
      from: item.status,
      to: input.toStatus,
      actorUserId: input.actor.userId,
      authorUserId: item.authorUserId,
      roles: input.actor.roles,
    });
    await tx.schemeExamItem.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: item.id } },
      data: { status: input.toStatus },
    });
    await tx.schemeExamItemTransition.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        itemId: item.id,
        actorUserId: input.actor.userId,
        fromStatus: item.status,
        toStatus: input.toStatus,
        note: input.note ?? null,
        actedAt: input.now,
      },
    });
    return { itemId: item.id, fromStatus: item.status, toStatus: input.toStatus };
  });
}

export async function listSchemeItems(
  client: ExamClient,
  tenantId: string,
  actor: Actor,
  schemeId?: string,
) {
  assertAction(actor, 'ITEM_WRITE');
  const items = await client.schemeExamItem.findMany({
    where: { tenantId, ...(schemeId ? { schemeId } : {}) },
    include: { choices: true, competences: true },
    orderBy: [{ domainCode: 'asc' }, { familyKey: 'asc' }, { version: 'desc' }],
  });
  return items.map((item) => ({
    id: item.id,
    schemeId: item.schemeId,
    familyKey: item.familyKey,
    version: item.version,
    stem: item.stem,
    itemType: item.itemType,
    status: item.status,
    authorUserId: item.authorUserId,
    domainCode: item.domainCode,
    exposureCount: item.exposureCount,
    competenceIds: item.competences.map((link) => link.competenceId),
    choices: item.choices.map((choice) => ({
      choiceKey: choice.choiceKey,
      text: choice.text,
      isCorrect: choice.isCorrect,
    })),
  }));
}

export async function createBlueprint(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    schemeVersionId: string;
    title: string;
    durationSeconds: number;
    retakeWindowDays: number;
  },
) {
  assertAction(input.actor, 'BLUEPRINT_WRITE');
  assertRetakeWindowDays(input.retakeWindowDays);
  if (!Number.isInteger(input.durationSeconds) || input.durationSeconds < 60) {
    throw new ExamRuleError('DURATION');
  }
  return client.$transaction(async (tx) => {
    const version = await tx.certificationSchemeVersion.findFirst({
      where: { tenantId: input.tenantId, id: input.schemeVersionId },
    });
    if (!version) {
      throw new ExamNotFoundError();
    }
    const id = randomUUID();
    await tx.examBlueprint.create({
      data: {
        id,
        tenantId: input.tenantId,
        schemeVersionId: input.schemeVersionId,
        title: input.title,
        durationSeconds: input.durationSeconds,
        retakeWindowDays: input.retakeWindowDays,
        status: 'DRAFT',
      },
    });
    return { blueprintId: id, status: 'DRAFT' as const };
  });
}

export async function replaceBlueprintDomains(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    blueprintId: string;
    domains: readonly BlueprintDomainInput[];
  },
) {
  assertAction(input.actor, 'BLUEPRINT_WRITE');
  assertBlueprintDomains(input.domains);
  return client.$transaction(async (tx) => {
    const blueprint = await tx.examBlueprint.findFirst({
      where: { tenantId: input.tenantId, id: input.blueprintId },
    });
    if (!blueprint || blueprint.status !== 'DRAFT') {
      throw new ExamRuleError('BLUEPRINT_LOCKED');
    }
    await tx.examBlueprintDomain.deleteMany({
      where: { tenantId: input.tenantId, blueprintId: blueprint.id },
    });
    await tx.examBlueprintDomain.createMany({
      data: input.domains.map((domain) => ({
        id: randomUUID(),
        tenantId: input.tenantId,
        blueprintId: blueprint.id,
        domainCode: domain.domainCode,
        title: domain.title,
        weightBasisPoints: domain.weightBasisPoints,
        itemCount: domain.itemCount,
      })),
    });
    return { blueprintId: blueprint.id, domainCount: input.domains.length };
  });
}

export async function openStandardSetting(
  client: ExamClient,
  input: { tenantId: string; actor: Actor; blueprintId: string; note?: string },
) {
  assertAction(input.actor, 'BLUEPRINT_WRITE');
  return client.$transaction(async (tx) => {
    const blueprint = await tx.examBlueprint.findFirst({
      where: { tenantId: input.tenantId, id: input.blueprintId },
    });
    if (!blueprint || blueprint.status !== 'DRAFT') {
      throw new ExamRuleError('BLUEPRINT_LOCKED');
    }
    const id = randomUUID();
    await tx.standardSettingRecord.create({
      data: {
        id,
        tenantId: input.tenantId,
        blueprintId: blueprint.id,
        method: 'ANGOFF',
        status: 'DRAFT',
        note: input.note ?? null,
      },
    });
    return { recordId: id, method: 'ANGOFF' as const };
  });
}

export async function addStandardSettingRatings(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    recordId: string;
    ratings: readonly { itemId: string; probabilityBasisPoints: number }[];
  },
) {
  assertAction(input.actor, 'BLUEPRINT_WRITE');
  return client.$transaction(async (tx) => {
    const record = await tx.standardSettingRecord.findFirst({
      where: { tenantId: input.tenantId, id: input.recordId },
    });
    if (!record || record.status !== 'DRAFT') {
      throw new ExamRuleError('STANDARD_SETTING_LOCKED');
    }
    for (const rating of input.ratings) {
      const item = await tx.schemeExamItem.findFirst({
        where: { tenantId: input.tenantId, id: rating.itemId, status: 'APPROVED' },
      });
      if (!item) {
        throw new ExamRuleError('ITEM_NOT_APPROVED');
      }
      await tx.standardSettingRating.upsert({
        where: {
          tenantId_recordId_panelistUserId_itemId: {
            tenantId: input.tenantId,
            recordId: record.id,
            panelistUserId: input.actor.userId,
            itemId: rating.itemId,
          },
        },
        create: {
          id: randomUUID(),
          tenantId: input.tenantId,
          recordId: record.id,
          panelistUserId: input.actor.userId,
          itemId: rating.itemId,
          probabilityBasisPoints: rating.probabilityBasisPoints,
        },
        update: { probabilityBasisPoints: rating.probabilityBasisPoints },
      });
    }
    return { recordId: record.id, stored: input.ratings.length };
  });
}

export async function approveStandardSetting(
  client: ExamClient,
  input: { tenantId: string; actor: Actor; recordId: string; now: Date },
) {
  assertAction(input.actor, 'BLUEPRINT_APPROVE');
  return client.$transaction(async (tx) => {
    const record = await tx.standardSettingRecord.findFirst({
      where: { tenantId: input.tenantId, id: input.recordId },
      include: { ratings: true, blueprint: { include: { domains: true } } },
    });
    if (!record || record.status !== 'DRAFT' || record.blueprint.status !== 'DRAFT') {
      throw new ExamRuleError('STANDARD_SETTING_LOCKED');
    }
    const domainCodes = new Set(record.blueprint.domains.map((domain) => domain.domainCode));
    const ratedItems = await tx.schemeExamItem.findMany({
      where: {
        tenantId: input.tenantId,
        id: { in: record.ratings.map((rating) => rating.itemId) },
      },
    });
    const covered = new Set(
      ratedItems.filter((item) => domainCodes.has(item.domainCode)).map((item) => item.domainCode),
    );
    if (covered.size !== domainCodes.size || domainCodes.size === 0) {
      throw new ExamRuleError('DOMAINS_NOT_RATED');
    }
    const cutScoreBasisPoints = angoffCutScoreBasisPoints(
      record.ratings.map((rating) => ({
        itemId: rating.itemId,
        panelistUserId: rating.panelistUserId,
        probabilityBasisPoints: rating.probabilityBasisPoints,
      })),
    );
    await tx.standardSettingRecord.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: record.id } },
      data: {
        status: 'APPROVED',
        cutScoreBasisPoints,
        approvedByUserId: input.actor.userId,
        approvedAt: input.now,
      },
    });
    await tx.examBlueprint.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: record.blueprintId } },
      data: { cutScoreBasisPoints },
    });
    return { recordId: record.id, blueprintId: record.blueprintId, cutScoreBasisPoints };
  });
}

export async function approveBlueprint(
  client: ExamClient,
  input: { tenantId: string; actor: Actor; blueprintId: string },
) {
  assertAction(input.actor, 'BLUEPRINT_APPROVE');
  return client.$transaction(async (tx) => {
    const blueprint = await tx.examBlueprint.findFirst({
      where: { tenantId: input.tenantId, id: input.blueprintId },
      include: { domains: true },
    });
    if (!blueprint || blueprint.status !== 'DRAFT') {
      throw new ExamRuleError('BLUEPRINT_LOCKED');
    }
    assertBlueprintDomains(
      blueprint.domains.map((domain) => ({
        domainCode: domain.domainCode,
        title: domain.title,
        weightBasisPoints: domain.weightBasisPoints,
        itemCount: domain.itemCount,
      })),
    );
    if (blueprint.cutScoreBasisPoints === null) {
      throw new ExamRuleError('CUT_SCORE_REQUIRED');
    }
    await tx.examBlueprint.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: blueprint.id } },
      data: { status: 'APPROVED' },
    });
    return { blueprintId: blueprint.id, status: 'APPROVED' as const };
  });
}

export async function assembleForm(
  client: ExamClient,
  input: { tenantId: string; actor: Actor; blueprintId: string; now: Date },
) {
  assertAction(input.actor, 'ASSEMBLE');
  return client.$transaction(async (tx) => {
    const blueprint = await tx.examBlueprint.findFirst({
      where: { tenantId: input.tenantId, id: input.blueprintId },
      include: { domains: true, schemeVersion: true },
    });
    if (!blueprint || blueprint.status !== 'APPROVED' || blueprint.cutScoreBasisPoints === null) {
      throw new ExamRuleError('BLUEPRINT_NOT_APPROVED');
    }
    const bank = await tx.schemeExamItem.findMany({
      where: { tenantId: input.tenantId, schemeId: blueprint.schemeVersion.schemeId },
    });
    const picked = selectItemsForBlueprint(
      blueprint.domains.map((domain) => ({
        domainCode: domain.domainCode,
        title: domain.title,
        weightBasisPoints: domain.weightBasisPoints,
        itemCount: domain.itemCount,
      })),
      bank.map((item) => ({
        id: item.id,
        domainCode: item.domainCode,
        exposureCount: item.exposureCount,
        status: item.status,
      })),
    );
    const formId = randomUUID();
    await tx.assembledExamForm.create({
      data: {
        id: formId,
        tenantId: input.tenantId,
        blueprintId: blueprint.id,
        title: blueprint.title,
        shuffleItems: true,
        shuffleChoices: true,
        assembledByUserId: input.actor.userId,
        assembledAt: input.now,
      },
    });
    await tx.assembledExamFormItem.createMany({
      data: picked.map((item) => ({
        id: randomUUID(),
        tenantId: input.tenantId,
        formId,
        itemId: item.itemId,
        domainCode: item.domainCode,
        sequence: item.sequence,
      })),
    });
    return { formId, itemCount: picked.length, blueprintId: blueprint.id };
  });
}

export async function scheduleSession(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    formId: string;
    candidateUserId: string;
    certificationApplicationId: string;
    invigilatorUserId: string;
    scheduledStartAt: Date;
    now: Date;
  },
) {
  assertAction(input.actor, 'SESSION_SCHEDULE');
  return client.$transaction(async (tx) => {
    const form = await tx.assembledExamForm.findFirst({
      where: { tenantId: input.tenantId, id: input.formId },
      include: { blueprint: { include: { schemeVersion: { include: { scheme: true } } } } },
    });
    if (!form) {
      throw new ExamNotFoundError();
    }
    const application = await tx.certificationApplication.findFirst({
      where: { tenantId: input.tenantId, id: input.certificationApplicationId },
    });
    if (!application) {
      throw new ExamRuleError('APPLICATION_REQUIRED');
    }
    assertApplicationEligible(
      application,
      input.candidateUserId,
      form.blueprint.schemeVersion.scheme.code,
    );
    const invigilator = await tx.user.findFirst({
      where: { tenantId: input.tenantId, id: input.invigilatorUserId, isActive: true },
    });
    if (!invigilator || invigilator.id === input.candidateUserId) {
      throw new ExamRuleError('INVIGILATOR_REQUIRED');
    }
    await assertNoOpenRetake(tx, input.tenantId, input.candidateUserId, form.blueprint, input.now);
    const id = randomUUID();
    await tx.certificationExamSession.create({
      data: {
        id,
        tenantId: input.tenantId,
        formId: form.id,
        candidateUserId: input.candidateUserId,
        certificationApplicationId: application.id,
        scheduledStartAt: input.scheduledStartAt,
        invigilatorUserId: input.invigilatorUserId,
        status: 'SCHEDULED',
        identityCaptureState: 'NOT_COLLECTED_DPIA_PENDING',
      },
    });
    return {
      sessionId: id,
      status: 'SCHEDULED' as const,
      identityCaptureState: 'NOT_COLLECTED_DPIA_PENDING' as const,
      accreditationReady: false,
    };
  });
}

async function assertNoOpenRetake(
  tx: Tx,
  tenantId: string,
  candidateUserId: string,
  blueprint: { id: string; retakeWindowDays: number },
  now: Date,
): Promise<void> {
  const previous = await tx.certificationExamSession.findFirst({
    where: {
      tenantId,
      candidateUserId,
      status: 'SCORED',
      form: { blueprintId: blueprint.id },
    },
    orderBy: { submittedAt: 'desc' },
  });
  assertRetakeWindow(previous?.submittedAt ?? null, blueprint.retakeWindowDays, now);
}

export async function listCandidateSessions(client: ExamClient, tenantId: string, userId: string) {
  const sessions = await client.certificationExamSession.findMany({
    where: { tenantId, candidateUserId: userId },
    include: { form: { include: { blueprint: true } }, result: { include: { decision: true } } },
    orderBy: { scheduledStartAt: 'asc' },
  });
  return sessions.map((session) => ({
    sessionId: session.id,
    title: session.form.blueprint.title,
    status: session.status,
    scheduledStartAt: session.scheduledStartAt.toISOString(),
    provisional: session.result?.provisional ?? null,
    passed: session.result?.passed ?? null,
    decided: Boolean(session.result?.decision),
  }));
}

export async function startCandidateSession(
  client: ExamClient,
  input: {
    tenantId: string;
    userId: string;
    sessionId: string;
    rulesAccepted: boolean;
    ndaAccepted: boolean;
    mfaVerified: boolean;
    now: Date;
  },
) {
  assertStartAcknowledgements(input);
  return client.$transaction(async (tx) => {
    const session = await loadOwnSession(tx, input.tenantId, input.userId, input.sessionId);
    if (session.status !== 'SCHEDULED') {
      throw new ExamRuleError('SESSION_NOT_SCHEDULED');
    }
    const needs = await tx.userAccessibilityNeed.findMany({
      where: { tenantId: input.tenantId, userId: input.userId },
    });
    const extraTimePercent = needs.reduce(
      (max, need) => Math.max(max, need.extraTimePercent ?? 0),
      0,
    );
    const expiresAt = sessionExpiry(
      input.now,
      session.form.blueprint.durationSeconds,
      extraTimePercent,
    );
    await tx.certificationExamSession.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: session.id } },
      data: {
        status: 'IN_PROGRESS',
        rulesAcceptedAt: input.now,
        ndaAcceptedAt: input.now,
        mfaReference: EXAM_MFA_REFERENCE,
        extraTimePercent,
        startedAt: input.now,
        expiresAt,
      },
    });
    return { sessionId: session.id, expiresAt: expiresAt.toISOString(), extraTimePercent };
  });
}

async function loadOwnSession(tx: Tx, tenantId: string, userId: string, sessionId: string) {
  const session = await tx.certificationExamSession.findFirst({
    where: { tenantId, id: sessionId, candidateUserId: userId },
    include: {
      answers: true,
      form: {
        include: {
          blueprint: true,
          items: {
            include: { item: { include: { choices: true } } },
            orderBy: { sequence: 'asc' },
          },
        },
      },
      result: true,
    },
  });
  if (!session) {
    throw new ExamNotFoundError();
  }
  return session;
}

function presentItems(session: {
  id: string;
  form: {
    shuffleItems: boolean;
    shuffleChoices: boolean;
    items: {
      item: {
        id: string;
        domainCode: string;
        stem: string;
        itemType: SchemeItemType;
        choices: { choiceKey: string; text: string; isCorrect: boolean }[];
      };
    }[];
  };
}): CandidateItemView[] {
  const seed = hashSeed(session.id);
  const items = session.form.items.map((row) =>
    toCandidateItem({
      id: row.item.id,
      domainCode: row.item.domainCode,
      stem: row.item.stem,
      itemType: row.item.itemType,
      choices: session.form.shuffleChoices
        ? shuffleStable(row.item.choices, hashSeed(`${session.id}:${row.item.id}`))
        : row.item.choices,
    }),
  );
  return session.form.shuffleItems ? shuffleStable(items, seed) : items;
}

export async function getCandidateSession(
  client: ExamClient,
  input: { tenantId: string; userId: string; sessionId: string; now: Date },
) {
  const closed = await closeIfExpired(client, input);
  if (closed) {
    return {
      sessionId: input.sessionId,
      status: 'SCORED' as const,
      remainingSeconds: 0,
      items: [] as CandidateItemView[],
      scored: closed,
    };
  }
  return client.$transaction(async (tx) => {
    const session = await loadOwnSession(tx, input.tenantId, input.userId, input.sessionId);
    const base = {
      sessionId: session.id,
      status: session.status,
      remainingSeconds:
        session.expiresAt && session.status === 'IN_PROGRESS'
          ? remainingSeconds(session.expiresAt, input.now)
          : 0,
      identityCaptureState: 'NOT_COLLECTED_DPIA_PENDING' as const,
    };
    if (session.status !== 'IN_PROGRESS') {
      return { ...base, items: [] as CandidateItemView[], scored: null };
    }
    const saved = new Map(session.answers.map((answer) => [answer.itemId, answer.selectedKeys]));
    return {
      ...base,
      scored: null,
      items: presentItems(session).map((item) => ({
        ...item,
        selectedKeys: saved.get(item.id) ?? [],
      })),
    };
  });
}

export async function saveCandidateAnswers(
  client: ExamClient,
  input: {
    tenantId: string;
    userId: string;
    sessionId: string;
    answers: readonly { itemId: string; selectedKeys: readonly string[] }[];
    now: Date;
  },
) {
  const closed = await closeIfExpired(client, input);
  if (closed) {
    return { sessionId: input.sessionId, saved: 0, scored: closed };
  }
  return client.$transaction(async (tx) => {
    const session = await loadOwnSession(tx, input.tenantId, input.userId, input.sessionId);
    if (session.status !== 'IN_PROGRESS' || !session.expiresAt) {
      throw new ExamRuleError('SESSION_NOT_OPEN');
    }
    assertWithinWindow(session.expiresAt, input.now);
    const allowed = new Map(
      session.form.items.map((row) => [
        row.item.id,
        new Set(row.item.choices.map((choice) => choice.choiceKey)),
      ]),
    );
    for (const answer of input.answers) {
      const keys = allowed.get(answer.itemId);
      if (!keys || answer.selectedKeys.some((key) => !keys.has(key))) {
        throw new ExamRuleError('ANSWER_NOT_ON_FORM');
      }
      if (answer.selectedKeys.length === 0) {
        await tx.certificationExamAnswer.deleteMany({
          where: { tenantId: input.tenantId, sessionId: session.id, itemId: answer.itemId },
        });
        continue;
      }
      await tx.certificationExamAnswer.upsert({
        where: {
          tenantId_sessionId_itemId: {
            tenantId: input.tenantId,
            sessionId: session.id,
            itemId: answer.itemId,
          },
        },
        create: {
          id: randomUUID(),
          tenantId: input.tenantId,
          sessionId: session.id,
          itemId: answer.itemId,
          selectedKeys: [...answer.selectedKeys],
          savedAt: input.now,
        },
        update: { selectedKeys: [...answer.selectedKeys], savedAt: input.now },
      });
    }
    return { sessionId: session.id, saved: input.answers.length, scored: null };
  });
}

export async function submitCandidateSession(
  client: ExamClient,
  input: { tenantId: string; userId: string; sessionId: string; now: Date },
) {
  const closed = await closeIfExpired(client, input);
  if (closed) {
    return closed;
  }
  return client.$transaction(async (tx) => scoreSession(tx, input));
}

async function closeIfExpired(
  client: ExamClient,
  input: { tenantId: string; userId: string; sessionId: string; now: Date },
): Promise<Awaited<ReturnType<typeof scoreSession>> | null> {
  const session = await client.certificationExamSession.findFirst({
    where: { tenantId: input.tenantId, id: input.sessionId, candidateUserId: input.userId },
  });
  if (!session || session.status !== 'IN_PROGRESS' || !session.expiresAt) {
    return null;
  }
  if (input.now.getTime() <= session.expiresAt.getTime()) {
    return null;
  }
  return client.$transaction(async (tx) => scoreSession(tx, input));
}

async function scoreSession(
  tx: Tx,
  input: { tenantId: string; userId: string; sessionId: string; now: Date },
) {
  const session = await loadOwnSession(tx, input.tenantId, input.userId, input.sessionId);
  if (session.result) {
    return resultView(
      session.id,
      session.result.passed,
      session.result.provisional,
      session.result.scoreBasisPoints,
      session.result.domainFeedback,
    );
  }
  if (session.status !== 'IN_PROGRESS') {
    throw new ExamRuleError('SESSION_NOT_OPEN');
  }
  const answers = new Map(session.answers.map((answer) => [answer.itemId, answer.selectedKeys]));
  const domains = new Map<string, DomainTally>();
  let correct = 0;
  const matrixRow: number[] = [];
  for (const row of session.form.items) {
    const tally = domains.get(row.domainCode) ?? {
      domainCode: row.domainCode,
      correct: 0,
      total: 0,
    };
    tally.total += 1;
    const keys = row.item.choices
      .filter((choice) => choice.isCorrect)
      .map((choice) => choice.choiceKey);
    const hit = itemIsCorrect(row.item.itemType, keys, answers.get(row.item.id) ?? []);
    if (hit) {
      correct += 1;
      tally.correct += 1;
    }
    matrixRow.push(hit ? 1 : 0);
    domains.set(row.domainCode, tally);
  }
  const cut = session.form.blueprint.cutScoreBasisPoints;
  if (cut === null) {
    throw new ExamRuleError('CUT_SCORE_REQUIRED');
  }
  const score = scoreBasisPoints(correct, session.form.items.length);
  const passed = score >= cut;
  const feedback = [...domains.values()];
  const resultId = randomUUID();
  await tx.certificationExamSession.update({
    where: { tenantId_id: { tenantId: input.tenantId, id: session.id } },
    data: { status: 'SCORED', submittedAt: input.now },
  });
  await tx.certificationExamResult.create({
    data: {
      id: resultId,
      tenantId: input.tenantId,
      sessionId: session.id,
      scoreBasisPoints: score,
      passed,
      provisional: true,
      domainFeedback: feedback,
      scoredAt: input.now,
    },
  });
  for (const row of session.form.items) {
    await tx.schemeExamItem.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: row.itemId } },
      data: { exposureCount: { increment: 1 } },
    });
  }
  const consent = await tx.learnerAnalyticsConsent.findUnique({
    where: { tenantId_userId: { tenantId: input.tenantId, userId: input.userId } },
  });
  const statementId = randomUUID();
  await tx.learningActivityRecord.create({
    data: {
      tenantId: input.tenantId,
      statementId,
      actorUserId: input.userId,
      verbIri: passed ? XAPI_VERB.passed : XAPI_VERB.failed,
      objectKind: 'EXAM',
      objectId: session.id,
      resultScoreScaled: score / 10_000,
      resultSuccess: passed,
      storedAt: input.now,
      analyticsConsent: consent?.granted ?? false,
      rawStatement: {
        actor: { account: { name: input.userId } },
        verb: passed ? XAPI_VERB.passed : XAPI_VERB.failed,
        object: { id: session.id, definition: { type: 'EXAM' } },
        result: { success: passed, score: { scaled: score / 10_000 } },
      },
    },
  });
  await recomputePsychometrics(tx, input.tenantId, session.formId, input.now);
  return {
    ...resultView(session.id, passed, true, score, feedback),
    resultId,
    statementId,
  };
}

function resultView(
  sessionId: string,
  passed: boolean,
  provisional: boolean,
  scoreBasisPoints: number,
  domainFeedback: unknown,
) {
  const domains = Array.isArray(domainFeedback) ? (domainFeedback as DomainTally[]) : [];
  return {
    sessionId,
    passed,
    provisional,
    scoreBasisPoints,
    domains: domainFeedbackForCandidate(passed, domains),
    certificateIssued: false,
  };
}

async function recomputePsychometrics(tx: Tx, tenantId: string, formId: string, now: Date) {
  const form = await tx.assembledExamForm.findFirst({
    where: { tenantId, id: formId },
    include: {
      items: { orderBy: { sequence: 'asc' }, include: { item: { include: { choices: true } } } },
    },
  });
  if (!form) {
    return;
  }
  const sessions = await tx.certificationExamSession.findMany({
    where: { tenantId, formId, status: 'SCORED' },
    include: { answers: true },
  });
  const matrix = sessions.map((session) => {
    const answers = new Map(session.answers.map((answer) => [answer.itemId, answer.selectedKeys]));
    return form.items.map((row) => {
      const keys = row.item.choices
        .filter((choice) => choice.isCorrect)
        .map((choice) => choice.choiceKey);
      return itemIsCorrect(row.item.itemType, keys, answers.get(row.item.id) ?? []) ? 1 : 0;
    });
  });
  const totals = matrix.map((row) => row.reduce<number>((sum, value) => sum + value, 0));
  await tx.examItemStatistic.deleteMany({ where: { tenantId, formId } });
  await tx.examFormReliability.deleteMany({ where: { tenantId, formId } });
  for (let column = 0; column < form.items.length; column += 1) {
    const itemScores = matrix.map((row) => row[column] ?? 0);
    const correctCount = itemScores.reduce<number>((sum, value) => sum + value, 0);
    const difficulty = sessions.length === 0 ? 0 : pValue(correctCount, sessions.length);
    const discrimination = pointBiserial(itemScores, totals);
    const row = form.items[column];
    if (!row) {
      continue;
    }
    await tx.examItemStatistic.create({
      data: {
        id: randomUUID(),
        tenantId,
        formId,
        itemId: row.itemId,
        attemptCount: sessions.length,
        pValue: difficulty.toFixed(5),
        pointBiserial: discrimination === null ? null : discrimination.toFixed(5),
        flagReason: sessions.length === 0 ? null : itemReviewFlag(difficulty, discrimination),
        computedAt: now,
      },
    });
  }
  const reliability = kr20(matrix);
  await tx.examFormReliability.create({
    data: {
      id: randomUUID(),
      tenantId,
      formId,
      attemptCount: sessions.length,
      kr20: reliability === null ? null : reliability.toFixed(5),
      flagReason: formReviewFlag(reliability),
      computedAt: now,
    },
  });
}

export async function candidateResult(
  client: ExamClient,
  input: { tenantId: string; userId: string; sessionId: string },
) {
  const result = await client.certificationExamResult.findFirst({
    where: {
      tenantId: input.tenantId,
      session: { id: input.sessionId, candidateUserId: input.userId },
    },
  });
  if (!result) {
    throw new ExamNotFoundError();
  }
  return resultView(
    input.sessionId,
    result.passed,
    result.provisional,
    result.scoreBasisPoints,
    result.domainFeedback,
  );
}

export async function formPsychometrics(
  client: ExamClient,
  tenantId: string,
  actor: Actor,
  formId: string,
) {
  assertAction(actor, 'PSYCHOMETRICS_READ');
  const form = await client.assembledExamForm.findFirst({ where: { tenantId, id: formId } });
  if (!form) {
    throw new ExamNotFoundError();
  }
  const items = await client.examItemStatistic.findMany({ where: { tenantId, formId } });
  const reliability = await client.examFormReliability.findUnique({
    where: { tenantId_formId: { tenantId, formId } },
  });
  return {
    formId,
    attemptCount: reliability?.attemptCount ?? 0,
    kr20: reliability?.kr20?.toString() ?? null,
    flagReason: reliability?.flagReason ?? null,
    items: items.map((item) => ({
      itemId: item.itemId,
      attemptCount: item.attemptCount,
      pValue: item.pValue.toString(),
      pointBiserial: item.pointBiserial?.toString() ?? null,
      flagReason: item.flagReason,
    })),
  };
}

export async function decisionQueue(client: ExamClient, tenantId: string, actor: Actor) {
  assertAction(actor, 'DECIDE');
  const results = await client.certificationExamResult.findMany({
    where: { tenantId, decision: null },
    include: {
      session: {
        include: {
          form: {
            include: { blueprint: { include: { schemeVersion: { include: { scheme: true } } } } },
          },
        },
      },
    },
    orderBy: { scoredAt: 'asc' },
  });
  return results.map((result) => ({
    resultId: result.id,
    sessionId: result.sessionId,
    candidateUserId: result.session.candidateUserId,
    schemeCode: result.session.form.blueprint.schemeVersion.scheme.code,
    passed: result.passed,
    provisional: result.provisional,
    scoreBasisPoints: result.scoreBasisPoints,
    scoredAt: result.scoredAt.toISOString(),
  }));
}

export async function recordDecision(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    resultId: string;
    outcome: 'GRANT' | 'DENY';
    rationale: string;
    now: Date;
  },
) {
  return client.$transaction(async (tx) => {
    const result = await tx.certificationExamResult.findFirst({
      where: { tenantId: input.tenantId, id: input.resultId },
      include: { decision: true, session: true },
    });
    if (!result) {
      throw new ExamNotFoundError();
    }
    if (result.decision) {
      throw new ExamRuleError('DECISION_EXISTS');
    }
    const trainer = await tx.enrolmentTrainer.findFirst({
      where: {
        tenantId: input.tenantId,
        trainerUserId: input.actor.userId,
        enrolment: { userId: result.session.candidateUserId },
      },
    });
    const gate = assertCertificationDecision({
      makerUserId: input.actor.userId,
      candidateUserId: result.session.candidateUserId,
      roles: input.actor.roles,
      trainerOfCandidate: Boolean(trainer),
    });
    const id = randomUUID();
    await tx.examCertificationDecision.create({
      data: {
        id,
        tenantId: input.tenantId,
        resultId: result.id,
        decidedByUserId: input.actor.userId,
        outcome: input.outcome,
        rationale: input.rationale,
        trainerOfCandidate: gate.trainerOfCandidate,
        independentOfTraining: gate.independentOfTraining,
        decidedAt: input.now,
      },
    });
    await tx.certificationExamResult.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: result.id } },
      data: { provisional: false },
    });
    return {
      decisionId: id,
      resultId: result.id,
      sessionId: result.sessionId,
      outcome: input.outcome,
      independentOfTraining: true as const,
      certificateIssued: false,
    };
  });
}

export async function addProctorFlag(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    sessionId: string;
    source: 'HUMAN' | 'AI';
    signalCode: string;
    now: Date;
  },
) {
  assertAction(input.actor, 'PROCTOR_FLAG');
  return client.$transaction(async (tx) => {
    const session = await tx.certificationExamSession.findFirst({
      where: { tenantId: input.tenantId, id: input.sessionId },
    });
    if (!session) {
      throw new ExamNotFoundError();
    }
    const id = randomUUID();
    await tx.examProctorFlag.create({
      data: {
        id,
        tenantId: input.tenantId,
        sessionId: session.id,
        source: input.source,
        signalCode: input.signalCode,
        recordedAt: input.now,
      },
    });
    return { flagId: id, changesScore: false };
  });
}

export async function reviewProctorFlag(
  client: ExamClient,
  input: {
    tenantId: string;
    actor: Actor;
    flagId: string;
    disposition: 'DISMISSED' | 'CONFIRMED_FOR_REVIEW';
    note?: string;
    now: Date;
  },
) {
  assertAction(input.actor, 'PROCTOR_REVIEW');
  return client.$transaction(async (tx) => {
    const flag = await tx.examProctorFlag.findFirst({
      where: { tenantId: input.tenantId, id: input.flagId },
      include: { session: { include: { result: true } } },
    });
    if (!flag) {
      throw new ExamNotFoundError();
    }
    const passedBefore = flag.session.result?.passed ?? null;
    await tx.examProctorFlagReview.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        flagId: flag.id,
        reviewerUserId: input.actor.userId,
        disposition: input.disposition,
        note: input.note ?? null,
        reviewedAt: input.now,
      },
    });
    const passedAfter = flag.session.result?.passed ?? null;
    return { flagId: flag.id, disposition: input.disposition, passedBefore, passedAfter };
  });
}

export async function listBlueprints(client: ExamClient, tenantId: string, actor: Actor) {
  assertAction(actor, 'BLUEPRINT_WRITE');
  const rows = await client.examBlueprint.findMany({
    where: { tenantId },
    include: { domains: true, schemeVersion: { include: { scheme: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    schemeCode: row.schemeVersion.scheme.code,
    schemeVersionId: row.schemeVersionId,
    durationSeconds: row.durationSeconds,
    retakeWindowDays: row.retakeWindowDays,
    cutScoreBasisPoints: row.cutScoreBasisPoints,
    domains: row.domains.map((domain) => ({
      domainCode: domain.domainCode,
      title: domain.title,
      weightBasisPoints: domain.weightBasisPoints,
      itemCount: domain.itemCount,
    })),
  }));
}
