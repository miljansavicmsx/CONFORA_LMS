import {
  roleAdministrationContractSchema,
  type RoleAdministrationContract,
} from '@confora/shared-types';

/**
 * Body fields that must never authenticate the caller or configure a provider.
 * Actor identity, roles, and tenant authority come from the server principal.
 */
export const ROLE_ADMINISTRATION_FORBIDDEN_COMMAND_KEYS = [
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

export type RoleAdministrationCommandParseResult =
  | { readonly ok: true; readonly command: RoleAdministrationContract }
  | {
      readonly ok: false;
      readonly codes: readonly ['COMMAND_FIELD_FORBIDDEN'] | readonly ['COMMAND_SCHEMA_REJECTED'];
    };

/**
 * PKG-03 command parser.
 * Unknown contract fields fail closed. Provider, secret, and actor-authority
 * fields are rejected before schema diagnostics are returned.
 */
export function parseRoleAdministrationCommandDto(
  body: unknown,
): RoleAdministrationCommandParseResult {
  if (containsForbiddenKey(body, 0)) {
    return { ok: false, codes: ['COMMAND_FIELD_FORBIDDEN'] };
  }
  const parsed = roleAdministrationContractSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, codes: ['COMMAND_SCHEMA_REJECTED'] };
  }
  return { ok: true, command: parsed.data };
}
