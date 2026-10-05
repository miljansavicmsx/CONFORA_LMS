import { z } from 'zod';

import { rbacRoleSchema, type RbacRole } from './roles.js';

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

export const ROLE_ADMINISTRATION_POLICY_CODES = [
  'SELF_ASSIGNMENT_FORBIDDEN',
  'SELF_REVOCATION_FORBIDDEN',
  'GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER',
  'GRANT_APPROVER_REQUIRED',
  'GRANT_APPROVER_SUBJECT_REQUIRED',
  'TARGET_CANNOT_BE_APPROVER',
  'STAFF_ROLEADM_SELF_MANAGEMENT_FORBIDDEN',
  'REVOKE_REVIEWER_REQUIRED',
  'REVOKE_REVIEWER_SUBJECT_REQUIRED',
  'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER',
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
  requestId: string;
  targetUserId: string;
  targetExternalSubjectId: string;
  role: RbacRole;
  initiatorUserId: string;
  initiatorExternalSubjectId: string;
  approverUserId?: string | undefined;
  approverExternalSubjectId?: string | undefined;
  reasonCode: string;
  decision: RoleAdministrationDecision;
  requestedAt: string;
  decidedAt?: string | undefined;
  appliedAt?: string | undefined;
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

/**
 * Policy evaluation only. Tenant equality is decided here from the
 * caller-supplied actor tenant. The contract itself has one tenantId
 * and cannot represent a permitted cross-tenant assignment.
 */
export function evaluateRoleAdministrationPolicy(
  value: RoleAdministrationContractInput,
  context: RoleAdministrationActorContext,
): readonly RoleAdministrationPolicyCode[] {
  const codes: RoleAdministrationPolicyCode[] = [];

  if (context.actorTenantId !== value.tenantId) {
    pushUnique(
      codes,
      value.operation === 'GRANT'
        ? 'CROSS_TENANT_ASSIGNMENT_FORBIDDEN'
        : 'CROSS_TENANT_REVOCATION_FORBIDDEN',
    );
  }

  if (value.role === 'STAFF_ROLEADM') {
    pushUnique(codes, 'STAFF_ROLEADM_SELF_MANAGEMENT_FORBIDDEN');
  }

  const sameUser =
    value.targetUserId === value.initiatorUserId ||
    value.targetExternalSubjectId === value.initiatorExternalSubjectId;
  if (sameUser) {
    pushUnique(
      codes,
      value.operation === 'GRANT' ? 'SELF_ASSIGNMENT_FORBIDDEN' : 'SELF_REVOCATION_FORBIDDEN',
    );
  }

  if (value.approverUserId !== undefined && value.approverUserId === value.targetUserId) {
    pushUnique(codes, 'TARGET_CANNOT_BE_APPROVER');
  }
  if (
    value.approverExternalSubjectId !== undefined &&
    value.approverExternalSubjectId === value.targetExternalSubjectId
  ) {
    pushUnique(codes, 'TARGET_CANNOT_BE_APPROVER');
  }

  if (value.operation === 'GRANT') {
    if (value.approverUserId !== undefined && value.approverUserId === value.initiatorUserId) {
      pushUnique(codes, 'GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER');
    }
    if (
      value.approverExternalSubjectId !== undefined &&
      value.approverExternalSubjectId === value.initiatorExternalSubjectId
    ) {
      pushUnique(codes, 'GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER');
    }
    if (GRANT_DECISIONS_REQUIRING_APPROVER.has(value.decision)) {
      if (value.approverUserId === undefined) pushUnique(codes, 'GRANT_APPROVER_REQUIRED');
      if (value.approverExternalSubjectId === undefined) {
        pushUnique(codes, 'GRANT_APPROVER_SUBJECT_REQUIRED');
      }
    }
  }

  if (value.operation === 'REVOKE' && value.decision === 'REVIEWED') {
    if (value.approverUserId === undefined) pushUnique(codes, 'REVOKE_REVIEWER_REQUIRED');
    if (value.approverExternalSubjectId === undefined) {
      pushUnique(codes, 'REVOKE_REVIEWER_SUBJECT_REQUIRED');
    }
    if (value.approverUserId !== undefined && value.approverUserId === value.initiatorUserId) {
      pushUnique(codes, 'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER');
    }
    if (
      value.approverExternalSubjectId !== undefined &&
      value.approverExternalSubjectId === value.initiatorExternalSubjectId
    ) {
      pushUnique(codes, 'REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER');
    }
  }

  return codes;
}

export const roleAdministrationContractSchema = z
  .object({
    operation: roleAdministrationOperationSchema,
    tenantId: z.string().uuid(),
    requestId: z.string().uuid(),
    targetUserId: z.string().uuid(),
    targetExternalSubjectId: subjectIdSchema,
    role: rbacRoleSchema,
    initiatorUserId: z.string().uuid(),
    initiatorExternalSubjectId: subjectIdSchema,
    approverUserId: z.string().uuid().optional(),
    approverExternalSubjectId: subjectIdSchema.optional(),
    reasonCode: reasonCodeSchema,
    decision: roleAdministrationDecisionSchema,
    requestedAt: instantSchema,
    decidedAt: instantSchema.optional(),
    appliedAt: instantSchema.optional(),
    previousState: roleAssignmentStateSchema,
    resultingState: roleAssignmentStateSchema,
    correlationId: z.string().min(1).max(128),
    sourceSystem: z.literal(ROLE_AUTHORITY_SOURCE),
  })
  .strict()
  .superRefine((value, ctx) => {
    const codes = evaluateRoleAdministrationPolicy(value, { actorTenantId: value.tenantId });
    for (const code of codes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: code,
        path: ['role'],
      });
    }
  });

export type RoleAdministrationContract = z.infer<typeof roleAdministrationContractSchema>;
