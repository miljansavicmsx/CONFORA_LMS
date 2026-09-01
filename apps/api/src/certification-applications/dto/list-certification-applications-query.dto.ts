import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const certificationApplicationStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
]);

export const listCertificationApplicationsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    status: certificationApplicationStatusSchema.optional(),
  })
  .strict();

export class ListCertificationApplicationsQueryDto extends createZodDto(
  listCertificationApplicationsQuerySchema,
) {}

export type CertificationApplicationStatusValue = z.infer<
  typeof certificationApplicationStatusSchema
>;
