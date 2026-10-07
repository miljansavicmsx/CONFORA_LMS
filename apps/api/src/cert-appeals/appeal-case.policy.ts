import { Injectable } from '@nestjs/common';
import { PRIVILEGED_ROLES, rbacRoleSchema } from '@confora/shared-types';

import {
  APPEAL_MUTATION_FORBIDDEN_ROLES,
  APPEAL_OPERATIONS,
  APPEAL_OUTCOME_AUTHORITY,
  APPEAL_POLICY_EFFECT,
  APPELLANT_AUTHORITY,
  AUTHENTICATED_APPELLANT_ROLES,
  CERTIFICATION_APPEAL_DOMAIN,
  LEGACY_APPEALS_COMMITTEE_LABEL,
  type AppealOperation,
  type AppealPolicyDenialCode,
  type AppealPolicyResult,
  type AuthenticatedAppellantClassification,
  type AuthenticatedAppellantRole,
  type ServerDerivedAppealActor,
} from './appeal-case.types';

const TOP_LEVEL_KEYS: readonly string[] = [
  'domain',
  'operation',
  'actor',
  'appealTenantId',
  'internalCaseId',
  'certificationDecisionReference',
  'originalDecisionMakerUserId',
  'appellant',
  'committeeId',
];

const ACTOR_KEYS: readonly string[] = ['userId', 'tenantId', 'roles', 'mfaVerified'];

const APPELLANT_KEYS: readonly string[] = ['kind', 'role', 'userId'];

const PRIVILEGED_ROLE_LIST: readonly string[] = PRIVILEGED_ROLES;
const FORBIDDEN_MUTATION_ROLE_LIST: readonly string[] = APPEAL_MUTATION_FORBIDDEN_ROLES;
const APPELLANT_ROLE_LIST: readonly string[] = AUTHENTICATED_APPELLANT_ROLES;
const OPERATION_LIST: readonly string[] = APPEAL_OPERATIONS;
const CANONICAL_ROLE_LIST: readonly string[] = rbacRoleSchema.options;

const IDENTIFIER_MAX_LENGTH = 128;

/** Frozen authority map. Every executable operation stays unassigned. */
export const APPEAL_OPERATION_AUTHORITY = Object.freeze({
  ACKNOWLEDGE: APPEAL_OUTCOME_AUTHORITY,
  VOID: APPEAL_OUTCOME_AUTHORITY,
  START: APPEAL_OUTCOME_AUTHORITY,
  RECORD_OUTCOME: APPEAL_OUTCOME_AUTHORITY,
} as const);

type ActorDraft = ServerDerivedAppealActor & {
  readonly legacyCommitteeLabel: boolean;
};

function deny(code: AppealPolicyDenialCode): AppealPolicyResult {
  return Object.freeze({
    allowed: false,
    effect: APPEAL_POLICY_EFFECT,
    code,
  });
}

function isDenial(
  value: ActorDraft | AuthenticatedAppellantClassification | AppealPolicyResult,
): value is AppealPolicyResult {
  return 'allowed' in value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  const keys = Object.keys(value);
  for (const key of keys) {
    if (!allowed.includes(key)) {
      return false;
    }
  }
  return true;
}

function isIdentifier(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= IDENTIFIER_MAX_LENGTH &&
    value === value.trim() &&
    !/\s/u.test(value)
  );
}

function isCanonicalRole(value: unknown): value is string {
  return typeof value === 'string' && rbacRoleSchema.safeParse(value).success;
}

function isAppellantRole(value: string): value is AuthenticatedAppellantRole {
  return APPELLANT_ROLE_LIST.includes(value);
}

function isOperation(value: unknown): value is AppealOperation {
  return typeof value === 'string' && OPERATION_LIST.includes(value);
}

function isRoleLabel(value: string): boolean {
  return value === LEGACY_APPEALS_COMMITTEE_LABEL || CANONICAL_ROLE_LIST.includes(value);
}

function listIncludes(list: readonly string[], value: string): boolean {
  return list.includes(value);
}

/**
 * Classifies an authenticated appellant from server-derived values.
 * USR_CAND and USR_CERT are classification only. Authority stays none.
 */
export function classifyAuthenticatedAppellant(
  serverDerivedRole: string,
  serverDerivedUserId: string,
): AuthenticatedAppellantClassification | AppealPolicyResult {
  if (!isIdentifier(serverDerivedUserId)) {
    return deny('AUTHENTICATED_APPELLANT_REQUIRED');
  }
  if (!isAppellantRole(serverDerivedRole)) {
    return deny('APPELLANT_ROLE_NOT_ELIGIBLE');
  }
  return Object.freeze({
    kind: 'AUTHENTICATED_APPELLANT',
    role: serverDerivedRole,
    userId: serverDerivedUserId,
    authority: APPELLANT_AUTHORITY,
  });
}

function parseActor(value: unknown): ActorDraft | AppealPolicyResult {
  if (!isPlainObject(value)) {
    return deny('ACTOR_CONTEXT_REQUIRED');
  }
  if (!hasOnlyKeys(value, ACTOR_KEYS)) {
    return deny('INVALID_APPEAL_POLICY_INPUT');
  }
  if (!isIdentifier(value['userId'])) {
    return deny('ACTOR_USER_IDENTIFIER_REQUIRED');
  }
  if (!Array.isArray(value['roles'])) {
    return deny('ACTOR_CONTEXT_REQUIRED');
  }
  if (typeof value['mfaVerified'] !== 'boolean') {
    return deny('ACTOR_CONTEXT_REQUIRED');
  }
  if (!isIdentifier(value['tenantId'])) {
    return deny('ACTOR_TENANT_REQUIRED');
  }

  const roles: string[] = [];
  let legacyCommitteeLabel = false;
  for (const role of value['roles']) {
    if (role === LEGACY_APPEALS_COMMITTEE_LABEL) {
      legacyCommitteeLabel = true;
      continue;
    }
    if (!isCanonicalRole(role)) {
      return deny('ACTOR_CONTEXT_REQUIRED');
    }
    roles.push(role);
  }

  return Object.freeze({
    userId: value['userId'],
    tenantId: value['tenantId'],
    roles: Object.freeze(roles),
    mfaVerified: value['mfaVerified'],
    legacyCommitteeLabel,
  });
}

function parseAppellant(value: unknown): AuthenticatedAppellantClassification | AppealPolicyResult {
  if (!isPlainObject(value)) {
    return deny('AUTHENTICATED_APPELLANT_REQUIRED');
  }
  if (!hasOnlyKeys(value, APPELLANT_KEYS)) {
    return deny('INVALID_APPEAL_POLICY_INPUT');
  }
  if (value['kind'] !== 'AUTHENTICATED') {
    return deny('AUTHENTICATED_APPELLANT_REQUIRED');
  }
  if (typeof value['role'] !== 'string' || typeof value['userId'] !== 'string') {
    return deny('AUTHENTICATED_APPELLANT_REQUIRED');
  }
  return classifyAuthenticatedAppellant(value['role'], value['userId']);
}

function committeeClaimDenial(committeeId: unknown): AppealPolicyResult | null {
  if (committeeId === undefined) {
    return null;
  }
  if (typeof committeeId !== 'string') {
    return deny('INVALID_APPEAL_POLICY_INPUT');
  }
  if (!isIdentifier(committeeId) || isRoleLabel(committeeId)) {
    return deny('APPEAL_COMMITTEE_AUTHORITY_NOT_DEFINED');
  }
  return null;
}

/**
 * Pure appeal-domain authorization policy.
 * Precedence is fixed. Every path returns a deny-only result.
 * No network, persistence, audit, clock, random, or identity-provider call.
 */
export function evaluateAppealCasePolicy(input: unknown): AppealPolicyResult {
  if (!isPlainObject(input) || !hasOnlyKeys(input, TOP_LEVEL_KEYS)) {
    return deny('INVALID_APPEAL_POLICY_INPUT');
  }
  if (input['domain'] !== CERTIFICATION_APPEAL_DOMAIN) {
    return deny('CERTIFICATION_APPEAL_DOMAIN_REQUIRED');
  }
  if (!isOperation(input['operation'])) {
    return deny('APPEAL_OPERATION_UNSUPPORTED');
  }
  if (!('actor' in input) || input['actor'] === undefined || input['actor'] === null) {
    return deny('ACTOR_CONTEXT_REQUIRED');
  }

  const actor = parseActor(input['actor']);
  if (isDenial(actor)) {
    return actor;
  }
  if (!('appealTenantId' in input) || !isIdentifier(input['appealTenantId'])) {
    return deny('APPEAL_TENANT_REQUIRED');
  }
  if (actor.tenantId !== input['appealTenantId']) {
    return deny('CROSS_TENANT_APPEAL_FORBIDDEN');
  }
  if (
    !isIdentifier(input['internalCaseId']) ||
    !isIdentifier(input['certificationDecisionReference']) ||
    !isIdentifier(input['originalDecisionMakerUserId'])
  ) {
    return deny('INVALID_APPEAL_POLICY_INPUT');
  }
  if (!('appellant' in input) || input['appellant'] === undefined || input['appellant'] === null) {
    return deny('AUTHENTICATED_APPELLANT_REQUIRED');
  }

  const appellant = parseAppellant(input['appellant']);
  if (isDenial(appellant)) {
    return appellant;
  }
  if (!isIdentifier(appellant.userId)) {
    return deny('AUTHENTICATED_APPELLANT_REQUIRED');
  }
  if (actorHasPrivilegedUnverifiedMfa(actor)) {
    return deny('MFA_REQUIRED');
  }
  if (actorHasForbiddenMutationRole(actor.roles)) {
    return deny('APPEAL_MUTATION_ROLE_FORBIDDEN');
  }
  if (actor.userId === input['originalDecisionMakerUserId']) {
    return deny('ORIGINAL_CERTIFICATION_DECISION_MAKER_FORBIDDEN');
  }
  if (actor.legacyCommitteeLabel || listIncludes(actor.roles, 'COM_APP')) {
    return deny('APPEAL_COMMITTEE_AUTHORITY_NOT_DEFINED');
  }

  const committeeDenial = committeeClaimDenial(input['committeeId']);
  if (committeeDenial !== null) {
    return committeeDenial;
  }

  return deny('APPEAL_OPERATION_AUTHORITY_NOT_ASSIGNED');
}

function actorHasPrivilegedUnverifiedMfa(actor: ActorDraft): boolean {
  if (actor.mfaVerified) {
    return false;
  }
  for (const role of actor.roles) {
    if (PRIVILEGED_ROLE_LIST.includes(role)) {
      return true;
    }
  }
  return false;
}

function actorHasForbiddenMutationRole(roles: readonly string[]): boolean {
  for (const role of roles) {
    if (FORBIDDEN_MUTATION_ROLE_LIST.includes(role)) {
      return true;
    }
  }
  return false;
}

@Injectable()
export class AppealCasePolicy {
  evaluate(input: unknown): AppealPolicyResult {
    return evaluateAppealCasePolicy(input);
  }
}
