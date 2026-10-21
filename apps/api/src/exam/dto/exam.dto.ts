import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const uuid = z.string().uuid();

const choiceSchema = z
  .object({
    choiceKey: z.string().trim().min(1).max(16),
    text: z.string().trim().min(1).max(4000),
    isCorrect: z.boolean(),
  })
  .strict();

export class CreateItemDto extends createZodDto(
  z
    .object({
      schemeId: uuid,
      stem: z.string().trim().min(1).max(8000),
      itemType: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE']),
      domainCode: z.string().trim().min(1).max(64),
      choices: z.array(choiceSchema).min(2).max(12),
      competenceIds: z.array(uuid).max(20),
    })
    .strict(),
) {}

export class UpdateDraftDto extends createZodDto(
  z
    .object({
      stem: z.string().trim().min(1).max(8000),
      choices: z.array(choiceSchema).min(2).max(12),
    })
    .strict(),
) {}

export class TransitionItemDto extends createZodDto(
  z
    .object({
      toStatus: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'RETIRED']),
      note: z.string().trim().min(1).max(2000).optional(),
    })
    .strict(),
) {}

export class CreateBlueprintDto extends createZodDto(
  z
    .object({
      schemeVersionId: uuid,
      title: z.string().trim().min(1).max(256),
      durationSeconds: z.number().int().min(60).max(28_800),
      retakeWindowDays: z.number().int().min(90).max(3650),
    })
    .strict(),
) {}

export class BlueprintDomainsDto extends createZodDto(
  z
    .object({
      domains: z
        .array(
          z
            .object({
              domainCode: z.string().trim().min(1).max(64),
              title: z.string().trim().min(1).max(256),
              weightBasisPoints: z.number().int().min(1).max(10_000),
              itemCount: z.number().int().min(1).max(200),
            })
            .strict(),
        )
        .min(1)
        .max(30),
    })
    .strict(),
) {}

export class OpenStandardSettingDto extends createZodDto(
  z.object({ note: z.string().trim().min(1).max(2000).optional() }).strict(),
) {}

export class StandardSettingRatingsDto extends createZodDto(
  z
    .object({
      ratings: z
        .array(
          z
            .object({
              itemId: uuid,
              probabilityBasisPoints: z.number().int().min(0).max(10_000),
            })
            .strict(),
        )
        .min(1)
        .max(200),
    })
    .strict(),
) {}

export class ConfirmIdentityDto extends createZodDto(
  z
    .object({
      documentType: z.enum(['PASSPORT', 'ID_CARD', 'DRIVING_LICENCE', 'RESIDENCE_PERMIT']),
    })
    .strict(),
) {}

export class ScheduleSessionDto extends createZodDto(
  z
    .object({
      formId: uuid,
      candidateUserId: uuid,
      certificationApplicationId: uuid,
      invigilatorUserId: uuid,
      scheduledStartAt: z.string().datetime(),
    })
    .strict(),
) {}

export class StartSessionDto extends createZodDto(
  z.object({ rulesAccepted: z.literal(true), ndaAccepted: z.literal(true) }).strict(),
) {}

export class SaveAnswersDto extends createZodDto(
  z
    .object({
      answers: z
        .array(
          z
            .object({
              itemId: uuid,
              selectedKeys: z.array(z.string().trim().min(1).max(16)).max(12),
            })
            .strict(),
        )
        .max(200),
    })
    .strict(),
) {}

export class ProctorFlagDto extends createZodDto(
  z
    .object({
      source: z.enum(['HUMAN', 'AI']),
      signalCode: z.string().trim().min(1).max(64),
    })
    .strict(),
) {}

export class ProctorReviewDto extends createZodDto(
  z
    .object({
      disposition: z.enum(['DISMISSED', 'CONFIRMED_FOR_REVIEW']),
      note: z.string().trim().min(1).max(2000).optional(),
    })
    .strict(),
) {}

export class RecordDecisionDto extends createZodDto(
  z
    .object({
      resultId: uuid,
      outcome: z.enum(['GRANT', 'DENY']),
      rationale: z.string().trim().min(1).max(4000),
    })
    .strict(),
) {}

export class ListItemsQueryDto extends createZodDto(
  z.object({ schemeId: uuid.optional() }).strict(),
) {}
