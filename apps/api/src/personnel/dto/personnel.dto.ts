import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const uuid = z.string().uuid();

export class IssueCertificateDto extends createZodDto(
  z
    .object({
      decisionId: uuid,
      holderDisplayName: z.string().trim().min(2).max(256),
      registryConsent: z.boolean(),
    })
    .strict(),
) {}

export class ChangeCertificateStatusDto extends createZodDto(
  z
    .object({
      toStatus: z.enum(['ACTIVE', 'SUSPENDED', 'WITHDRAWN']),
      reason: z.string().trim().min(3).max(2000),
    })
    .strict(),
) {}

export class AmfProposalDto extends createZodDto(
  z.object({ reason: z.string().trim().min(3).max(2000) }).strict(),
) {}

export class CpdRecordDto extends createZodDto(
  z
    .object({
      title: z.string().trim().min(2).max(256),
      hours: z.number().positive().max(200),
      completedAt: z.string().datetime(),
    })
    .strict(),
) {}

/** `number` is accepted so a sequential record number can be refused. It does not select a certificate. */
export class PublicSearchDto extends createZodDto(
  z
    .object({
      number: z.string().trim().min(4).max(32).optional(),
      name: z.string().trim().min(3).max(256).optional(),
    })
    .strict(),
) {}
