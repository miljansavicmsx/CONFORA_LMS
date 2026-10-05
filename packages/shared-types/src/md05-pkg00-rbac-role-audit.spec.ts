import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LEARNER_ROLES,
  MFA_MANDATORY_ROLES,
  PRIVILEGED_ROLES,
  ROUTE_PERMISSIONS,
  parseRolesFromPayload,
} from './auth.js';
import {
  CROSS_TENANT_ASSIGNMENT_ALLOWED,
  CROSS_TENANT_REVOCATION_ALLOWED,
  GRANT_FOUR_EYES_REQUIRED,
  GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER,
  LOCAL_DATABASE_ROLE_AUTHORITY,
  REVOKE_FOUR_EYES_REQUIRED,
  REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER,
  REVOKE_POST_REVIEW_DUE_PERIOD,
  REVOKE_POST_REVIEW_DUE_PERIOD_MS,
  REVOKE_POST_REVIEW_REQUIRED,
  ROLE_AUTHORITY_SOURCE,
  ROLE_GRANT_AUTHORITY,
  ROLE_REVOKE_AUTHORITY,
  SELF_ASSIGNMENT_ALLOWED,
  SELF_REVOCATION_ALLOWED,
  STAFF_ROLEADM_SELF_MANAGEMENT_ALLOWED,
  TARGET_ROLE,
  evaluateRoleAdministrationPolicy,
  isRevokePostReviewDuePeriod,
  roleAdministrationContractSchema,
  roleAdministrationTargetRoleSchema,
  roleGrantAuthorityRoleSchema,
  roleRevokeAuthorityRoleSchema,
  type RoleAdministrationContractInput,
} from './role-administration.js';
import { RBAC_ROLE_COUNT, rbacRoleSchema } from './roles.js';

const HISTORICAL_ROLES = [
  'USR_CAND',
  'USR_CERT',
  'STAFF_DIR',
  'STAFF_SYSADM',
  'STAFF_TRAINADM',
  'ISSUANCE_OFFICER',
  'LIFECYCLE_OFFICER',
  'COM_TECH',
  'COM_CERT',
  'COM_IMP',
  'COM_APP',
  'STAFF_AUD',
  'SME',
  'EXAMINER',
  'INVIGILATOR',
  'QUALITY_MANAGER',
  'AI_SECURITY_MANAGER',
] as const;

const TENANT = '11111111-1111-4111-8111-111111111111';
const OTHER_TENANT = '99999999-9999-4999-8999-999999999999';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const TARGET = '33333333-3333-4333-8333-333333333333';
const INITIATOR = '44444444-4444-4444-8444-444444444444';
const APPROVER = '55555555-5555-4555-8555-555555555555';
const REVIEWER = '66666666-6666-4666-8666-666666666666';
const APPLIED_AT = '2026-10-05T10:00:00.000Z';
const REVIEW_DUE_AT = '2026-10-06T10:00:00.000Z';

function contract(
  overrides: Partial<RoleAdministrationContractInput> = {},
): RoleAdministrationContractInput {
  return {
    operation: 'GRANT',
    tenantId: TENANT,
    requestId: REQUEST,
    targetUserId: TARGET,
    targetExternalSubjectId: 'target-subject',
    role: 'COMPLAINT_HANDLER',
    initiatorUserId: INITIATOR,
    initiatorExternalSubjectId: 'initiator-subject',
    initiatorRole: 'STAFF_ROLEADM',
    approverUserId: APPROVER,
    approverExternalSubjectId: 'approver-subject',
    approverRole: 'STAFF_ROLEADM',
    reasonCode: 'ASSIGNMENT_REQUIRED',
    decision: 'APPROVED',
    requestedAt: '2026-10-05T10:00:00.000Z',
    decidedAt: '2026-10-05T10:05:00.000Z',
    previousState: 'ABSENT',
    resultingState: 'PENDING',
    correlationId: 'corr-pkg00',
    sourceSystem: ROLE_AUTHORITY_SOURCE,
    ...overrides,
  };
}

test('T01 historical 17 role identifiers remain accepted', () => {
  for (const role of HISTORICAL_ROLES) {
    assert.equal(rbacRoleSchema.safeParse(role).success, true);
  }
});

test('T02 COMPLAINT_HANDLER is accepted', () => {
  assert.equal(rbacRoleSchema.safeParse('COMPLAINT_HANDLER').success, true);
});

test('T03 STAFF_ROLEADM is accepted', () => {
  assert.equal(rbacRoleSchema.safeParse('STAFF_ROLEADM').success, true);
});

test('T04 canonical role count is 19', () => {
  assert.equal(rbacRoleSchema.options.length, 19);
  assert.equal(RBAC_ROLE_COUNT, 19);
  assert.deepEqual(rbacRoleSchema.options.slice(0, 17), [...HISTORICAL_ROLES]);
  assert.deepEqual(rbacRoleSchema.options.slice(17), ['COMPLAINT_HANDLER', 'STAFF_ROLEADM']);
});

test('T05 unknown role remains filtered', () => {
  assert.equal(rbacRoleSchema.safeParse('NO_SUCH_ROLE').success, false);
  assert.deepEqual(
    parseRolesFromPayload({ sub: 'u', realm_access: { roles: ['NO_SUCH_ROLE', 'USR_CAND'] } }),
    ['USR_CAND'],
  );
});

test('T06 learner roles remain unchanged', () => {
  assert.deepEqual([...LEARNER_ROLES], ['USR_CAND', 'USR_CERT']);
  assert.equal(LEARNER_ROLES.includes('COMPLAINT_HANDLER'), false);
  assert.equal(LEARNER_ROLES.includes('STAFF_ROLEADM'), false);
});

test('T07 COMPLAINT_HANDLER is privileged', () => {
  assert.equal(PRIVILEGED_ROLES.includes('COMPLAINT_HANDLER'), true);
});

test('T08 STAFF_ROLEADM is privileged', () => {
  assert.equal(PRIVILEGED_ROLES.includes('STAFF_ROLEADM'), true);
  assert.equal(PRIVILEGED_ROLES.length, 17);
});

test('T09 COMPLAINT_HANDLER requires MFA', () => {
  assert.equal(MFA_MANDATORY_ROLES.includes('COMPLAINT_HANDLER'), true);
});

test('T10 STAFF_ROLEADM requires MFA', () => {
  assert.equal(MFA_MANDATORY_ROLES.includes('STAFF_ROLEADM'), true);
  assert.equal(MFA_MANDATORY_ROLES, PRIVILEGED_ROLES);
});

test('T11 JWT/OIDC parsing accepts both exact identifiers', () => {
  assert.deepEqual(
    parseRolesFromPayload({
      sub: 'u',
      realm_access: { roles: ['COMPLAINT_HANDLER', 'STAFF_ROLEADM'] },
    }),
    ['COMPLAINT_HANDLER', 'STAFF_ROLEADM'],
  );
});

test('T12 lowercase and alias forms do not become canonical roles', () => {
  const aliases = [
    'complaint_handler',
    'Complaint_Handler',
    'admin',
    'sys_admin',
    'staff_sysadm',
    'role_admin',
    'STAFF_ROLE_ADM',
  ];
  for (const alias of aliases) {
    assert.equal(rbacRoleSchema.safeParse(alias).success, false);
  }
  assert.deepEqual(
    parseRolesFromPayload({
      sub: 'u',
      realm_access: { roles: [...aliases, 'COMPLAINT_HANDLER'] },
    }),
    ['COMPLAINT_HANDLER'],
  );
});

test('T13 role-administration contract uses canonical role values', () => {
  const parsed = roleAdministrationContractSchema.parse(contract());
  assert.equal(parsed.role, 'COMPLAINT_HANDLER');
  assert.equal(rbacRoleSchema.safeParse(parsed.role).success, true);
  const rejected = roleAdministrationContractSchema.safeParse(
    contract({ role: 'complaint_handler' as 'COMPLAINT_HANDLER' }),
  );
  assert.equal(rejected.success, false);
});

test('T14 self-assignment is prohibited by the contract', () => {
  assert.equal(SELF_ASSIGNMENT_ALLOWED, false);
  assert.equal(SELF_REVOCATION_ALLOWED, false);
  const grant = roleAdministrationContractSchema.safeParse(
    contract({ targetUserId: INITIATOR, targetExternalSubjectId: 'other-subject' }),
  );
  if (grant.success) {
    assert.fail('SELF_ASSIGNMENT_FORBIDDEN expected');
  }
  assert.ok(grant.error.issues.some((issue) => issue.message === 'SELF_ASSIGNMENT_FORBIDDEN'));
  const revoke = roleAdministrationContractSchema.safeParse(
    contract({
      operation: 'REVOKE',
      decision: 'APPLIED',
      approverUserId: undefined,
      approverExternalSubjectId: undefined,
      targetUserId: INITIATOR,
    }),
  );
  if (revoke.success) {
    assert.fail('SELF_REVOCATION_FORBIDDEN expected');
  }
  assert.ok(revoke.error.issues.some((issue) => issue.message === 'SELF_REVOCATION_FORBIDDEN'));
});

test('T15 cross-tenant assignment is not represented as permitted', () => {
  assert.equal(CROSS_TENANT_ASSIGNMENT_ALLOWED, false);
  assert.equal(CROSS_TENANT_REVOCATION_ALLOWED, false);
  const withSecondTenant = roleAdministrationContractSchema.safeParse({
    ...contract(),
    actorTenantId: OTHER_TENANT,
    targetTenantId: OTHER_TENANT,
  });
  assert.equal(withSecondTenant.success, false);
  const codes = evaluateRoleAdministrationPolicy(contract(), { actorTenantId: OTHER_TENANT });
  assert.ok(codes.includes('CROSS_TENANT_ASSIGNMENT_FORBIDDEN'));
  const revokeCodes = evaluateRoleAdministrationPolicy(contract({ operation: 'REVOKE' }), {
    actorTenantId: OTHER_TENANT,
  });
  assert.ok(revokeCodes.includes('CROSS_TENANT_REVOCATION_FORBIDDEN'));
});

test('T16 grant initiator and approver must be distinct', () => {
  assert.equal(GRANT_FOUR_EYES_REQUIRED, true);
  assert.equal(GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER, true);
  const parsed = roleAdministrationContractSchema.safeParse(
    contract({
      approverUserId: INITIATOR,
      approverExternalSubjectId: 'approver-subject',
    }),
  );
  if (parsed.success) {
    assert.fail('GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER expected');
  }
  assert.ok(
    parsed.error.issues.some(
      (issue) => issue.message === 'GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER',
    ),
  );
});

test('T17 revoke post-review is required', () => {
  assert.equal(REVOKE_POST_REVIEW_REQUIRED, true);
  assert.equal(REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER, true);
  assert.equal(REVOKE_FOUR_EYES_REQUIRED, false);
  const sameActor = roleAdministrationContractSchema.safeParse(
    contract({
      operation: 'REVOKE',
      decision: 'REVIEWED',
      approverUserId: INITIATOR,
      approverExternalSubjectId: 'reviewer-subject',
    }),
  );
  if (sameActor.success) {
    assert.fail('REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER expected');
  }
  assert.ok(
    sameActor.error.issues.some(
      (issue) => issue.message === 'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER',
    ),
  );
});

test('T18 revoke post-review period equals PT24H', () => {
  assert.equal(REVOKE_POST_REVIEW_DUE_PERIOD, 'PT24H');
  assert.equal(REVOKE_POST_REVIEW_DUE_PERIOD_MS, 86_400_000);
});

test('T22 no grant or revoke endpoint is introduced by the contract module', () => {
  assert.equal(LOCAL_DATABASE_ROLE_AUTHORITY, false);
  assert.equal(STAFF_ROLEADM_SELF_MANAGEMENT_ALLOWED, false);
  const parsed = roleAdministrationContractSchema.parse(contract());
  assert.equal(parsed.sourceSystem, 'EXTERNAL_OIDC_IDP_CANONICAL');
  const granted = new Set<string>(
    ROUTE_PERMISSIONS.flatMap((rule) => [...rule.roles] as readonly string[]),
  );
  assert.equal(granted.has('COMPLAINT_HANDLER'), false);
  assert.equal(granted.has('STAFF_ROLEADM'), false);
});

test('STAFF_ROLEADM self-management is forbidden by the contract', () => {
  const parsed = roleAdministrationContractSchema.safeParse(contract({ role: 'STAFF_ROLEADM' }));
  assert.equal(parsed.success, false);
  assert.equal(roleAdministrationTargetRoleSchema.safeParse('STAFF_ROLEADM').success, false);
  const codes = evaluateRoleAdministrationPolicy(contract({ role: 'STAFF_ROLEADM' }), {
    actorTenantId: TENANT,
  });
  assert.ok(codes.includes('STAFF_ROLEADM_SELF_MANAGEMENT_FORBIDDEN'));
  assert.ok(codes.includes('TARGET_ROLE_FORBIDDEN'));
});

function revokeContract(
  overrides: Partial<RoleAdministrationContractInput> = {},
): RoleAdministrationContractInput {
  return contract({
    operation: 'REVOKE',
    decision: 'APPLIED',
    approverUserId: undefined,
    approverExternalSubjectId: undefined,
    approverRole: undefined,
    actorUserId: INITIATOR,
    actorExternalSubjectId: 'initiator-subject',
    actorRole: ROLE_REVOKE_AUTHORITY,
    appliedAt: APPLIED_AT,
    reviewDueAt: REVIEW_DUE_AT,
    previousState: 'ACTIVE',
    resultingState: 'REVOKED',
    ...overrides,
  });
}

function reviewedRevoke(
  overrides: Partial<RoleAdministrationContractInput> = {},
): RoleAdministrationContractInput {
  return revokeContract({
    decision: 'REVIEWED',
    appliedAt: undefined,
    reviewDueAt: undefined,
    reviewerUserId: REVIEWER,
    reviewerExternalSubjectId: 'reviewer-subject',
    reviewerRole: ROLE_REVOKE_AUTHORITY,
    reviewedAt: '2026-10-05T16:00:00.000Z',
    ...overrides,
  });
}

function assertSchemaRejects(value: unknown): void {
  assert.equal(roleAdministrationContractSchema.safeParse(value).success, false);
}

test('EC1-T01 grant target STAFF_DIR rejected', () => {
  assert.equal(roleAdministrationTargetRoleSchema.safeParse('STAFF_DIR').success, false);
  assertSchemaRejects(contract({ role: 'STAFF_DIR' }));
  assert.ok(
    evaluateRoleAdministrationPolicy(contract({ role: 'STAFF_DIR' }), {
      actorTenantId: TENANT,
    }).includes('TARGET_ROLE_FORBIDDEN'),
  );
  for (const role of rbacRoleSchema.options) {
    if (role === TARGET_ROLE) continue;
    assert.equal(roleAdministrationContractSchema.safeParse(contract({ role })).success, false);
  }
});

test('EC1-T02 grant target STAFF_SYSADM rejected', () => {
  assertSchemaRejects(contract({ role: 'STAFF_SYSADM' }));
});

test('EC1-T03 grant target STAFF_AUD rejected', () => {
  assertSchemaRejects(contract({ role: 'STAFF_AUD' }));
});

test('EC1-T04 grant target COM_APP rejected', () => {
  assertSchemaRejects(contract({ role: 'COM_APP' }));
  assertSchemaRejects(contract({ role: 'COM_CERT' }));
});

test('EC1-T05 grant target USR_CAND rejected', () => {
  assertSchemaRejects(contract({ role: 'USR_CAND' }));
  assertSchemaRejects(contract({ role: 'USR_CERT' }));
});

test('EC1-T06 revoke target STAFF_DIR rejected', () => {
  assertSchemaRejects(revokeContract({ role: 'STAFF_DIR' }));
  for (const role of rbacRoleSchema.options) {
    if (role === TARGET_ROLE) continue;
    assert.equal(
      roleAdministrationContractSchema.safeParse(revokeContract({ role })).success,
      false,
    );
  }
});

test('EC1-T07 target STAFF_ROLEADM rejected', () => {
  assertSchemaRejects(contract({ role: 'STAFF_ROLEADM' }));
  assertSchemaRejects(revokeContract({ role: 'STAFF_ROLEADM' }));
  assert.equal(roleAdministrationTargetRoleSchema.safeParse('STAFF_ROLEADM').success, false);
});

test('EC1-T08 target COMPLAINT_HANDLER accepted', () => {
  assert.equal(TARGET_ROLE, 'COMPLAINT_HANDLER');
  assert.equal(roleAdministrationTargetRoleSchema.parse('COMPLAINT_HANDLER'), 'COMPLAINT_HANDLER');
  const parsed = roleAdministrationContractSchema.parse(contract());
  assert.equal(parsed.role, 'COMPLAINT_HANDLER');
  assert.deepEqual(
    [...evaluateRoleAdministrationPolicy(contract(), { actorTenantId: TENANT })],
    [],
  );
});

test('EC1-T09 grant initiator STAFF_ROLEADM accepted', () => {
  assert.equal(ROLE_GRANT_AUTHORITY, 'STAFF_ROLEADM');
  assert.equal(roleGrantAuthorityRoleSchema.parse('STAFF_ROLEADM'), 'STAFF_ROLEADM');
  const parsed = roleAdministrationContractSchema.parse(
    contract({ initiatorRole: ROLE_GRANT_AUTHORITY }),
  );
  assert.equal(parsed.initiatorRole, 'STAFF_ROLEADM');
});

test('EC1-T10 grant approver STAFF_ROLEADM accepted', () => {
  const parsed = roleAdministrationContractSchema.parse(
    contract({ approverRole: ROLE_GRANT_AUTHORITY }),
  );
  assert.equal(parsed.approverRole, 'STAFF_ROLEADM');
});

test('EC1-T11 grant initiator COMPLAINT_HANDLER rejected', () => {
  assert.equal(roleGrantAuthorityRoleSchema.safeParse('COMPLAINT_HANDLER').success, false);
  assertSchemaRejects(contract({ initiatorRole: 'COMPLAINT_HANDLER' }));
  assert.ok(
    evaluateRoleAdministrationPolicy(contract({ initiatorRole: 'COMPLAINT_HANDLER' }), {
      actorTenantId: TENANT,
    }).includes('GRANT_INITIATOR_AUTHORITY_FORBIDDEN'),
  );
  for (const role of [...rbacRoleSchema.options, 'admin', 'sys_admin']) {
    if (role === ROLE_GRANT_AUTHORITY) continue;
    assert.equal(roleGrantAuthorityRoleSchema.safeParse(role).success, false);
    assert.equal(
      roleAdministrationContractSchema.safeParse(contract({ initiatorRole: role })).success,
      false,
    );
  }
});

test('EC1-T12 grant approver STAFF_DIR rejected', () => {
  assert.equal(roleGrantAuthorityRoleSchema.safeParse('STAFF_DIR').success, false);
  assertSchemaRejects(contract({ approverRole: 'STAFF_DIR' }));
  assert.ok(
    evaluateRoleAdministrationPolicy(contract({ approverRole: 'STAFF_DIR' }), {
      actorTenantId: TENANT,
    }).includes('GRANT_APPROVER_AUTHORITY_FORBIDDEN'),
  );
  for (const role of rbacRoleSchema.options) {
    if (role === ROLE_GRANT_AUTHORITY) continue;
    assert.equal(
      roleAdministrationContractSchema.safeParse(contract({ approverRole: role })).success,
      false,
    );
  }
});

test('EC1-T13 identical grant initiator and approver rejected', () => {
  const sameUser = roleAdministrationContractSchema.safeParse(
    contract({ approverUserId: INITIATOR, approverExternalSubjectId: 'approver-subject' }),
  );
  assert.equal(sameUser.success, false);
  assert.ok(
    sameUser.error.issues.some(
      (issue) => issue.message === 'GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER',
    ),
  );
  const sameSubject = roleAdministrationContractSchema.safeParse(
    contract({
      approverUserId: APPROVER,
      approverExternalSubjectId: 'initiator-subject',
    }),
  );
  assert.equal(sameSubject.success, false);
});

test('EC1-T14 grant actor equal to target rejected', () => {
  const initiatorIsTarget = roleAdministrationContractSchema.safeParse(
    contract({ targetUserId: INITIATOR, targetExternalSubjectId: 'target-subject' }),
  );
  assert.equal(initiatorIsTarget.success, false);
  assert.ok(
    initiatorIsTarget.error.issues.some((issue) => issue.message === 'SELF_ASSIGNMENT_FORBIDDEN'),
  );
  const approverIsTarget = roleAdministrationContractSchema.safeParse(
    contract({ targetUserId: APPROVER, targetExternalSubjectId: 'target-subject' }),
  );
  assert.equal(approverIsTarget.success, false);
  assert.ok(
    approverIsTarget.error.issues.some((issue) => issue.message === 'TARGET_CANNOT_BE_APPROVER'),
  );
});

test('EC1-T15 revoke actor STAFF_ROLEADM accepted', () => {
  assert.equal(ROLE_REVOKE_AUTHORITY, 'STAFF_ROLEADM');
  assert.equal(roleRevokeAuthorityRoleSchema.parse('STAFF_ROLEADM'), 'STAFF_ROLEADM');
  const parsed = roleAdministrationContractSchema.parse(revokeContract());
  assert.equal(parsed.actorRole, 'STAFF_ROLEADM');
  assert.equal(parsed.initiatorRole, 'STAFF_ROLEADM');
  assert.deepEqual(
    [...evaluateRoleAdministrationPolicy(revokeContract(), { actorTenantId: TENANT })],
    [],
  );
});

test('EC1-T16 revoke reviewer STAFF_ROLEADM accepted', () => {
  const parsed = roleAdministrationContractSchema.parse(reviewedRevoke());
  assert.equal(parsed.reviewerRole, 'STAFF_ROLEADM');
  assert.notEqual(parsed.reviewerUserId, parsed.actorUserId);
  assert.equal(parsed.decision, 'REVIEWED');
  assert.equal(parsed.reviewedAt, '2026-10-05T16:00:00.000Z');
});

test('EC1-T17 revoke actor COMPLAINT_HANDLER rejected', () => {
  assert.equal(roleRevokeAuthorityRoleSchema.safeParse('COMPLAINT_HANDLER').success, false);
  assertSchemaRejects(revokeContract({ actorRole: 'COMPLAINT_HANDLER' }));
  assert.ok(
    evaluateRoleAdministrationPolicy(revokeContract({ actorRole: 'COMPLAINT_HANDLER' }), {
      actorTenantId: TENANT,
    }).includes('REVOKE_ACTOR_AUTHORITY_FORBIDDEN'),
  );
  for (const role of rbacRoleSchema.options) {
    if (role === ROLE_REVOKE_AUTHORITY) continue;
    assert.equal(
      roleAdministrationContractSchema.safeParse(revokeContract({ actorRole: role })).success,
      false,
    );
  }
});

test('EC1-T18 revoke reviewer STAFF_AUD rejected', () => {
  assert.equal(roleRevokeAuthorityRoleSchema.safeParse('STAFF_AUD').success, false);
  assertSchemaRejects(reviewedRevoke({ reviewerRole: 'STAFF_AUD' }));
  assert.ok(
    evaluateRoleAdministrationPolicy(reviewedRevoke({ reviewerRole: 'STAFF_AUD' }), {
      actorTenantId: TENANT,
    }).includes('REVOKE_REVIEWER_AUTHORITY_FORBIDDEN'),
  );
  for (const role of rbacRoleSchema.options) {
    if (role === ROLE_REVOKE_AUTHORITY) continue;
    assert.equal(
      roleAdministrationContractSchema.safeParse(reviewedRevoke({ reviewerRole: role })).success,
      false,
    );
  }
});

test('EC1-T19 identical revoke actor and reviewer rejected', () => {
  const parsed = roleAdministrationContractSchema.safeParse(
    reviewedRevoke({
      reviewerUserId: INITIATOR,
      reviewerExternalSubjectId: 'reviewer-subject',
    }),
  );
  assert.equal(parsed.success, false);
  assert.ok(
    parsed.error.issues.some((issue) => issue.message === 'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER'),
  );
  const sameSubject = roleAdministrationContractSchema.safeParse(
    reviewedRevoke({ reviewerExternalSubjectId: 'initiator-subject' }),
  );
  assert.equal(sameSubject.success, false);
});

test('EC1-T20 revoke actor equal to target rejected', () => {
  const parsed = roleAdministrationContractSchema.safeParse(
    revokeContract({
      targetUserId: INITIATOR,
      actorUserId: INITIATOR,
      targetExternalSubjectId: 'target-subject',
    }),
  );
  assert.equal(parsed.success, false);
  assert.ok(parsed.error.issues.some((issue) => issue.message === 'SELF_REVOCATION_FORBIDDEN'));
  const reviewerIsTarget = roleAdministrationContractSchema.safeParse(
    reviewedRevoke({
      targetUserId: REVIEWER,
      targetExternalSubjectId: 'target-subject',
    }),
  );
  assert.equal(reviewerIsTarget.success, false);
});

test('EC1-T21 cross-tenant grant rejected', () => {
  for (const field of ['initiatorTenantId', 'approverTenantId', 'targetTenantId'] as const) {
    const parsed = roleAdministrationContractSchema.safeParse(contract({ [field]: OTHER_TENANT }));
    assert.equal(parsed.success, false);
    assert.ok(
      parsed.error.issues.some((issue) => issue.message === 'CROSS_TENANT_ASSIGNMENT_FORBIDDEN'),
    );
  }
});

test('EC1-T22 cross-tenant revoke rejected', () => {
  for (const field of ['actorTenantId', 'reviewerTenantId', 'targetTenantId'] as const) {
    const parsed = roleAdministrationContractSchema.safeParse(
      revokeContract({ [field]: OTHER_TENANT }),
    );
    assert.equal(parsed.success, false);
    assert.ok(
      parsed.error.issues.some((issue) => issue.message === 'CROSS_TENANT_REVOCATION_FORBIDDEN'),
    );
  }
});

test('EC1-T35 PT24H remains enforced', () => {
  assert.equal(REVOKE_POST_REVIEW_DUE_PERIOD, 'PT24H');
  assert.equal(REVOKE_POST_REVIEW_DUE_PERIOD_MS, 86_400_000);
  assert.equal(isRevokePostReviewDuePeriod(APPLIED_AT, REVIEW_DUE_AT), true);
  assert.equal(isRevokePostReviewDuePeriod(APPLIED_AT, '2026-10-06T09:00:00.000Z'), false);
  const accepted = roleAdministrationContractSchema.parse(revokeContract());
  assert.equal(accepted.reviewDueAt, REVIEW_DUE_AT);
  const early = roleAdministrationContractSchema.safeParse(
    revokeContract({ reviewDueAt: '2026-10-06T09:00:00.000Z' }),
  );
  assert.equal(early.success, false);
  assert.ok(
    early.error.issues.some((issue) => issue.message === 'REVOKE_POST_REVIEW_DUE_PERIOD_INVALID'),
  );
  const missing = roleAdministrationContractSchema.safeParse(
    revokeContract({ reviewDueAt: undefined }),
  );
  assert.equal(missing.success, false);
  const lateDue = new Date(
    Date.parse(APPLIED_AT) + REVOKE_POST_REVIEW_DUE_PERIOD_MS + 1,
  ).toISOString();
  assert.equal(
    roleAdministrationContractSchema.safeParse(revokeContract({ reviewDueAt: lateDue })).success,
    false,
  );
});
