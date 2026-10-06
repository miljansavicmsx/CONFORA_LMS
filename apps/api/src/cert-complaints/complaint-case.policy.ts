import { Injectable } from '@nestjs/common';
import { PRIVILEGED_ROLES, rbacRoleSchema } from '@confora/shared-types';

import {
  ACKNOWLEDGE_AUTHORITY,
  AUTHENTICATED_INTAKE_ROLES,
  COMPLAINT_DOMAIN,
  COMPLAINT_MUTATION_FORBIDDEN_ROLES,
  COMPLAINT_OPERATIONS,
  COMPLAINT_POLICY_EFFECT,
  FINAL_DECISION_AUTHORITY,
  INVESTIGATE_AUTHORITY,
  RECOMMEND_AUTHORITY,
  UNAUTHENTICATED_PUBLIC_INTAKE,
  type AuthenticatedIntakeRole,
  type AuthenticatedLearnerIntake,
  type ComplaintOperation,
  type ComplaintPartyReference,
  type ComplaintPolicyActor,
  type ComplaintPolicyDenialCode,
  type ComplaintPolicyResult,
  type UnauthenticatedPublicIntakeReference,
} from './complaint-case.types';

const TOP_LEVEL_KEYS: ReadonlySet<string> = new Set([
  'domain',
  'operation',
  'actor',
  'caseTenantId',
  'internalCaseId',
  'intakeActor',
  'investigatorActor',
  'recommendationActor',
  'finalDecisionActor',
  'subjectActor',
]);

const ACTOR_KEYS: ReadonlySet<string> = new Set(['userId', 'tenantId', 'roles', 'mfaVerified']);

const PARTY_FIELDS = [
  'intakeActor',
  'investigatorActor',
  'recommendationActor',
  'finalDecisionActor',
  'subjectActor',
] as const;

type PartyField = (typeof PARTY_FIELDS)[number];

const PRIVILEGED_ROLE_SET: ReadonlySet<string> = new Set(PRIVILEGED_ROLES);
const FORBIDDEN_MUTATION_ROLE_SET: ReadonlySet<string> = new Set(
  COMPLAINT_MUTATION_FORBIDDEN_ROLES,
);
const INTAKE_ROLE_SET: ReadonlySet<string> = new Set(AUTHENTICATED_INTAKE_ROLES);
const OPERATION_SET: ReadonlySet<string> = new Set(COMPLAINT_OPERATIONS);

const IDENTIFIER_MAX_LENGTH = 128;

/** Frozen U1 authority map. Every operation stays unassigned. */
export const COMPLAINT_OPERATION_AUTHORITY = Object.freeze({
  ACKNOWLEDGE: ACKNOWLEDGE_AUTHORITY,
  INVESTIGATE: INVESTIGATE_AUTHORITY,
  RECOMMEND: RECOMMEND_AUTHORITY,
  FINAL_DECISION: FINAL_DECISION_AUTHORITY,
} as const);

type Parties = {
  readonly intakeActor?: ComplaintPartyReference;
  readonly investigatorActor?: ComplaintPartyReference;
  readonly recommendationActor?: ComplaintPartyReference;
  readonly finalDecisionActor?: ComplaintPartyReference;
  readonly subjectActor?: ComplaintPartyReference;
};

function deny(code: ComplaintPolicyDenialCode): ComplaintPolicyResult {
  return Object.freeze({
    allowed: false,
    effect: COMPLAINT_POLICY_EFFECT,
    code,
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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

function isIntakeRole(value: string): value is AuthenticatedIntakeRole {
  return INTAKE_ROLE_SET.has(value);
}

/**
 * Two public-intake markers carry no user identifier.
 * They cannot be proven to be different people, so the pair fails closed
 * as one actor. No user identifier is created.
 */
function sameParty(left: ComplaintPartyReference, right: ComplaintPartyReference): boolean {
  if (left.kind === 'AUTHENTICATED' && right.kind === 'AUTHENTICATED') {
    return left.userId === right.userId;
  }
  return (
    left.kind === 'UNAUTHENTICATED_PUBLIC_INTAKE' && right.kind === 'UNAUTHENTICATED_PUBLIC_INTAKE'
  );
}

function parseParty(value: unknown): ComplaintPartyReference | 'INVALID' {
  if (!isPlainObject(value)) {
    return 'INVALID';
  }
  const keys = Object.keys(value);
  if (value['kind'] === 'AUTHENTICATED') {
    if (keys.some((key) => key !== 'kind' && key !== 'userId')) {
      return 'INVALID';
    }
    if (!isIdentifier(value['userId'])) {
      return 'INVALID';
    }
    return { kind: 'AUTHENTICATED', userId: value['userId'] };
  }
  if (value['kind'] === 'UNAUTHENTICATED_PUBLIC_INTAKE') {
    if (keys.some((key) => key !== 'kind' && key !== 'classification' && key !== 'authority')) {
      return 'INVALID';
    }
    if (value['classification'] !== UNAUTHENTICATED_PUBLIC_INTAKE) {
      return 'INVALID';
    }
    if ('userId' in value) {
      return 'INVALID';
    }
    if (value['authority'] !== undefined && value['authority'] !== 'NONE') {
      return 'INVALID';
    }
    return {
      kind: 'UNAUTHENTICATED_PUBLIC_INTAKE',
      classification: UNAUTHENTICATED_PUBLIC_INTAKE,
      authority: 'NONE',
    };
  }
  return 'INVALID';
}

function parseParties(input: Record<string, unknown>): Parties | 'INVALID' {
  const parties: {
    -readonly [Key in PartyField]?: ComplaintPartyReference;
  } = {};
  for (const field of PARTY_FIELDS) {
    if (!(field in input) || input[field] === undefined) {
      continue;
    }
    const parsed = parseParty(input[field]);
    if (parsed === 'INVALID') {
      return 'INVALID';
    }
    parties[field] = parsed;
  }
  return parties;
}

function parseActor(value: unknown): ComplaintPolicyActor | ComplaintPolicyDenialCode {
  if (!isPlainObject(value)) {
    return 'ACTOR_CONTEXT_REQUIRED';
  }
  if (Object.keys(value).some((key) => !ACTOR_KEYS.has(key))) {
    return 'INVALID_COMPLAINT_POLICY_INPUT';
  }
  if (!isIdentifier(value['userId'])) {
    return 'ACTOR_CONTEXT_REQUIRED';
  }
  if (!Array.isArray(value['roles']) || !value['roles'].every(isCanonicalRole)) {
    return 'ACTOR_CONTEXT_REQUIRED';
  }
  if (typeof value['mfaVerified'] !== 'boolean') {
    return 'ACTOR_CONTEXT_REQUIRED';
  }
  if (!('tenantId' in value) || value['tenantId'] === undefined || value['tenantId'] === null) {
    return 'ACTOR_TENANT_REQUIRED';
  }
  if (typeof value['tenantId'] === 'string' && value['tenantId'].trim().length === 0) {
    return 'ACTOR_TENANT_REQUIRED';
  }
  if (!isIdentifier(value['tenantId'])) {
    return 'INVALID_COMPLAINT_POLICY_INPUT';
  }
  return {
    userId: value['userId'],
    tenantId: value['tenantId'],
    roles: value['roles'],
    mfaVerified: value['mfaVerified'],
  };
}

function isOperation(value: unknown): value is ComplaintOperation {
  return typeof value === 'string' && OPERATION_SET.has(value);
}

function sodConflict(parties: Parties): ComplaintPolicyDenialCode | null {
  if (
    parties.intakeActor !== undefined &&
    parties.investigatorActor !== undefined &&
    sameParty(parties.intakeActor, parties.investigatorActor)
  ) {
    return 'INTAKE_INVESTIGATION_ACTOR_CONFLICT';
  }
  if (
    parties.intakeActor !== undefined &&
    parties.finalDecisionActor !== undefined &&
    sameParty(parties.intakeActor, parties.finalDecisionActor)
  ) {
    return 'INTAKE_FINAL_DECISION_ACTOR_CONFLICT';
  }
  if (
    parties.investigatorActor !== undefined &&
    parties.finalDecisionActor !== undefined &&
    sameParty(parties.investigatorActor, parties.finalDecisionActor)
  ) {
    return 'INVESTIGATION_FINAL_DECISION_ACTOR_CONFLICT';
  }
  return null;
}

/**
 * Classifies an authenticated learner intake subject from a server-derived
 * user identifier. The role argument is a server-derived role, not a client
 * claim. Classification grants no complaint operation.
 */
export function classifyAuthenticatedLearnerIntake(
  serverDerivedRole: string,
  serverDerivedUserId: string,
): AuthenticatedLearnerIntake | ComplaintPolicyResult {
  if (!isIntakeRole(serverDerivedRole) || !isIdentifier(serverDerivedUserId)) {
    return deny('INVALID_COMPLAINT_POLICY_INPUT');
  }
  return Object.freeze({
    kind: 'AUTHENTICATED_LEARNER',
    role: serverDerivedRole,
    userId: serverDerivedUserId,
    authority: 'NONE',
  });
}

/**
 * Classifies unauthenticated public intake as a non-account subject.
 * No user identifier is created and no submission is authorized.
 */
export function classifyUnauthenticatedPublicIntake(): UnauthenticatedPublicIntakeReference {
  return Object.freeze({
    kind: 'UNAUTHENTICATED_PUBLIC_INTAKE',
    classification: UNAUTHENTICATED_PUBLIC_INTAKE,
    authority: 'NONE',
  });
}

/**
 * Pure complaint-domain authorization policy.
 * Precedence is fixed. The terminal result under U1 is always a denial.
 * No network, persistence, audit, clock, random, or identity-provider call.
 */
export function evaluateComplaintCasePolicy(input: unknown): ComplaintPolicyResult {
  if (!isPlainObject(input)) {
    return deny('INVALID_COMPLAINT_POLICY_INPUT');
  }
  if (Object.keys(input).some((key) => !TOP_LEVEL_KEYS.has(key))) {
    return deny('INVALID_COMPLAINT_POLICY_INPUT');
  }

  const domain = input['domain'];
  if (typeof domain !== 'string' || domain.trim().length === 0) {
    return deny('INVALID_COMPLAINT_POLICY_INPUT');
  }
  if (domain !== COMPLAINT_DOMAIN) {
    return deny('NON_COMPLAINT_DOMAIN_FORBIDDEN');
  }
  if (!isOperation(input['operation'])) {
    return deny('INVALID_COMPLAINT_POLICY_INPUT');
  }
  if (!isIdentifier(input['internalCaseId']) || !isIdentifier(input['caseTenantId'])) {
    return deny('INVALID_COMPLAINT_POLICY_INPUT');
  }

  const parties = parseParties(input);
  if (parties === 'INVALID') {
    return deny('INVALID_COMPLAINT_POLICY_INPUT');
  }

  if (!('actor' in input) || input['actor'] === undefined || input['actor'] === null) {
    return deny('ACTOR_CONTEXT_REQUIRED');
  }
  const actor = parseActor(input['actor']);
  if (typeof actor === 'string') {
    return deny(actor);
  }
  if (actor.tenantId !== input['caseTenantId']) {
    return deny('CROSS_TENANT_COMPLAINT_OPERATION_FORBIDDEN');
  }
  if (actor.roles.some((role) => PRIVILEGED_ROLE_SET.has(role)) && !actor.mfaVerified) {
    return deny('MFA_REQUIRED');
  }
  if (actor.roles.some((role) => FORBIDDEN_MUTATION_ROLE_SET.has(role))) {
    return deny('COMPLAINT_MUTATION_ROLE_FORBIDDEN');
  }

  const conflict = sodConflict(parties);
  if (conflict !== null) {
    return deny(conflict);
  }
  if (
    parties.subjectActor !== undefined &&
    parties.finalDecisionActor !== undefined &&
    sameParty(parties.subjectActor, parties.finalDecisionActor)
  ) {
    return deny('COMPLAINT_SUBJECT_DECISION_ACTOR_CONFLICT');
  }

  return deny('COMPLAINT_OPERATION_AUTHORITY_NOT_ASSIGNED');
}

@Injectable()
export class ComplaintCasePolicy {
  evaluate(input: unknown): ComplaintPolicyResult {
    return evaluateComplaintCasePolicy(input);
  }
}
