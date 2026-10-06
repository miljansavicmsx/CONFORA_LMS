import {
  roleAdministrationContractSchema,
  type RoleAdministrationContract,
} from '@confora/shared-types';

/**
 * Stable rejection for a client decision that only the server may record
 * after a confirmed external effect.
 */
export const CLIENT_APPLIED_DECISION_FORBIDDEN = 'CLIENT_APPLIED_DECISION_FORBIDDEN' as const;

/**
 * Body fields that must never authenticate the caller, select a tenant,
 * or configure a provider. Actor identity, roles, and tenant authority come
 * from the server principal.
 */
export const ROLE_ADMINISTRATION_FORBIDDEN_COMMAND_KEYS = [
  'tenantId',
  'tenant_id',
  'actorTenantId',
  'initiatorTenantId',
  'approverTenantId',
  'targetTenantId',
  'reviewerTenantId',
  'tenant',
  'organizationId',
  'orgId',
  'org_id',
  'provider',
  'providerType',
  'host',
  'baseUrl',
  'endpoint',
  'realm',
  'clientId',
  'clientSecret',
  'client_secret',
  'secret',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'credential',
  'credentials',
  'password',
  'privateKey',
  'roles',
  'actorRoles',
  'mfaVerified',
  'authorization',
  'rawJwt',
] as const;

const FORBIDDEN_KEYS: ReadonlySet<string> = new Set(ROLE_ADMINISTRATION_FORBIDDEN_COMMAND_KEYS);

/**
 * Client decisions. APPLIED and FAILED are server terminal states.
 * REVIEWED remains a client post-review request and is refused by the
 * workflow until a real applied revoke exists.
 */
const PUBLIC_DECISIONS: ReadonlySet<string> = new Set([
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'REVIEWED',
]);

const TRUSTED_TENANT_KEYS = [
  'tenantId',
  'initiatorTenantId',
  'approverTenantId',
  'targetTenantId',
  'actorTenantId',
  'reviewerTenantId',
] as const;

export type RoleAdministrationCommandCode =
  | 'COMMAND_FIELD_FORBIDDEN'
  | 'COMMAND_SCHEMA_REJECTED'
  | typeof CLIENT_APPLIED_DECISION_FORBIDDEN
  | 'ACTOR_TENANT_EMPTY';

export type RoleAdministrationCommandParseResult =
  | { readonly ok: true; readonly command: RoleAdministrationContract }
  | { readonly ok: false; readonly codes: readonly [RoleAdministrationCommandCode] };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function containsForbiddenKey(value: unknown, depth: number): boolean {
  if (depth > 4 || value === null || typeof value !== 'object') {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some((item) => containsForbiddenKey(item, depth + 1));
  }
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (FORBIDDEN_KEYS.has(key) || containsForbiddenKey(record[key], depth + 1)) {
      return true;
    }
  }
  return false;
}

/**
 * APPLIED is never a client command. Case variants are rejected rather than
 * normalized into the server decision.
 */
export function isClientAppliedDecision(value: unknown): boolean {
  if (!isPlainObject(value)) {
    return false;
  }
  const decision = value['decision'];
  return typeof decision === 'string' && decision.trim().toLowerCase() === 'applied';
}

function rejected(code: RoleAdministrationCommandCode): RoleAdministrationCommandParseResult {
  return { ok: false, codes: [code] };
}

/**
 * PKG-03 public command parser.
 * The client cannot supply tenant authority. The trusted actor tenant is
 * written onto the internal PKG-00 command after forbidden fields are refused.
 */
export function parseRoleAdministrationCommandDto(
  body: unknown,
  trustedTenantId: string,
): RoleAdministrationCommandParseResult {
  if (trustedTenantId.trim().length === 0) {
    return rejected('ACTOR_TENANT_EMPTY');
  }
  if (containsForbiddenKey(body, 0)) {
    return rejected('COMMAND_FIELD_FORBIDDEN');
  }
  if (isClientAppliedDecision(body)) {
    return rejected(CLIENT_APPLIED_DECISION_FORBIDDEN);
  }
  if (!isPlainObject(body)) {
    return rejected('COMMAND_SCHEMA_REJECTED');
  }
  const decision = body['decision'];
  if (typeof decision === 'string' && !PUBLIC_DECISIONS.has(decision)) {
    return rejected('COMMAND_SCHEMA_REJECTED');
  }

  const bound: Record<string, unknown> = { ...body };
  for (const key of TRUSTED_TENANT_KEYS) {
    bound[key] = trustedTenantId;
  }
  const parsed = roleAdministrationContractSchema.safeParse(bound);
  if (!parsed.success) {
    return rejected('COMMAND_SCHEMA_REJECTED');
  }
  return { ok: true, command: parsed.data };
}
