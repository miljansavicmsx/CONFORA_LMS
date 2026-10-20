import { randomUUID } from 'node:crypto';
import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import type { AuthenticatedActor } from '../auth/request-principal';
import { FlowNotFoundError } from '../prisma/certification-flow-store';
import { PersonnelNotFoundError } from '../prisma/personnel-certificate-store';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { FlowRuleError } from './certification-flow-rules';
import { PersonnelRuleError } from '../personnel/personnel-rules';

const DENIED = new Set(['ROLE_SEPARATION', 'FOUR_EYES', 'NOT_APPLICANT', 'NOT_MEMBER']);

function fail(error: unknown): never {
  if (error instanceof FlowNotFoundError || error instanceof PersonnelNotFoundError) {
    throw new NotFoundException();
  }
  if (error instanceof PersonnelRuleError) {
    if (DENIED.has(error.code) || error.code === 'FOUR_EYES' || error.code === 'ROLE_SEPARATION') {
      throw new AccessDeniedError();
    }
    throw new BadRequestException(error.code);
  }
  if (error instanceof FlowRuleError) {
    if (error.code === 'RATE_LIMIT') {
      throw new HttpException(error.code, 429);
    }
    if (DENIED.has(error.code)) {
      throw new AccessDeniedError();
    }
    throw new BadRequestException(error.code);
  }
  throw error;
}

@Injectable()
export class CertificationFlowService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly audit: AuditService,
  ) {}

  private actor(actor: AuthenticatedActor) {
    return { userId: actor.userId, roles: actor.roles };
  }

  open(
    actor: AuthenticatedActor,
    body: {
      schemeVersionId: string;
      path: 'CONFORA_EDUCATION' | 'DIRECT';
      prerequisitesAcknowledged: true;
      certificationApplicationId: string;
      experienceMonths: number;
    },
  ) {
    const now = new Date();
    return this.tenantPrisma.flow
      .open({ ...body, userId: actor.userId, now })
      .then(async (result) => {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'CASE_OPENED',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'ProfessionalCase',
          resourceId: result.caseId,
          metadata: { caseId: result.caseId, phase: result.phase, reason: result.path },
        });
        return result;
      })
      .catch(fail);
  }

  listMine(actor: AuthenticatedActor) {
    return this.tenantPrisma.flow.listMine(actor.userId).catch(fail);
  }

  mineOne(actor: AuthenticatedActor, caseId: string) {
    return this.tenantPrisma.flow.mineOne(actor.userId, caseId).catch(fail);
  }

  committeeOne(actor: AuthenticatedActor, caseId: string) {
    return this.tenantPrisma.flow.committeeOne(this.actor(actor), caseId).catch(fail);
  }

  linkExam(actor: AuthenticatedActor, caseId: string, resultId: string) {
    return this.tenantPrisma.flow.linkExam({ userId: actor.userId, caseId, resultId }).catch(fail);
  }

  addEvidence(
    actor: AuthenticatedActor,
    caseId: string,
    body: {
      kind: 'EDUCATION' | 'QUALIFICATION' | 'EXPERIENCE' | 'WORK' | 'OTHER';
      title: string;
      summary?: string;
      objectKey?: string;
    },
  ) {
    return this.tenantPrisma.flow
      .addEvidence({ ...body, userId: actor.userId, caseId })
      .catch(fail);
  }

  completeDossier(actor: AuthenticatedActor, caseId: string, experienceMonths: number) {
    return this.tenantPrisma.flow
      .completeDossier({ userId: actor.userId, caseId, experienceMonths })
      .catch(fail);
  }

  requestReferee(
    actor: AuthenticatedActor,
    caseId: string,
    body: { refereeName: string; organization: string; email: string; requestedFacts: string },
  ) {
    const now = new Date();
    return this.tenantPrisma.flow
      .requestReferee({ ...body, userId: actor.userId, caseId, now })
      .then(async (result) => {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'REFEREE_LINK_SENT',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'RefereeConfirmation',
          resourceId: result.refereeId,
          metadata: { caseId, reason: 'LOGGED' },
        });
        return result;
      })
      .catch(fail);
  }

  confirmReferee(
    token: string,
    body: { accept: boolean; confirmedFacts?: string; discrepancies?: string },
  ) {
    return this.tenantPrisma.flow.confirmReferee({ token, ...body, now: new Date() }).catch(fail);
  }

  saveLevel(
    actor: AuthenticatedActor,
    schemeVersionId: string,
    body: {
      code: string;
      title: string;
      rank: number;
      minExperienceMonths: number;
      requiresExamPass: boolean;
    },
  ) {
    return this.tenantPrisma.flow
      .saveLevel({ ...body, actor: this.actor(actor), schemeVersionId })
      .catch(fail);
  }

  saveDecisionMaker(
    actor: AuthenticatedActor,
    schemeVersionId: string,
    body: {
      userId: string;
      competenceNote: string;
      authorisedFrom: string;
      authorisedUntil: string;
    },
  ) {
    return this.tenantPrisma.flow
      .saveDecisionMaker({
        actor: this.actor(actor),
        schemeVersionId,
        userId: body.userId,
        competenceNote: body.competenceNote,
        authorisedFrom: new Date(body.authorisedFrom),
        authorisedUntil: new Date(body.authorisedUntil),
      })
      .catch(fail);
  }

  saveCaseRule(
    actor: AuthenticatedActor,
    schemeVersionId: string,
    body: {
      votingQuorum: number;
      experienceMayFollowExam: boolean;
      experienceMode: 'INDEPENDENT_REFERENCES' | 'OTHER_VERIFIABLE_EVIDENCE';
      referenceCount: number;
    },
  ) {
    return this.tenantPrisma.flow
      .saveCaseRule({ ...body, actor: this.actor(actor), schemeVersionId })
      .catch(fail);
  }

  propose(actor: AuthenticatedActor, caseId: string, declaredConflictUserIds: readonly string[]) {
    const now = new Date();
    return this.tenantPrisma.flow
      .propose({ actor: this.actor(actor), caseId, declaredConflictUserIds, now })
      .then(async (result) => {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'COMMITTEE_PROPOSED',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'CommitteeProposal',
          resourceId: caseId,
          metadata: { caseId, reason: String(result.slots.length) },
        });
        return result;
      })
      .catch(fail);
  }

  confirm(actor: AuthenticatedActor, caseId: string, memberUserId: string) {
    return this.tenantPrisma.flow
      .confirm({ actor: this.actor(actor), caseId, memberUserId })
      .catch(fail);
  }

  vote(
    actor: AuthenticatedActor,
    caseId: string,
    body: { ballot: 'GRANT' | 'DENY'; reasoning: string },
  ) {
    const now = new Date();
    return this.tenantPrisma.flow
      .vote({ ...body, actor: this.actor(actor), caseId, now })
      .then(async (result) => {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'COMMITTEE_VOTE_RECORDED',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'CommitteeAssessment',
          resourceId: caseId,
          metadata: { caseId, phase: result.phase, reason: result.outcome },
        });
        return result;
      })
      .catch(fail);
  }

  assessReferee(
    actor: AuthenticatedActor,
    caseId: string,
    body: { refereeId: string; relevanceNote: string; credible: boolean },
  ) {
    return this.tenantPrisma.flow
      .assessReferee({ ...body, actor: this.actor(actor), caseId, now: new Date() })
      .catch(fail);
  }

  assist(
    actor: AuthenticatedActor,
    caseId: string,
    purpose: 'completeness' | 'summary' | 'inconsistencies' | 'committee' | 'notification',
  ) {
    const now = new Date();
    return this.tenantPrisma.flow
      .assist({ actor: this.actor(actor), caseId, purpose })
      .then(async (result) => {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'AI_SUGGESTION_STORED',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'AiCaseSuggestion',
          resourceId: result.suggestionId,
          metadata: { caseId, purpose },
        });
        return result;
      })
      .catch(fail);
  }

  authorize(
    actor: AuthenticatedActor,
    caseId: string,
    body: { holderDisplayName: string; registryConsent: boolean; note: string },
  ) {
    const now = new Date();
    return this.tenantPrisma.flow
      .authorize({ ...body, actor: this.actor(actor), caseId, now })
      .then(async (result) => {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'ISSUANCE_AUTHORISED',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'IssuanceAuthorization',
          resourceId: caseId,
          metadata: { caseId, documentNumber: result.certificateNumber, phase: 'ISSUED' },
        });
        return result;
      })
      .catch(fail);
  }

  releaseExamPass(actor: AuthenticatedActor, attestationId: string) {
    return this.tenantPrisma.flow
      .releaseExamPass({ actor: this.actor(actor), attestationId, now: new Date() })
      .catch(fail);
  }

  education(actor: AuthenticatedActor) {
    return this.tenantPrisma.flow.education(actor.userId).catch(fail);
  }

  examPasses(actor: AuthenticatedActor) {
    return this.tenantPrisma.flow.examPasses(actor.userId).catch(fail);
  }

  publicDocument(publicUid: string) {
    return this.tenantPrisma.flow.publicDocument(publicUid).catch(fail);
  }

  publicPdf(publicUid: string) {
    return this.tenantPrisma.flow.publicPdf(publicUid).catch(fail);
  }
}
