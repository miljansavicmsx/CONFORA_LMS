import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import type { AuthenticatedActor } from '../auth/request-principal';
import { ExamNotFoundError } from '../prisma/exam-tenant-store';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { ExamRuleError } from './exam-rules';

const DENIED = new Set([
  'ROLE_SEPARATION',
  'AUTHOR_CANNOT_APPROVE',
  'TRAINER_CANNOT_DECIDE',
  'CANDIDATE_CANNOT_DECIDE',
]);

function fail(error: unknown): never {
  if (error instanceof ExamNotFoundError) {
    throw new NotFoundException();
  }
  if (error instanceof ExamRuleError) {
    if (DENIED.has(error.code)) {
      throw new AccessDeniedError();
    }
    throw new BadRequestException(error.code);
  }
  throw error;
}

@Injectable()
export class ExamService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly audit: AuditService,
  ) {}

  private actor(actor: AuthenticatedActor) {
    return { userId: actor.userId, roles: actor.roles };
  }

  createItem(
    actor: AuthenticatedActor,
    body: {
      schemeId: string;
      stem: string;
      itemType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
      domainCode: string;
      choices: { choiceKey: string; text: string; isCorrect: boolean }[];
      competenceIds: string[];
    },
  ) {
    return this.tenantPrisma.exam
      .createItem({ ...body, actor: this.actor(actor), now: new Date() })
      .catch(fail);
  }

  updateDraft(
    actor: AuthenticatedActor,
    itemId: string,
    body: { stem: string; choices: { choiceKey: string; text: string; isCorrect: boolean }[] },
  ) {
    return this.tenantPrisma.exam
      .updateDraft({ ...body, actor: this.actor(actor), itemId })
      .catch(fail);
  }

  createVersion(actor: AuthenticatedActor, itemId: string) {
    return this.tenantPrisma.exam.createVersion({ actor: this.actor(actor), itemId }).catch(fail);
  }

  async transition(
    actor: AuthenticatedActor,
    itemId: string,
    body: { toStatus: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'RETIRED'; note?: string },
  ) {
    const now = new Date();
    const result = await this.tenantPrisma.exam
      .transition({ ...body, actor: this.actor(actor), itemId, now })
      .catch(fail);
    if (result.toStatus === 'APPROVED') {
      await this.audit.append(actor, {
        idempotencyKey: randomUUID(),
        eventType: 'EXAM_ITEM_APPROVED',
        outcome: 'SUCCESS',
        occurredAt: now,
        resourceType: 'SchemeExamItem',
        resourceId: result.itemId,
        metadata: {
          itemId: result.itemId,
          fromStatus: result.fromStatus,
          toStatus: result.toStatus,
        },
      });
    }
    return result;
  }

  listItems(actor: AuthenticatedActor, schemeId?: string) {
    return this.tenantPrisma.exam.listItems(this.actor(actor), schemeId).catch(fail);
  }

  listBlueprints(actor: AuthenticatedActor) {
    return this.tenantPrisma.exam.listBlueprints(this.actor(actor)).catch(fail);
  }

  createBlueprint(
    actor: AuthenticatedActor,
    body: {
      schemeVersionId: string;
      title: string;
      durationSeconds: number;
      retakeWindowDays: number;
    },
  ) {
    return this.tenantPrisma.exam
      .createBlueprint({ ...body, actor: this.actor(actor) })
      .catch(fail);
  }

  setDomains(
    actor: AuthenticatedActor,
    blueprintId: string,
    domains: {
      domainCode: string;
      title: string;
      weightBasisPoints: number;
      itemCount: number;
    }[],
  ) {
    return this.tenantPrisma.exam
      .setDomains({ actor: this.actor(actor), blueprintId, domains })
      .catch(fail);
  }

  openStandardSetting(actor: AuthenticatedActor, blueprintId: string, note?: string) {
    return this.tenantPrisma.exam
      .openStandardSetting({
        actor: this.actor(actor),
        blueprintId,
        ...(note !== undefined ? { note } : {}),
      })
      .catch(fail);
  }

  addRatings(
    actor: AuthenticatedActor,
    recordId: string,
    ratings: { itemId: string; probabilityBasisPoints: number }[],
  ) {
    return this.tenantPrisma.exam
      .addRatings({ actor: this.actor(actor), recordId, ratings })
      .catch(fail);
  }

  async approveCutScore(actor: AuthenticatedActor, recordId: string) {
    const now = new Date();
    const result = await this.tenantPrisma.exam
      .approveStandardSetting({ actor: this.actor(actor), recordId, now })
      .catch(fail);
    await this.audit.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'EXAM_CUT_SCORE_APPROVED',
      outcome: 'SUCCESS',
      occurredAt: now,
      resourceType: 'StandardSettingRecord',
      resourceId: result.recordId,
      metadata: {
        recordId: result.recordId,
        blueprintId: result.blueprintId,
        cutScoreBasisPoints: result.cutScoreBasisPoints,
      },
    });
    return result;
  }

  async approveBlueprint(actor: AuthenticatedActor, blueprintId: string) {
    const now = new Date();
    const result = await this.tenantPrisma.exam
      .approveBlueprint({ actor: this.actor(actor), blueprintId })
      .catch(fail);
    await this.audit.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'EXAM_BLUEPRINT_APPROVED',
      outcome: 'SUCCESS',
      occurredAt: now,
      resourceType: 'ExamBlueprint',
      resourceId: result.blueprintId,
      metadata: { blueprintId: result.blueprintId, toStatus: result.status },
    });
    return result;
  }

  assemble(actor: AuthenticatedActor, blueprintId: string) {
    return this.tenantPrisma.exam
      .assemble({ actor: this.actor(actor), blueprintId, now: new Date() })
      .catch(fail);
  }

  psychometrics(actor: AuthenticatedActor, formId: string) {
    return this.tenantPrisma.exam.psychometrics(this.actor(actor), formId).catch(fail);
  }

  schedule(
    actor: AuthenticatedActor,
    body: {
      formId: string;
      candidateUserId: string;
      certificationApplicationId: string;
      invigilatorUserId: string;
      scheduledStartAt: string;
    },
  ) {
    return this.tenantPrisma.exam
      .schedule({
        actor: this.actor(actor),
        formId: body.formId,
        candidateUserId: body.candidateUserId,
        certificationApplicationId: body.certificationApplicationId,
        invigilatorUserId: body.invigilatorUserId,
        scheduledStartAt: new Date(body.scheduledStartAt),
        now: new Date(),
      })
      .catch(fail);
  }

  addFlag(
    actor: AuthenticatedActor,
    sessionId: string,
    body: { source: 'HUMAN' | 'AI'; signalCode: string },
  ) {
    return this.tenantPrisma.exam
      .addFlag({ ...body, actor: this.actor(actor), sessionId, now: new Date() })
      .catch(fail);
  }

  reviewFlag(
    actor: AuthenticatedActor,
    flagId: string,
    body: { disposition: 'DISMISSED' | 'CONFIRMED_FOR_REVIEW'; note?: string },
  ) {
    return this.tenantPrisma.exam
      .reviewFlag({
        actor: this.actor(actor),
        flagId,
        disposition: body.disposition,
        ...(body.note !== undefined ? { note: body.note } : {}),
        now: new Date(),
      })
      .catch(fail);
  }

  listMine(actor: AuthenticatedActor) {
    return this.tenantPrisma.exam.listMine(actor.userId).catch(fail);
  }

  start(
    actor: AuthenticatedActor,
    sessionId: string,
    body: { rulesAccepted: true; ndaAccepted: true },
  ) {
    return this.tenantPrisma.exam
      .start({
        userId: actor.userId,
        sessionId,
        rulesAccepted: body.rulesAccepted,
        ndaAccepted: body.ndaAccepted,
        mfaVerified: actor.mfaVerified,
        now: new Date(),
      })
      .catch(fail);
  }

  async getSession(actor: AuthenticatedActor, sessionId: string) {
    const view = await this.tenantPrisma.exam
      .getSession({ userId: actor.userId, sessionId, now: new Date() })
      .catch(fail);
    await this.auditScore(actor, view.scored);
    const { scored: _scored, ...rest } = view;
    return rest;
  }

  async saveAnswers(
    actor: AuthenticatedActor,
    sessionId: string,
    answers: { itemId: string; selectedKeys: string[] }[],
  ) {
    const view = await this.tenantPrisma.exam
      .saveAnswers({ userId: actor.userId, sessionId, answers, now: new Date() })
      .catch(fail);
    await this.auditScore(actor, view.scored);
    return { sessionId: view.sessionId, saved: view.saved };
  }

  async submit(actor: AuthenticatedActor, sessionId: string) {
    const view = await this.tenantPrisma.exam
      .submit({ userId: actor.userId, sessionId, now: new Date() })
      .catch(fail);
    await this.auditScore(actor, 'resultId' in view ? view : null);
    if (!('resultId' in view)) {
      return view;
    }
    const { resultId: _resultId, statementId: _statementId, ...rest } = view;
    return rest;
  }

  result(actor: AuthenticatedActor, sessionId: string) {
    return this.tenantPrisma.exam.result({ userId: actor.userId, sessionId }).catch(fail);
  }

  queue(actor: AuthenticatedActor) {
    return this.tenantPrisma.exam.queue(this.actor(actor)).catch(fail);
  }

  async decide(
    actor: AuthenticatedActor,
    body: { resultId: string; outcome: 'GRANT' | 'DENY'; rationale: string },
  ) {
    const now = new Date();
    const result = await this.tenantPrisma.exam
      .decide({ ...body, actor: this.actor(actor), now })
      .catch(fail);
    await this.audit.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'EXAM_DECISION_RECORDED',
      outcome: 'SUCCESS',
      occurredAt: now,
      resourceType: 'ExamCertificationDecision',
      resourceId: result.decisionId,
      metadata: {
        decisionId: result.decisionId,
        resultId: result.resultId,
        sessionId: result.sessionId,
        outcome: result.outcome,
        independentOfTraining: result.independentOfTraining,
        provisional: false,
      },
    });
    return result;
  }

  private async auditScore(
    actor: AuthenticatedActor,
    scored: {
      resultId?: string;
      sessionId: string;
      passed: boolean;
      scoreBasisPoints: number;
      provisional: boolean;
    } | null,
  ): Promise<void> {
    if (!scored?.resultId) {
      return;
    }
    const now = new Date();
    await this.audit.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'EXAM_SUBMITTED',
      outcome: 'SUCCESS',
      occurredAt: now,
      resourceType: 'CertificationExamSession',
      resourceId: scored.sessionId,
      metadata: {
        sessionId: scored.sessionId,
        resultId: scored.resultId,
        passed: scored.passed,
        scoreBasisPoints: scored.scoreBasisPoints,
      },
    });
    await this.audit.append(actor, {
      idempotencyKey: randomUUID(),
      eventType: 'EXAM_SCORED',
      outcome: 'SUCCESS',
      occurredAt: now,
      resourceType: 'CertificationExamResult',
      resourceId: scored.resultId,
      metadata: {
        sessionId: scored.sessionId,
        resultId: scored.resultId,
        passed: scored.passed,
        provisional: scored.provisional,
        scoreBasisPoints: scored.scoreBasisPoints,
      },
    });
  }
}
