import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const uuid = z.string().uuid();

export const listCoursesQuerySchema = z
  .object({
    areaCode: z.string().trim().min(1).max(64).optional(),
  })
  .strict();

export class ListCoursesQueryDto extends createZodDto(listCoursesQuerySchema) {}

export const enrolBodySchema = z
  .object({
    courseId: uuid,
  })
  .strict();

export class EnrolBodyDto extends createZodDto(enrolBodySchema) {}

export const lessonProgressBodySchema = z
  .object({
    additionalSeconds: z.number().int().min(0).max(86_400),
    statementId: uuid,
    analyticsConsent: z.boolean().optional(),
  })
  .strict();

export class LessonProgressBodyDto extends createZodDto(lessonProgressBodySchema) {}

export const quizAttemptBodySchema = z
  .object({
    statementId: uuid,
    analyticsConsent: z.boolean().optional(),
    answers: z
      .array(
        z
          .object({
            itemId: uuid,
            choiceKey: z.string().trim().min(1).max(16),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict();

export class QuizAttemptBodyDto extends createZodDto(quizAttemptBodySchema) {}

export const analyticsConsentBodySchema = z
  .object({
    granted: z.boolean(),
  })
  .strict();

export class AnalyticsConsentBodyDto extends createZodDto(analyticsConsentBodySchema) {}
