/** Branded tenant identifier (UUID string). */
export type TenantId = string & { readonly __brand: 'TenantId' };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Default tenant seeded in P0 migration (single-tenant backfill). */
export const DEFAULT_TENANT_ID = '00000000-0000-4000-8000-000000000001' as TenantId;

/** Second tenant id for isolation tests only — not seeded in production. */
export const TENANT_B_TEST_ID = '11111111-2222-3333-4444-555555555555' as TenantId;

export type TenantClaimSource = 'tenant_id' | 'tenantId' | 'org_id';

export function asTenantId(value: string): TenantId {
  if (!UUID_RE.test(value)) {
    throw new Error('Invalid tenant id: expected UUID');
  }
  return value as TenantId;
}

export function isTenantId(value: string): value is TenantId {
  return UUID_RE.test(value);
}

export interface TenantContext {
  /** Absent only for @PlatformScope platform-admin requests. */
  tenantId?: TenantId;
  claimSource?: TenantClaimSource;
  /** True when platform admin operates without a tenant claim (@PlatformScope). */
  isPlatformScope: boolean;
}

const CLAIM_KEYS: readonly TenantClaimSource[] = ['tenant_id', 'tenantId', 'org_id'];

/**
 * Extract tenant id from JWT / OIDC payload.
 * Supports canonical `tenant_id` and transitional `tenantId`, `org_id`.
 */
export function parseTenantClaim(
  payload: Record<string, unknown>,
): { tenantId: TenantId; claimSource: TenantClaimSource } | undefined {
  for (const key of CLAIM_KEYS) {
    const raw = payload[key];
    if (typeof raw === 'string' && raw.length > 0 && isTenantId(raw)) {
      return { tenantId: raw as TenantId, claimSource: key };
    }
  }
  return undefined;
}
