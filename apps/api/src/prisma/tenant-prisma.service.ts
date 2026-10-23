import { Injectable, Scope } from '@nestjs/common';
import type { CertificationApplicationStatus } from '@prisma/client';

import { TenantContextStore } from '../tenant/tenant-context.store';
import { TenantAccessDeniedError } from '../tenant/tenant-errors';
import {
  addProctorFlag,
  addStandardSettingRatings,
  approveBlueprint,
  approveStandardSetting,
  assembleForm,
  candidateResult,
  confirmSessionIdentity,
  createBlueprint,
  createItemVersion,
  createSchemeItem,
  decisionQueue,
  formPsychometrics,
  getCandidateSession,
  listBlueprints,
  listCandidateSessions,
  listSchemeItems,
  openStandardSetting,
  recordDecision,
  replaceBlueprintDomains,
  reviewProctorFlag,
  saveCandidateAnswers,
  scheduleSession,
  startCandidateSession,
  submitCandidateSession,
  transitionItem,
  updateDraftItem,
  type ExamClient,
} from './exam-tenant-store';
import {
  addEvidence,
  assessReferee,
  authorizeIssuance,
  completeDossier,
  approveComposition,
  confirmProposal,
  confirmReferee,
  decideIssuedReview,
  grantSchemeCommitteeAuthority,
  linkExamResult,
  listEducation,
  listExamPasses,
  listMyCases,
  maybeIssueEducation,
  maybeIssueExamPass,
  openIssuedReview,
  openProfessionalCase,
  proposeCommittee,
  publicDocument,
  publicDocumentPdf,
  assistFacts,
  listCommitteeCases,
  persistSuggestion,
  readApplicantCase,
  setDocumentNameConsent,
  readCommitteeCase,
  recordVote,
  releaseExamPass,
  requestReferee,
  saveCaseRule,
  saveDecisionMaker,
  saveLevel,
  signConflictDeclaration,
} from './certification-flow-store';
import { releaseAiBudget, reserveAiBudget } from '../ai-gateway/ai-budget-store';
import {
  chargeRecertification,
  includeFirstYear,
  listHolderFees,
  openNonPaymentCase,
  readSchemeFee,
  saveSchemeFee,
} from '../annual-fee/annual-fee-store';
import {
  drainNoticeQueue,
  enqueueDueReminders,
  listInAppNotices,
  markNoticeBounce,
  markNoticeComplaint,
  markNoticeRead,
} from '../notices/notice-store';
import type { EmailTransport } from '../notices/notice-transport';
import {
  addCpdRecord,
  changePersonnelStatus,
  holderCredential,
  holderPdf,
  issuePersonnelCertificate,
  listHolderCertificates,
  listReminders,
  proposeAmfSuspension,
  publicCertificate,
  publicPdf,
  refusePublicNumberQuery,
  revocationStatusList,
  searchPublicRegistry,
  withdrawDirectoryConsent,
} from './personnel-certificate-store';
import {
  enrolInCourse,
  getAnalyticsConsent,
  getLearningStatistics,
  getPlayer,
  getPublishedCourse,
  getPublicPublishedProgram,
  listMyEnrolments,
  listPublicPublishedPrograms,
  publicCatalogTenantIds,
  listPublishedCourses,
  recordLessonProgress,
  setAnalyticsConsent,
  submitChapterQuiz,
  type LearningClient,
} from './learning-tenant-store';
import { PrismaService } from './prisma.service';
import { isTenantRegisteredModel } from './tenant-model-policy';

type AggregateArgs = {
  where?: Record<string, unknown>;
  [key: string]: unknown;
};

/** Narrow BAR-P07 aggregate filter bag — no caller Prisma where objects. */
export type CertificationApplicationTenantAggregateFilters = {
  status?: CertificationApplicationStatus;
  schemeRef?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  submittedAt?: {
    gte?: Date;
    lte?: Date;
  };
};

function buildCertificationApplicationAggregateWhere(
  filters: CertificationApplicationTenantAggregateFilters,
): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.status !== undefined) {
    where['status'] = filters.status;
  }
  if (filters.schemeRef !== undefined) {
    where['schemeRef'] = filters.schemeRef;
  }
  if (filters.createdAt) {
    const createdAt: Record<string, Date> = {};
    if (filters.createdAt.gte !== undefined) createdAt['gte'] = filters.createdAt.gte;
    if (filters.createdAt.lte !== undefined) createdAt['lte'] = filters.createdAt.lte;
    where['createdAt'] = createdAt;
  }
  if (filters.submittedAt) {
    const submittedAt: Record<string, Date> = {};
    if (filters.submittedAt.gte !== undefined) submittedAt['gte'] = filters.submittedAt.gte;
    if (filters.submittedAt.lte !== undefined) submittedAt['lte'] = filters.submittedAt.lte;
    where['submittedAt'] = submittedAt;
  }
  return where;
}

function forceTenantWhere(
  where: Record<string, unknown> | undefined,
  tenantId: string,
): Record<string, unknown> {
  const base = where ? { ...where } : {};
  // Caller cannot override request tenant: always AND with exact tenantId.
  delete base['tenantId'];
  if (base['AND']) {
    delete base['AND'];
  }
  return { AND: [{ tenantId }, base] };
}

/**
 * Request-scoped read-only tenant Prisma facade (OD-P04-04..09).
 * Never exposes PrismaService / raw client / writes / transactions / raw SQL.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantPrismaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextStore,
  ) {}

  forModel(modelName: string): never {
    if (!isTenantRegisteredModel(modelName)) {
      throw new TenantAccessDeniedError();
    }
    throw new TenantAccessDeniedError();
  }

  readonly tenant = {
    findUnique: async (args?: { where?: { id?: string } }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      const requestedId = args?.where?.id;
      if (requestedId !== undefined && requestedId !== tenantId) {
        return null;
      }
      return this.prisma.tenant.findUnique({ where: { id: tenantId } });
    },
    findUniqueOrThrow: async (args?: { where?: { id?: string } }) => {
      const row = await this.tenant.findUnique(args);
      if (!row) {
        throw new TenantAccessDeniedError();
      }
      return row;
    },
  };

  readonly user = {
    findUnique: async (args: {
      where: { id?: string; email?: string; tenantId_id?: unknown; tenantId_email?: unknown };
    }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      if (args.where.tenantId_id || args.where.tenantId_email) {
        throw new TenantAccessDeniedError();
      }
      if (args.where.id && args.where.email) {
        throw new TenantAccessDeniedError();
      }
      if (args.where.id) {
        return this.prisma.user.findUnique({
          where: { tenantId_id: { tenantId, id: args.where.id } },
        });
      }
      if (args.where.email) {
        return this.prisma.user.findUnique({
          where: { tenantId_email: { tenantId, email: args.where.email } },
        });
      }
      throw new TenantAccessDeniedError();
    },
    findUniqueOrThrow: async (args: { where: { id?: string; email?: string } }) => {
      const row = await this.user.findUnique(args);
      if (!row) {
        throw new TenantAccessDeniedError();
      }
      return row;
    },
    findMany: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.findMany({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    findFirst: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.findFirst({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    findFirstOrThrow: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.findFirstOrThrow({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    count: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.count({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    aggregate: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.aggregate({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    groupBy: async (args: AggregateArgs & { by: string[] | string }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.user.groupBy({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      } as never);
    },
  };

  readonly externalIdentityLink = {
    findUnique: async (args: { where: { issuer: string; subject: string } }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.findUnique({
        where: {
          tenantId_issuer_subject: {
            tenantId,
            issuer: args.where.issuer,
            subject: args.where.subject,
          },
        },
      });
    },
    findUniqueOrThrow: async (args: { where: { issuer: string; subject: string } }) => {
      const row = await this.externalIdentityLink.findUnique(args);
      if (!row) {
        throw new TenantAccessDeniedError();
      }
      return row;
    },
    findMany: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.findMany({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    findFirst: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.findFirst({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    findFirstOrThrow: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.findFirstOrThrow({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    count: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.count({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    aggregate: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.aggregate({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    groupBy: async (args: AggregateArgs & { by: string[] | string }) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.externalIdentityLink.groupBy({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      } as never);
    },
  };

  readonly certificationApplication = {
    findMany: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.certificationApplication.findMany({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    findFirst: async (args: AggregateArgs = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.certificationApplication.findFirst({
        ...args,
        where: forceTenantWhere(args.where, tenantId),
      });
    },
    count: async (filters: CertificationApplicationTenantAggregateFilters = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      return this.prisma.certificationApplication.count({
        where: forceTenantWhere(buildCertificationApplicationAggregateWhere(filters), tenantId),
      });
    },
    groupByStatus: async (filters: CertificationApplicationTenantAggregateFilters = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      const rows = await this.prisma.certificationApplication.groupBy({
        by: ['status'],
        where: forceTenantWhere(buildCertificationApplicationAggregateWhere(filters), tenantId),
        _count: { _all: true },
      });
      return rows.map((row) => ({
        status: row.status,
        count: row._count._all,
      }));
    },
    groupBySchemeRef: async (filters: CertificationApplicationTenantAggregateFilters = {}) => {
      const tenantId = this.tenantContext.getRequiredTenantId();
      const rows = await this.prisma.certificationApplication.groupBy({
        by: ['schemeRef'],
        where: forceTenantWhere(buildCertificationApplicationAggregateWhere(filters), tenantId),
        _count: { _all: true },
      });
      return rows.map((row) => ({
        schemeRef: row.schemeRef,
        count: row._count._all,
      }));
    },
  };

  /**
   * Learner catalogue writes stay on this allowlisted facade.
   * Every call forces the request tenant. Callers cannot pass tenantId.
   */
  readonly learning = {
    listPublishedCourses: (areaCode?: string) =>
      listPublishedCourses(this.learningClient(), this.requiredTenantId(), areaCode),
    getPublishedCourse: (courseId: string) =>
      getPublishedCourse(this.learningClient(), this.requiredTenantId(), courseId),
    enrol: (input: { userId: string; courseId: string; now: Date }) =>
      enrolInCourse(this.learningClient(), { ...input, tenantId: this.requiredTenantId() }),
    listMyEnrolments: (userId: string) =>
      listMyEnrolments(this.learningClient(), this.requiredTenantId(), userId),
    getPlayer: (userId: string, enrolmentId: string) =>
      getPlayer(this.learningClient(), this.requiredTenantId(), userId, enrolmentId),
    recordLessonProgress: (input: {
      userId: string;
      enrolmentId: string;
      lessonId: string;
      additionalSeconds: number;
      statementId: string;
      analyticsConsent?: boolean;
      now: Date;
    }) =>
      recordLessonProgress(this.learningClient(), { ...input, tenantId: this.requiredTenantId() }),
    submitChapterQuiz: (input: {
      userId: string;
      enrolmentId: string;
      quizId: string;
      statementId: string;
      answers: readonly { itemId: string; choiceKey: string }[];
      analyticsConsent?: boolean;
      now: Date;
    }) => submitChapterQuiz(this.learningClient(), { ...input, tenantId: this.requiredTenantId() }),
    statistics: (userId: string) =>
      getLearningStatistics(this.learningClient(), this.requiredTenantId(), userId),
    getAnalyticsConsent: (userId: string) =>
      getAnalyticsConsent(this.learningClient(), this.requiredTenantId(), userId),
    setAnalyticsConsent: (input: { userId: string; granted: boolean; now: Date }) =>
      setAnalyticsConsent(this.learningClient(), { ...input, tenantId: this.requiredTenantId() }),
    listPublicPrograms: (areaCode?: string) =>
      listPublicPublishedPrograms(this.prisma, publicCatalogTenantIds(), areaCode),
    getPublicProgram: (courseId: string) =>
      getPublicPublishedProgram(this.prisma, publicCatalogTenantIds(), courseId),
  };

  /**
   * Certification exam writes stay on this allowlisted facade.
   * Callers cannot pass tenantId. Item keys are not returned from candidate methods.
   */
  readonly exam = {
    createItem: (
      input: Parameters<typeof createSchemeItem>[1] extends infer T ? Omit<T, 'tenantId'> : never,
    ) => createSchemeItem(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    updateDraft: (input: Omit<Parameters<typeof updateDraftItem>[1], 'tenantId'>) =>
      updateDraftItem(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    createVersion: (input: Omit<Parameters<typeof createItemVersion>[1], 'tenantId'>) =>
      createItemVersion(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    transition: (input: Omit<Parameters<typeof transitionItem>[1], 'tenantId'>) =>
      transitionItem(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    listItems: (actor: Parameters<typeof listSchemeItems>[2], schemeId?: string) =>
      listSchemeItems(this.examClient(), this.requiredTenantId(), actor, schemeId),
    listBlueprints: (actor: Parameters<typeof listBlueprints>[2]) =>
      listBlueprints(this.examClient(), this.requiredTenantId(), actor),
    createBlueprint: (input: Omit<Parameters<typeof createBlueprint>[1], 'tenantId'>) =>
      createBlueprint(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    setDomains: (input: Omit<Parameters<typeof replaceBlueprintDomains>[1], 'tenantId'>) =>
      replaceBlueprintDomains(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    openStandardSetting: (input: Omit<Parameters<typeof openStandardSetting>[1], 'tenantId'>) =>
      openStandardSetting(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    addRatings: (input: Omit<Parameters<typeof addStandardSettingRatings>[1], 'tenantId'>) =>
      addStandardSettingRatings(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    approveStandardSetting: (
      input: Omit<Parameters<typeof approveStandardSetting>[1], 'tenantId'>,
    ) => approveStandardSetting(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    approveBlueprint: (input: Omit<Parameters<typeof approveBlueprint>[1], 'tenantId'>) =>
      approveBlueprint(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    assemble: (input: Omit<Parameters<typeof assembleForm>[1], 'tenantId'>) =>
      assembleForm(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    psychometrics: (actor: Parameters<typeof formPsychometrics>[2], formId: string) =>
      formPsychometrics(this.examClient(), this.requiredTenantId(), actor, formId),
    schedule: (input: Omit<Parameters<typeof scheduleSession>[1], 'tenantId'>) =>
      scheduleSession(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    confirmIdentity: (input: Omit<Parameters<typeof confirmSessionIdentity>[1], 'tenantId'>) =>
      confirmSessionIdentity(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    listMine: (userId: string) =>
      listCandidateSessions(this.examClient(), this.requiredTenantId(), userId),
    start: (input: Omit<Parameters<typeof startCandidateSession>[1], 'tenantId'>) =>
      startCandidateSession(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    getSession: (input: Omit<Parameters<typeof getCandidateSession>[1], 'tenantId'>) =>
      getCandidateSession(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    saveAnswers: (input: Omit<Parameters<typeof saveCandidateAnswers>[1], 'tenantId'>) =>
      saveCandidateAnswers(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    submit: (input: Omit<Parameters<typeof submitCandidateSession>[1], 'tenantId'>) =>
      submitCandidateSession(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    result: (input: Omit<Parameters<typeof candidateResult>[1], 'tenantId'>) =>
      candidateResult(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    queue: (actor: Parameters<typeof decisionQueue>[2]) =>
      decisionQueue(this.examClient(), this.requiredTenantId(), actor),
    decide: (input: Omit<Parameters<typeof recordDecision>[1], 'tenantId'>) =>
      recordDecision(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    addFlag: (input: Omit<Parameters<typeof addProctorFlag>[1], 'tenantId'>) =>
      addProctorFlag(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
    reviewFlag: (input: Omit<Parameters<typeof reviewProctorFlag>[1], 'tenantId'>) =>
      reviewProctorFlag(this.examClient(), { ...input, tenantId: this.requiredTenantId() }),
  };

  readonly personnel = {
    issue: (input: Omit<Parameters<typeof issuePersonnelCertificate>[1], 'tenantId'>) =>
      issuePersonnelCertificate(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    changeStatus: (input: Omit<Parameters<typeof changePersonnelStatus>[1], 'tenantId'>) =>
      changePersonnelStatus(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    proposeAmf: (input: Omit<Parameters<typeof proposeAmfSuspension>[1], 'tenantId'>) =>
      proposeAmfSuspension(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    withdrawDirectoryConsent: (
      input: Omit<Parameters<typeof withdrawDirectoryConsent>[1], 'tenantId'>,
    ) => withdrawDirectoryConsent(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    listMine: (userId: string, now: Date) =>
      listHolderCertificates(this.prisma, { tenantId: this.requiredTenantId(), userId, now }),
    pdf: (userId: string, credentialId: string, now: Date) =>
      holderPdf(this.prisma, { tenantId: this.requiredTenantId(), userId, credentialId, now }),
    credential: (userId: string, credentialId: string) =>
      holderCredential(this.prisma, { tenantId: this.requiredTenantId(), userId, credentialId }),
    addCpd: (input: Omit<Parameters<typeof addCpdRecord>[1], 'tenantId'>) =>
      addCpdRecord(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    reminders: (userId: string, credentialId: string) =>
      listReminders(this.prisma, { tenantId: this.requiredTenantId(), userId, credentialId }),
    publicOne: (publicUid: string, now: Date, sourceIp: string) =>
      publicCertificate(this.prisma, { publicUid, now, sourceIp }),
    publicPdf: (publicUid: string, sourceIp: string, now: Date) =>
      publicPdf(this.prisma, { publicUid, sourceIp, now }),
    refuseNumber: (number: string, sourceIp: string, now: Date) =>
      refusePublicNumberQuery(this.prisma, { number, sourceIp, now }),
    search: (input: { name?: string }, now: Date) =>
      searchPublicRegistry(this.prisma, {
        ...input,
        tenantId: this.requiredTenantId(),
        now,
      }),
    statusList: () => revocationStatusList(this.prisma),
  };

  readonly flow = {
    open: (input: Omit<Parameters<typeof openProfessionalCase>[1], 'tenantId'>) =>
      openProfessionalCase(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    listMine: (userId: string) => listMyCases(this.prisma, this.requiredTenantId(), userId),
    mineOne: (userId: string, caseId: string) =>
      readApplicantCase(this.prisma, this.requiredTenantId(), userId, caseId),
    committeeOne: (actor: Parameters<typeof readCommitteeCase>[2], caseId: string) =>
      readCommitteeCase(this.prisma, this.requiredTenantId(), actor, caseId),
    listCommittee: (actor: Parameters<typeof listCommitteeCases>[2]) =>
      listCommitteeCases(this.prisma, this.requiredTenantId(), actor),
    signConflict: (input: Omit<Parameters<typeof signConflictDeclaration>[1], 'tenantId'>) =>
      signConflictDeclaration(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    linkExam: (input: Omit<Parameters<typeof linkExamResult>[1], 'tenantId'>) =>
      linkExamResult(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    addEvidence: (input: Omit<Parameters<typeof addEvidence>[1], 'tenantId'>) =>
      addEvidence(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    completeDossier: (input: Omit<Parameters<typeof completeDossier>[1], 'tenantId'>) =>
      completeDossier(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    requestReferee: (input: Omit<Parameters<typeof requestReferee>[1], 'tenantId'>) =>
      requestReferee(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    confirmReferee: (input: Parameters<typeof confirmReferee>[1]) =>
      confirmReferee(this.prisma, input),
    saveLevel: (input: Omit<Parameters<typeof saveLevel>[1], 'tenantId'>) =>
      saveLevel(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    saveDecisionMaker: (input: Omit<Parameters<typeof saveDecisionMaker>[1], 'tenantId'>) =>
      saveDecisionMaker(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    saveCaseRule: (input: Omit<Parameters<typeof saveCaseRule>[1], 'tenantId'>) =>
      saveCaseRule(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    propose: (input: Omit<Parameters<typeof proposeCommittee>[1], 'tenantId'>) =>
      proposeCommittee(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    approve: (input: Omit<Parameters<typeof approveComposition>[1], 'tenantId'>) =>
      approveComposition(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    grantAuthority: (
      input: Omit<Parameters<typeof grantSchemeCommitteeAuthority>[1], 'tenantId'>,
    ) =>
      grantSchemeCommitteeAuthority(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    openReview: (input: Omit<Parameters<typeof openIssuedReview>[1], 'tenantId'>) =>
      openIssuedReview(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    decideReview: (input: Omit<Parameters<typeof decideIssuedReview>[1], 'tenantId'>) =>
      decideIssuedReview(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    confirm: (input: Omit<Parameters<typeof confirmProposal>[1], 'tenantId'>) =>
      confirmProposal(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    vote: (input: Omit<Parameters<typeof recordVote>[1], 'tenantId'>) =>
      recordVote(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    assessReferee: (input: Omit<Parameters<typeof assessReferee>[1], 'tenantId'>) =>
      assessReferee(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    assistFacts: (input: Omit<Parameters<typeof assistFacts>[1], 'tenantId'>) =>
      assistFacts(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    persistSuggestion: (input: Omit<Parameters<typeof persistSuggestion>[1], 'tenantId'>) =>
      persistSuggestion(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    authorize: (input: Omit<Parameters<typeof authorizeIssuance>[1], 'tenantId'>) =>
      authorizeIssuance(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    releaseExamPass: (input: Omit<Parameters<typeof releaseExamPass>[1], 'tenantId'>) =>
      releaseExamPass(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    education: (userId: string) => listEducation(this.prisma, this.requiredTenantId(), userId),
    examPasses: (userId: string) => listExamPasses(this.prisma, this.requiredTenantId(), userId),
    publicDocument: (input: { verificationId: string; sourceIp: string; now: Date }) =>
      publicDocument(this.prisma, input),
    publicPdf: (input: { verificationId: string; sourceIp: string; now: Date }) =>
      publicDocumentPdf(this.prisma, input),
    setNameConsent: (input: Omit<Parameters<typeof setDocumentNameConsent>[1], 'tenantId'>) =>
      setDocumentNameConsent(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    noteEducation: (enrolmentId: string) =>
      maybeIssueEducation(this.prisma, {
        tenantId: this.requiredTenantId(),
        enrolmentId,
        now: new Date(),
      }),
    noteExamPass: (resultId: string) =>
      maybeIssueExamPass(this.prisma, {
        tenantId: this.requiredTenantId(),
        resultId,
        now: new Date(),
      }),
  };

  readonly aiBudget = {
    reserve: (now: Date, units: number, costMinor: number) =>
      reserveAiBudget(this.prisma, this.requiredTenantId(), now, units, costMinor),
    release: (now: Date, units: number, costMinor: number) =>
      releaseAiBudget(this.prisma, this.requiredTenantId(), now, units, costMinor),
  };

  readonly notices = {
    list: (userId: string) => listInAppNotices(this.prisma, this.requiredTenantId(), userId),
    read: (input: Omit<Parameters<typeof markNoticeRead>[1], 'tenantId'>) =>
      markNoticeRead(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    remind: (input: Omit<Parameters<typeof enqueueDueReminders>[1], 'tenantId'>) =>
      enqueueDueReminders(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    drain: (now: Date, transport: EmailTransport) =>
      drainNoticeQueue(this.prisma, { tenantId: this.requiredTenantId(), now, transport }),
    bounce: (input: Omit<Parameters<typeof markNoticeBounce>[1], 'tenantId'>) =>
      markNoticeBounce(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    complaint: (input: Omit<Parameters<typeof markNoticeComplaint>[1], 'tenantId'>) =>
      markNoticeComplaint(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
  };

  readonly fees = {
    save: (input: Omit<Parameters<typeof saveSchemeFee>[1], 'tenantId'>) =>
      saveSchemeFee(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    read: (input: Omit<Parameters<typeof readSchemeFee>[1], 'tenantId'>) =>
      readSchemeFee(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    listMine: (userId: string) => listHolderFees(this.prisma, this.requiredTenantId(), userId),
    openCase: (input: Omit<Parameters<typeof openNonPaymentCase>[1], 'tenantId'>) =>
      openNonPaymentCase(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    chargeRecertification: (input: Omit<Parameters<typeof chargeRecertification>[1], 'tenantId'>) =>
      chargeRecertification(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
    includeFirstYear: (input: Omit<Parameters<typeof includeFirstYear>[1], 'tenantId'>) =>
      includeFirstYear(this.prisma, { ...input, tenantId: this.requiredTenantId() }),
  };

  private requiredTenantId(): string {
    return this.tenantContext.getRequiredTenantId();
  }

  private learningClient(): LearningClient {
    return this.prisma;
  }

  private examClient(): ExamClient {
    return this.prisma;
  }

  // Explicit denial surface for contract tests — methods must not exist as writable API.
  create = undefined;
  createMany = undefined;
  update = undefined;
  updateMany = undefined;
  upsert = undefined;
  delete = undefined;
  deleteMany = undefined;
  $transaction = undefined;
  $queryRaw = undefined;
  $queryRawUnsafe = undefined;
  $executeRaw = undefined;
  $executeRawUnsafe = undefined;
}
