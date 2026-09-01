export const AUDIT_ACTOR_REQUIRED = 'AUDIT_ACTOR_REQUIRED' as const;
export const AUDIT_TENANT_CONTEXT_MISMATCH = 'AUDIT_TENANT_CONTEXT_MISMATCH' as const;
export const AUDIT_EVENT_NOT_REGISTERED = 'AUDIT_EVENT_NOT_REGISTERED' as const;
export const AUDIT_SENSITIVE_DATA_FORBIDDEN = 'AUDIT_SENSITIVE_DATA_FORBIDDEN' as const;
export const AUDIT_METADATA_INVALID = 'AUDIT_METADATA_INVALID' as const;
export const AUDIT_METADATA_TOO_LARGE = 'AUDIT_METADATA_TOO_LARGE' as const;
export const AUDIT_IDEMPOTENCY_CONFLICT = 'AUDIT_IDEMPOTENCY_CONFLICT' as const;
export const AUDIT_INVALID_OCCURRED_AT = 'AUDIT_INVALID_OCCURRED_AT' as const;
export const AUDIT_RETRY_EXHAUSTED = 'AUDIT_RETRY_EXHAUSTED' as const;
export const AUDIT_INVALID_INPUT = 'AUDIT_INVALID_INPUT' as const;
export const AUDIT_INVALID_OUTCOME = 'AUDIT_INVALID_OUTCOME' as const;
export const AUDIT_CHAIN_INTEGRITY_FAILED = 'AUDIT_CHAIN_INTEGRITY_FAILED' as const;
export const AUDIT_APPEND_FAILED = 'AUDIT_APPEND_FAILED' as const;

export type AuditErrorCode =
  | typeof AUDIT_ACTOR_REQUIRED
  | typeof AUDIT_TENANT_CONTEXT_MISMATCH
  | typeof AUDIT_EVENT_NOT_REGISTERED
  | typeof AUDIT_SENSITIVE_DATA_FORBIDDEN
  | typeof AUDIT_METADATA_INVALID
  | typeof AUDIT_METADATA_TOO_LARGE
  | typeof AUDIT_IDEMPOTENCY_CONFLICT
  | typeof AUDIT_INVALID_OCCURRED_AT
  | typeof AUDIT_RETRY_EXHAUSTED
  | typeof AUDIT_INVALID_INPUT
  | typeof AUDIT_INVALID_OUTCOME
  | typeof AUDIT_CHAIN_INTEGRITY_FAILED
  | typeof AUDIT_APPEND_FAILED;

/**
 * Fail-closed audit error. Message must never echo rejected secrets or PII payloads.
 */
export class AuditError extends Error {
  readonly code: AuditErrorCode;

  constructor(code: AuditErrorCode, message: string) {
    super(message);
    this.name = 'AuditError';
    this.code = code;
  }
}
