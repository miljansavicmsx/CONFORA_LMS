import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const uuid = z.string().uuid();

export class OpenCaseDto extends createZodDto(
  z
    .object({
      schemeVersionId: uuid,
      path: z.enum(['CONFORA_EDUCATION', 'DIRECT']),
      prerequisitesAcknowledged: z.literal(true),
      certificationApplicationId: uuid,
      experienceMonths: z.number().int().min(0).max(600).default(0),
    })
    .strict(),
) {}

export class EvidenceDto extends createZodDto(
  z
    .object({
      kind: z.enum(['EDUCATION', 'QUALIFICATION', 'EXPERIENCE', 'WORK', 'OTHER']),
      title: z.string().trim().min(2).max(256),
      summary: z.string().trim().max(4000).optional(),
      objectKey: z.string().trim().max(512).optional(),
    })
    .strict(),
) {}

export class DossierDto extends createZodDto(
  z.object({ experienceMonths: z.number().int().min(0).max(600) }).strict(),
) {}

export class LinkExamDto extends createZodDto(z.object({ resultId: uuid }).strict()) {}

export class RefereeRequestDto extends createZodDto(
  z
    .object({
      refereeName: z.string().trim().min(2).max(256),
      organization: z.string().trim().min(2).max(256),
      email: z.string().trim().email().max(256),
      requestedFacts: z.string().trim().min(3).max(4000),
    })
    .strict(),
) {}

export class RefereeResponseDto extends createZodDto(
  z
    .object({
      accept: z.boolean(),
      confirmedFacts: z.string().trim().max(4000).optional(),
      discrepancies: z.string().trim().max(4000).optional(),
    })
    .strict(),
) {}

export class LevelDto extends createZodDto(
  z
    .object({
      code: z.string().trim().min(2).max(32),
      title: z.string().trim().min(2).max(128),
      rank: z.number().int().min(1).max(20),
      minExperienceMonths: z.number().int().min(0).max(600),
      requiresExamPass: z.boolean(),
    })
    .strict(),
) {}

export class DecisionMakerDto extends createZodDto(
  z
    .object({
      userId: uuid,
      competenceNote: z.string().trim().min(3).max(4000),
      authorisedFrom: z.string().datetime(),
      authorisedUntil: z.string().datetime(),
    })
    .strict(),
) {}

export class CaseRuleDto extends createZodDto(
  z
    .object({
      votingQuorum: z.number().int().min(1).max(15),
      experienceMayFollowExam: z.boolean(),
      experienceMode: z.enum(['INDEPENDENT_REFERENCES', 'OTHER_VERIFIABLE_EVIDENCE']),
      referenceCount: z.number().int().min(0).max(10),
    })
    .strict(),
) {}

export class ProposeDto extends createZodDto(
  z.object({ declaredConflictUserIds: z.array(uuid).max(30).default([]) }).strict(),
) {}

export class ConfirmSlotDto extends createZodDto(z.object({ memberUserId: uuid }).strict()) {}

export class VoteDto extends createZodDto(
  z
    .object({
      ballot: z.enum(['GRANT', 'DENY']),
      reasoning: z.string().trim().min(3).max(4000),
    })
    .strict(),
) {}

export class RefereeAssessmentDto extends createZodDto(
  z
    .object({
      refereeId: uuid,
      relevanceNote: z.string().trim().min(3).max(4000),
      credible: z.boolean(),
    })
    .strict(),
) {}

export class AssistDto extends createZodDto(
  z
    .object({
      purpose: z.enum(['completeness', 'summary', 'inconsistencies', 'committee', 'notification']),
    })
    .strict(),
) {}

export class AuthorizeIssuanceDto extends createZodDto(
  z
    .object({
      holderDisplayName: z.string().trim().min(2).max(256),
      registryConsent: z.boolean(),
      note: z.string().trim().min(3).max(2000),
    })
    .strict(),
) {}
