import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const uuid = z.string().uuid();

export class SchemeFeeDto extends createZodDto(
  z
    .object({
      annualAmountMinor: z.number().int().min(0).max(10_000_000),
      currency: z
        .string()
        .trim()
        .regex(/^[A-Z]{3}$/),
      firstYearIncluded: z.boolean(),
      recertificationSeparate: z.boolean(),
    })
    .strict(),
) {}

export class NonPaymentDto extends createZodDto(
  z
    .object({
      credentialId: uuid,
      year: z.number().int().min(2000).max(2100),
      reason: z.string().trim().min(3).max(2000),
    })
    .strict(),
) {}

export class RecertificationFeeDto extends createZodDto(
  z
    .object({
      credentialId: uuid,
      year: z.number().int().min(2000).max(2100),
    })
    .strict(),
) {}
