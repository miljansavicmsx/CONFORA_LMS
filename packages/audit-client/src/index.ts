import { z } from 'zod';

const auditOutcomeSchema = z.enum(['success', 'failure', 'blocked', 'denied']);

const auditMetadataSchema = z.record(z.string(), z.unknown());

/**
 * Canonical append payload for PostgreSQL audit.audit_events (HTTP POST /v1/audit).
 * Tenant-scoped events must include tenantId; platform aggregate events must set platformScope.
 */
export const auditLedgerAppendSchema = z
  .object({
    action: z.string().min(1),
    actorId: z.string().uuid().optional(),
    tenantId: z.string().uuid().optional(),
    /** When true, tenantId is mandatory (explicit tenant-scoped compliance event). */
    tenantScoped: z.boolean().optional(),
    /** When true, event is a platform-level aggregate/admin action (tenantId optional). */
    platformScope: z.boolean().optional(),
    resourceType: z.string().min(1).optional(),
    /** @deprecated use resourceType */
    resource: z.string().min(1).optional(),
    resourceId: z.string().uuid().optional(),
    correlationId: z.string().min(1).optional(),
    requestId: z.string().min(1).optional(),
    outcome: auditOutcomeSchema.optional(),
    sourceService: z.string().min(1).optional(),
    oldValue: z.unknown().optional(),
    newValue: z.unknown().optional(),
    metadata: auditMetadataSchema.optional(),
    isAiGenerated: z.boolean().optional(),
    aiModelVersion: z.string().optional(),
    /** Regulated events must not be silently dropped when persistence fails. */
    regulated: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const tenantScoped =
      data.tenantScoped === true ||
      (data.tenantScoped !== false && data.tenantId != null && data.platformScope !== true);
    if (tenantScoped && !data.tenantId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'tenantId is required for tenant-scoped audit events',
        path: ['tenantId'],
      });
    }
    if (data.platformScope === true && data.tenantScoped === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'platformScope and tenantScoped are mutually exclusive',
        path: ['platformScope'],
      });
    }
    if (data.regulated === true && !data.action) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'regulated events require a canonical action code',
        path: ['action'],
      });
    }
  });

export type AuditLedgerAppendInput = z.infer<typeof auditLedgerAppendSchema>;

/** @deprecated use auditLedgerAppendSchema */
export const auditEventSchema = auditLedgerAppendSchema;

export type AuditEventInput = AuditLedgerAppendInput;

export type AuditClientConfig = {
  /** Base URL for the Audit Ledger ingest endpoint (Nest `apps/api`). */
  baseUrl: string;
  /** Optional bearer token for staff/system calls. */
  getAccessToken?: () => Promise<string | undefined>;
};

/**
 * Append-only Audit Ledger client. Domain services should call this
 * for every mutating operation per ISO/IEC 17024 record-keeping requirements.
 */
export function createAuditClient(config: AuditClientConfig) {
  const parsed = z
    .object({
      baseUrl: z.string().url(),
    })
    .parse({ baseUrl: config.baseUrl });

  return {
    async append(event: AuditLedgerAppendInput): Promise<void> {
      const body = auditLedgerAppendSchema.parse(event);
      const headers: Record<string, string> = {
        'content-type': 'application/json',
      };
      const token = await config.getAccessToken?.();
      if (token) {
        headers['authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${parsed.baseUrl}/v1/audit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const detail = body.regulated
          ? ` (regulated action ${body.action})`
          : '';
        throw new Error(`Audit append failed: ${String(response.status)}${detail}`);
      }
    },
  };
}
