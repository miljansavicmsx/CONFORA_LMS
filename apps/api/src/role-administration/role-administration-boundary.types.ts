import type { RoleAdministrationPolicyCode } from '@confora/shared-types';

/**
 * PKG-01 rejection codes that sit in front of the PKG-00 policy codes.
 * They describe the authenticated actor and the fail-closed state pairing.
 */
export const ROLE_ADMINISTRATION_BOUNDARY_REJECTION_CODES = [
  'ACTOR_NOT_AUTHENTICATED',
  'ACTOR_USER_ID_EMPTY',
  'ACTOR_SUBJECT_EMPTY',
  'ACTOR_TENANT_EMPTY',
  'ACTOR_TENANT_MISMATCH',
  'MFA_ASSURANCE_REQUIRED',
  'ACTOR_AUTHORITY_ROLE_MISSING',
  'ACTOR_DECISION_PARTY_MISMATCH',
  'COMMAND_SCHEMA_REJECTED',
  'LEGACY_ROLE_ALIAS_REJECTED',
  'INVALID_STATE_TRANSITION',
] as const;

export type RoleAdministrationBoundaryLocalCode =
  (typeof ROLE_ADMINISTRATION_BOUNDARY_REJECTION_CODES)[number];

export type RoleAdministrationBoundaryRejectionCode =
  | RoleAdministrationPolicyCode
  | RoleAdministrationBoundaryLocalCode;

export type RoleAdministrationBoundaryAccepted = {
  readonly accepted: true;
  readonly effect: 'POLICY_GATE_ONLY';
  readonly roleMutationPerformed: false;
  readonly auditAppended: false;
  readonly idpCalled: false;
};

export type RoleAdministrationBoundaryRejected = {
  readonly accepted: false;
  readonly codes: readonly RoleAdministrationBoundaryRejectionCode[];
};

export type RoleAdministrationBoundaryResult =
  | RoleAdministrationBoundaryAccepted
  | RoleAdministrationBoundaryRejected;

export const ACCEPTED_BOUNDARY_RESULT: RoleAdministrationBoundaryAccepted = Object.freeze({
  accepted: true,
  effect: 'POLICY_GATE_ONLY',
  roleMutationPerformed: false,
  auditAppended: false,
  idpCalled: false,
});
