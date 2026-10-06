import { ROLE_ADMINISTRATION_POLICY_CODES } from '@confora/shared-types';

import type { AuthenticatedActor } from '../auth/request-principal';
import {
  ROLE_ADMINISTRATION_BOUNDARY_REJECTION_CODES,
  type RoleAdministrationBoundaryRejectionCode,
} from './role-administration-boundary.types';

/**
 * PKG-02 provider-neutral port.
 * A later workflow may request an external role change through this port.
 * This package does not select a provider and does not apply a role.
 */
export const EXTERNAL_IDP_ROLE_MANAGEMENT_REJECTION_CODES = [
  'UNSUPPORTED_OPERATION',
  'MANAGED_ROLE_FORBIDDEN',
  'PROVIDER_UNBOUND',
  'CONFIGURATION_REJECTED',
] as const;

export type ExternalIdpRoleManagementPortCode =
  (typeof EXTERNAL_IDP_ROLE_MANAGEMENT_REJECTION_CODES)[number];

export type ExternalIdpRoleManagementRejectionCode =
  | RoleAdministrationBoundaryRejectionCode
  | ExternalIdpRoleManagementPortCode;

const REJECTION_ORDER: readonly string[] = [
  ...ROLE_ADMINISTRATION_BOUNDARY_REJECTION_CODES,
  ...ROLE_ADMINISTRATION_POLICY_CODES,
  ...EXTERNAL_IDP_ROLE_MANAGEMENT_REJECTION_CODES,
];

/**
 * Empty configuration only. A provider, host, realm, secret, token,
 * or client credential is not representable and is rejected at runtime.
 */
export type UnboundExternalIdpConfiguration = {
  readonly [key: string]: never;
};

export type ExternalIdpRoleManagementResult = {
  readonly accepted: false;
  readonly effect: 'UNBOUND_NO_APPLY';
  readonly roleApplied: false;
  readonly networkCalled: false;
  readonly persistenceCalled: false;
  readonly auditAppended: false;
  readonly idpCalled: false;
  readonly codes: readonly ExternalIdpRoleManagementRejectionCode[];
};

export abstract class ExternalIdpRoleManagementPort {
  abstract requestRoleChange(
    actor: AuthenticatedActor | null | undefined,
    command: unknown,
  ): ExternalIdpRoleManagementResult;
}

export function externalIdpRoleManagementRejection(
  codes: readonly ExternalIdpRoleManagementRejectionCode[],
): ExternalIdpRoleManagementResult {
  const unique = [...new Set(codes)];
  unique.sort((left, right) => REJECTION_ORDER.indexOf(left) - REJECTION_ORDER.indexOf(right));
  return Object.freeze({
    accepted: false,
    effect: 'UNBOUND_NO_APPLY',
    roleApplied: false,
    networkCalled: false,
    persistenceCalled: false,
    auditAppended: false,
    idpCalled: false,
    codes: Object.freeze(unique),
  });
}
