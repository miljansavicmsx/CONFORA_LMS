import { z } from 'zod';

import { type RbacRole } from './roles.js';

/**
 * PKG-00 role-administration contract.
 * This module describes policy. It does not grant or revoke a role,
 * call a network, or create a local role authority.
 */
export const ROLE_AUTHORITY_SOURCE = 'EXTERNAL_OIDC_IDP_CANONICAL' as const;
export const LOCAL_DATABASE_ROLE_AUTHORITY = false as const;

export const SELF_ASSIGNMENT_ALLOWED = false as const;
export const SELF_REVOCATION_ALLOWED = false as const;
export const CROSS_TENANT_ASSIGNMENT_ALLOWED = false as const;
export const CROSS_TENANT_REVOCATION_ALLOWED = false as const;

export const GRANT_FOUR_EYES_REQUIRED = true as const;
export const GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER = true as const;
export const REVOKE_FOUR_EYES_REQUIRED = false as const;
export const REVOKE_POST_REVIEW_REQUIRED = true as const;
export const REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER = true as const;
export const STAFF_ROLEADM_SELF_MANAGEMENT_ALLOWED = false as const;

/**
 * The only role this contract may grant or revoke.
 * A general rbacRoleSchema field is not the target restriction.
 */
export const TARGET_ROLE = 'COMPLAINT_HANDLER' as const;
export const ROLE_GRANT_AUTHORITY = 'STAFF_ROLEADM' as const;
export const ROLE_REVOKE_AUTHORITY = 'STAFF_ROLEADM' as const;

/**
 * ISO-8601 elapsed duration for revoke post-review.
 * PT24H is 24 elapsed hours. It is not a locale calendar calculation.
 */
export const REVOKE_POST_REVIEW_DUE_PERIOD = 'PT24H' as const;
export const REVOKE_POST_REVIEW_DUE_PERIOD_MS = 24 * 60 * 60 * 1000;

export const roleAdministrationOperationSchema = z.enum(['GRANT', 'REVOKE']);
export type RoleAdministrationOperation = z.infer<typeof roleAdministrationOperationSchema>;

export const roleAdministrationDecisionSchema = z.enum([
  'REQUESTED',
  'APPROVED',
  'APPLIED',
  'REJECTED',
  'FAILED',
  'REVIEWED',
]);
export type RoleAdministrationDecision = z.infer<typeof roleAdministrationDecisionSchema>;

export const roleAssignmentStateSchema = z.enum(['ABSENT', 'PENDING', 'ACTIVE', 'REVOKED']);
export type RoleAssignmentState = z.infer<typeof roleAssignmentStateSchema>;

export const roleAdministrationTargetRoleSchema = z.literal(TARGET_ROLE);
export const roleGrantAuthorityRoleSchema = z.literal(ROLE_GRANT_AUTHORITY);
export const roleRevokeAuthorityRoleSchema = z.literal(ROLE_REVOKE_AUTHORITY);

export const ROLE_ADMINISTRATION_POLICY_CODES = [
  'SELF_ASSIGNMENT_FORBIDDEN',
  'SELF_REVOCATION_FORBIDDEN',
  'GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER',
  'GRANT_APPROVER_REQUIRED',
  'GRANT_APPROVER_SUBJECT_REQUIRED',
  'TARGET_CANNOT_BE_APPROVER',
  'TARGET_CANNOT_BE_REVIEWER',
  'STAFF_ROLEADM_SELF_MANAGEMENT_FORBIDDEN',
  'TARGET_ROLE_FORBIDDEN',
  'GRANT_INITIATOR_AUTHORITY_FORBIDDEN',
  'GRANT_APPROVER_AUTHORITY_FORBIDDEN',
  'REVOKE_ACTOR_AUTHORITY_FORBIDDEN',
  'REVOKE_REVIEWER_AUTHORITY_FORBIDDEN',
  'REVOKE_REVIEWER_REQUIRED',
  'REVOKE_REVIEWER_SUBJECT_REQUIRED',
  'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER',
  'REVOKE_REVIEW_TIMESTAMP_REQUIRED',
  'REVOKE_POST_REVIEW_DUE_PERIOD_INVALID',
  'REVOKE_ACTOR_IDENTITY_CONFLICT',
  'REVOKE_REVIEWER_IDENTITY_CONFLICT',
  'CROSS_TENANT_ASSIGNMENT_FORBIDDEN',
  'CROSS_TENANT_REVOCATION_FORBIDDEN',
] as const;

export type RoleAdministrationPolicyCode = (typeof ROLE_ADMINISTRATION_POLICY_CODES)[number];

const subjectIdSchema = z.string().min(1).max(256);
const reasonCodeSchema = z.string().regex(/^[A-Z][A-Z0-9_]{0,63}$/);
const instantSchema = z.string().datetime();

const GRANT_DECISIONS_REQUIRING_APPROVER = new Set<RoleAdministrationDecision>([
  'APPROVED',
  'APPLIED',
  'REJECTED',
]);

export type RoleAdministrationContractInput = {
  operation: RoleAdministrationOperation;
  tenantId: string;
  initiatorTenantId?: string | undefined;
  approverTenantId?: string | undefined;
  targetTenantId?: string | undefined;
  actorTenantId?: string | undefined;
  reviewerTenantId?: string | undefined;
  requestId: string;
  targetUserId: string;
  targetExternalSubjectId: string;
  role: RbacRole | (string & {});
  initiatorUserId: string;
  initiatorExternalSubjectId: string;
  initiatorRole: string;
  approverUserId?: string | undefined;
  approverExternalSubjectId?: string | undefined;
  approverRole?: string | undefined;
  actorUserId?: string | undefined;
  actorExternalSubjectId?: string | undefined;
  actorRole?: string | undefined;
  reviewerUserId?: string | undefined;
  reviewerExternalSubjectId?: string | undefined;
  reviewerRole?: string | undefined;
  reasonCode: string;
  decision: RoleAdministrationDecision;
  requestedAt: string;
  decidedAt?: string | undefined;
  appliedAt?: string | undefined;
  reviewDueAt?: string | undefined;
  reviewedAt?: string | undefined;
  previousState: RoleAssignmentState;
  resultingState: RoleAssignmentState;
  correlationId: string;
  sourceSystem: typeof ROLE_AUTHORITY_SOURCE;
};

export type RoleAdministrationActorContext = {
  actorTenantId: string;
};

function pushUnique(
  codes: RoleAdministrationPolicyCode[],
  code: RoleAdministrationPolicyCode,
): void {
  if (!codes.includes(code)) codes.push(code);
}

export function isRevokePostReviewDuePeriod(appliedAt: string, reviewDueAt: string): boolean {
  const applied = Date.parse(appliedAt);
  const due = Date.parse(reviewDueAt);
  return (
    Number.isFinite(applied) &&
    Number.isFinite(due) &&
    due - applied === REVOKE_POST_REVIEW_DUE_PERIOD_MS
  );
}

function partyTenantMismatch(
  value: RoleAdministrationContractInput,
  actorTenantId: string,
): boolean {
  const parties = [
    value.initiatorTenantId,
    value.approverTenantId,
    value.targetTenantId,
    value.actorTenantId,
    value.reviewerTenantId,
    actorTenantId,
  ];
  return parties.some((tenantId) => tenantId !== undefined && tenantId !== value.tenantId);
}

/**
 * Policy evaluation only. One canonical tenantId binds the initiator,
 * approver, actor, reviewer, and target. A conflicting tenant fails.
 */
export function evaluateRoleAdministrationPolicy(
  value: RoleAdministrationContractInput,
  context: RoleAdministrationActorContext,
): readonly RoleAdministrationPolicyCode[] {
  const codes: RoleAdministrationPolicyCode[] = [];

  if (partyTenantMismatch(value, context.actorTenantId)) {
    pushUnique(
      codes,
      value.operation === 'GRANT'
        ? 'CROSS_TENANT_ASSIGNMENT_FORBIDDEN'
        : 'CROSS_TENANT_REVOCATION_FORBIDDEN',
    );
  }

  if (value.role !== TARGET_ROLE) {
    pushUnique(codes, 'TARGET_ROLE_FORBIDDEN');
  }
  if (value.role === 'STAFF_ROLEADM') {
    pushUnique(codes, 'STAFF_ROLEADM_SELF_MANAGEMENT_FORBIDDEN');
  }

  const revokeActorUserId = value.actorUserId ?? value.initiatorUserId;
  const revokeActorSubjectId = value.actorExternalSubjectId ?? value.initiatorExternalSubjectId;
  const reviewerUserId = value.reviewerUserId ?? value.approverUserId;
  const reviewerSubjectId = value.reviewerExternalSubjectId ?? value.approverExternalSubjectId;

  if (
    value.operation === 'REVOKE' &&
    value.actorUserId !== undefined &&
    value.actorUserId !== value.initiatorUserId
  ) {
    pushUnique(codes, 'REVOKE_ACTOR_IDENTITY_CONFLICT');
  }
  if (
    value.operation === 'REVOKE' &&
    value.reviewerUserId !== undefined &&
    value.approverUserId !== undefined &&
    value.reviewerUserId !== value.approverUserId
  ) {
    pushUnique(codes, 'REVOKE_REVIEWER_IDENTITY_CONFLICT');
  }

  const actorUserId = value.operation === 'REVOKE' ? revokeActorUserId : value.initiatorUserId;
  const actorSubjectId =
    value.operation === 'REVOKE' ? revokeActorSubjectId : value.initiatorExternalSubjectId;

  if (
    value.targetUserId === value.initiatorUserId ||
    value.targetExternalSubjectId === value.initiatorExternalSubjectId ||
    value.targetUserId === actorUserId ||
    value.targetExternalSubjectId === actorSubjectId
  ) {
    pushUnique(
      codes,
      value.operation === 'GRANT' ? 'SELF_ASSIGNMENT_FORBIDDEN' : 'SELF_REVOCATION_FORBIDDEN',
    );
  }

  if (value.operation === 'GRANT') {
    if (value.approverUserId !== undefined && value.approverUserId === value.targetUserId) {
      pushUnique(codes, 'TARGET_CANNOT_BE_APPROVER');
    }
    if (
      value.approverExternalSubjectId !== undefined &&
      value.approverExternalSubjectId === value.targetExternalSubjectId
    ) {
      pushUnique(codes, 'TARGET_CANNOT_BE_APPROVER');
    }
    if (value.initiatorRole !== ROLE_GRANT_AUTHORITY) {
      pushUnique(codes, 'GRANT_INITIATOR_AUTHORITY_FORBIDDEN');
    }
    const approverPresented =
      value.approverUserId !== undefined ||
      value.approverExternalSubjectId !== undefined ||
      value.approverRole !== undefined;
    if (GRANT_DECISIONS_REQUIRING_APPROVER.has(value.decision) || approverPresented) {
      if (value.approverUserId === undefined) pushUnique(codes, 'GRANT_APPROVER_REQUIRED');
      if (value.approverExternalSubjectId === undefined) {
        pushUnique(codes, 'GRANT_APPROVER_SUBJECT_REQUIRED');
      }
      if (value.approverRole !== ROLE_GRANT_AUTHORITY) {
        pushUnique(codes, 'GRANT_APPROVER_AUTHORITY_FORBIDDEN');
      }
    }
    if (value.approverUserId !== undefined && value.approverUserId === value.initiatorUserId) {
      pushUnique(codes, 'GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER');
    }
    if (
      value.approverExternalSubjectId !== undefined &&
      value.approverExternalSubjectId === value.initiatorExternalSubjectId
    ) {
      pushUnique(codes, 'GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER');
    }
  }

  if (value.operation === 'REVOKE') {
    if (
      value.actorRole !== ROLE_REVOKE_AUTHORITY ||
      value.initiatorRole !== ROLE_REVOKE_AUTHORITY
    ) {
      pushUnique(codes, 'REVOKE_ACTOR_AUTHORITY_FORBIDDEN');
    }
    if (reviewerUserId !== undefined && reviewerUserId === value.targetUserId) {
      pushUnique(codes, 'TARGET_CANNOT_BE_REVIEWER');
    }
    if (reviewerSubjectId !== undefined && reviewerSubjectId === value.targetExternalSubjectId) {
      pushUnique(codes, 'TARGET_CANNOT_BE_REVIEWER');
    }
    if (value.decision === 'REVIEWED') {
      if (reviewerUserId === undefined) pushUnique(codes, 'REVOKE_REVIEWER_REQUIRED');
      if (reviewerSubjectId === undefined) pushUnique(codes, 'REVOKE_REVIEWER_SUBJECT_REQUIRED');
      const reviewerRole = value.reviewerRole ?? value.approverRole;
      if (reviewerRole !== ROLE_REVOKE_AUTHORITY) {
        pushUnique(codes, 'REVOKE_REVIEWER_AUTHORITY_FORBIDDEN');
      }
      if (reviewerUserId !== undefined && reviewerUserId === actorUserId) {
        pushUnique(codes, 'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER');
      }
      if (reviewerSubjectId !== undefined && reviewerSubjectId === actorSubjectId) {
        pushUnique(codes, 'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER');
      }
      if (value.reviewedAt === undefined) pushUnique(codes, 'REVOKE_REVIEW_TIMESTAMP_REQUIRED');
    }
    if (value.decision === 'APPLIED') {
      if (
        value.appliedAt === undefined ||
        value.reviewDueAt === undefined ||
        !isRevokePostReviewDuePeriod(value.appliedAt, value.reviewDueAt)
      ) {
        pushUnique(codes, 'REVOKE_POST_REVIEW_DUE_PERIOD_INVALID');
      }
    }
  }

  return codes;
}

export const roleAdministrationContractSchema = z
  .object({
    operation: roleAdministrationOperationSchema,
    tenantId: z.string().uuid(),
    initiatorTenantId: z.string().uuid().optional(),
    approverTenantId: z.string().uuid().optional(),
    targetTenantId: z.string().uuid().optional(),
    actorTenantId: z.string().uuid().optional(),
    reviewerTenantId: z.string().uuid().optional(),
    requestId: z.string().uuid(),
    targetUserId: z.string().uuid(),
    targetExternalSubjectId: subjectIdSchema,
    role: roleAdministrationTargetRoleSchema,
    initiatorUserId: z.string().uuid(),
    initiatorExternalSubjectId: subjectIdSchema,
    initiatorRole: roleGrantAuthorityRoleSchema,
    approverUserId: z.string().uuid().optional(),
    approverExternalSubjectId: subjectIdSchema.optional(),
    approverRole: roleGrantAuthorityRoleSchema.optional(),
    actorUserId: z.string().uuid().optional(),
    actorExternalSubjectId: subjectIdSchema.optional(),
    actorRole: roleRevokeAuthorityRoleSchema.optional(),
    reviewerUserId: z.string().uuid().optional(),
    reviewerExternalSubjectId: subjectIdSchema.optional(),
    reviewerRole: roleRevokeAuthorityRoleSchema.optional(),
    reasonCode: reasonCodeSchema,
    decision: roleAdministrationDecisionSchema,
    requestedAt: instantSchema,
    decidedAt: instantSchema.optional(),
    appliedAt: instantSchema.optional(),
    reviewDueAt: instantSchema.optional(),
    reviewedAt: instantSchema.optional(),
    previousState: roleAssignmentStateSchema,
    resultingState: roleAssignmentStateSchema,
    correlationId: z.string().min(1).max(128),
    sourceSystem: z.literal(ROLE_AUTHORITY_SOURCE),
  })
  .strict()
  .superRefine((value, ctx) => {
    const codes = evaluateRoleAdministrationPolicy(value, {
      actorTenantId: value.actorTenantId ?? value.tenantId,
    });
    for (const code of codes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: code,
        path: ['role'],
      });
    }
  });

export type RoleAdministrationContract = z.infer<typeof roleAdministrationContractSchema>;
