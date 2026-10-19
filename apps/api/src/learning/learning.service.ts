import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import type { AuthenticatedActor } from '../auth/request-principal';
import { AuditService } from '../audit/audit.service';
import { LearningNotFoundError } from '../prisma/learning-tenant-store';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { LearningRuleError } from './learning-rules';

function mapLearningError(error: unknown): never {
  if (error instanceof LearningNotFoundError) {
    throw new NotFoundException();
  }
  if (error instanceof LearningRuleError) {
    throw new BadRequestException(error.code);
  }
  throw error;
}

@Injectable()
export class LearningService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly audit: AuditService,
  ) {}

  listCourses(areaCode?: string) {
    return this.tenantPrisma.learning.listPublishedCourses(areaCode).catch(mapLearningError);
  }

  getCourse(courseId: string) {
    return this.tenantPrisma.learning.getPublishedCourse(courseId).catch(mapLearningError);
  }

  listEnrolments(actor: AuthenticatedActor) {
    return this.tenantPrisma.learning.listMyEnrolments(actor.userId).catch(mapLearningError);
  }

  getPlayer(actor: AuthenticatedActor, enrolmentId: string) {
    return this.tenantPrisma.learning.getPlayer(actor.userId, enrolmentId).catch(mapLearningError);
  }

  statistics(actor: AuthenticatedActor) {
    return this.tenantPrisma.learning.statistics(actor.userId).catch(mapLearningError);
  }

  getConsent(actor: AuthenticatedActor) {
    return this.tenantPrisma.learning.getAnalyticsConsent(actor.userId).catch(mapLearningError);
  }

  setConsent(actor: AuthenticatedActor, granted: boolean) {
    return this.tenantPrisma.learning
      .setAnalyticsConsent({ userId: actor.userId, granted, now: new Date() })
      .catch(mapLearningError);
  }

  async enrol(actor: AuthenticatedActor, courseId: string) {
    const now = new Date();
    const result = await this.tenantPrisma.learning
      .enrol({ userId: actor.userId, courseId, now })
      .catch(mapLearningError);
    if (!result.alreadyEnrolled) {
      await this.audit.append(actor, {
        idempotencyKey: result.statementId,
        eventType: 'LEARNING_COURSE_ENROLLED',
        outcome: 'SUCCESS',
        occurredAt: now,
        resourceType: 'Enrolment',
        resourceId: result.enrolmentId,
        metadata: {
          courseId: result.courseId,
          enrolmentId: result.enrolmentId,
          statementId: result.statementId,
          paymentState: result.paymentState,
          analyticsConsent: result.analyticsConsent,
        },
      });
    }
    return result;
  }

  async recordProgress(
    actor: AuthenticatedActor,
    enrolmentId: string,
    lessonId: string,
    body: { additionalSeconds: number; statementId: string; analyticsConsent?: boolean },
  ) {
    const now = new Date();
    const result = await this.tenantPrisma.learning
      .recordLessonProgress({
        userId: actor.userId,
        enrolmentId,
        lessonId,
        additionalSeconds: body.additionalSeconds,
        statementId: body.statementId,
        ...(body.analyticsConsent !== undefined ? { analyticsConsent: body.analyticsConsent } : {}),
        now,
      })
      .catch(mapLearningError);
    await this.audit.append(actor, {
      idempotencyKey: result.statementId,
      eventType: 'LEARNING_LESSON_PROGRESS_RECORDED',
      outcome: 'SUCCESS',
      occurredAt: now,
      resourceType: 'LessonProgress',
      resourceId: result.lessonId,
      metadata: {
        enrolmentId,
        lessonId: result.lessonId,
        statementId: result.statementId,
        analyticsConsent: result.analyticsConsent,
      },
    });
    return result;
  }

  async submitQuiz(
    actor: AuthenticatedActor,
    enrolmentId: string,
    quizId: string,
    body: {
      statementId: string;
      answers: readonly { itemId: string; choiceKey: string }[];
      analyticsConsent?: boolean;
    },
  ) {
    const now = new Date();
    const result = await this.tenantPrisma.learning
      .submitChapterQuiz({
        userId: actor.userId,
        enrolmentId,
        quizId,
        statementId: body.statementId,
        answers: body.answers,
        ...(body.analyticsConsent !== undefined ? { analyticsConsent: body.analyticsConsent } : {}),
        now,
      })
      .catch(mapLearningError);
    await this.audit.append(actor, {
      idempotencyKey: result.statementId,
      eventType: 'LEARNING_QUIZ_ATTEMPTED',
      outcome: 'SUCCESS',
      occurredAt: now,
      resourceType: 'ChapterQuizAttempt',
      resourceId: result.attemptId,
      metadata: {
        enrolmentId,
        quizId: result.quizId,
        statementId: result.statementId,
        scorePercent: result.scorePercent,
        passed: result.passed,
        analyticsConsent: result.analyticsConsent,
      },
    });
    return result;
  }
}
