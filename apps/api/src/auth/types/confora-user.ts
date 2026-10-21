/**
 * Historical actor shape used by the non-shipping wallet helper.
 * BAR-P03 request principals use AuthenticatedActor instead.
 */
export type ConforaUser = {
  readonly sub: string;
  readonly payload: {
    readonly sub?: string;
    readonly email?: string;
    readonly tenant_id?: string;
    readonly realm_access?: { readonly roles?: readonly string[] };
  };
  readonly roles: readonly string[];
  readonly scope: readonly string[];
  readonly mfaVerified: boolean;
  readonly amr: readonly string[];
  readonly tenantContext?: {
    readonly tenantId: string;
    readonly claimSource: string;
    readonly isPlatformScope: boolean;
  };
};
