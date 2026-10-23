import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import {
  DIRECTORY_CONSENT_CHANNELS,
  DIRECTORY_CONSENT_EVIDENCE_REF,
  DIRECTORY_CONSENT_VERIFICATION_METHODS,
} from '../personnel-rules';

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

/** Intake record. The verifier is not named here. */
export class OpenDirectoryConsentRequestDto extends createZodDto(
  z
    .object({
      holderUserId: uuid,
      channel: z.enum(DIRECTORY_CONSENT_CHANNELS),
      receivedAt: z.string().datetime(),
    })
    .strict(),
) {}

/** Evidence reference only. The verifier is the authenticated user. */
export class VerifyDirectoryConsentDto extends createZodDto(
  z
    .object({
      verificationMethod: z.enum(DIRECTORY_CONSENT_VERIFICATION_METHODS),
      evidenceRef: z.string().regex(DIRECTORY_CONSENT_EVIDENCE_REF),
    })
    .strict(),
) {}

/** Execution reads the recorded request and verification. No verifier field. */
export class WithdrawDirectoryConsentDto extends createZodDto(z.object({}).strict()) {}

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
