import { z } from 'zod';

import { rbacRoleSchema, type RbacRole } from './roles.js';

export { rbacRoleSchema, type RbacRole } from './roles.js';

export const httpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
export type HttpMethod = z.infer<typeof httpMethodSchema>;

export const conforaJwtPayloadSchema = z.object({
  sub: z.string(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  iss: z.string().optional(),
  aud: z.union([z.string(), z.array(z.string())]).optional(),
  azp: z.string().optional(),
  scope: z.string().optional(),
  amr: z.array(z.string()).optional(),
  mfa_verified: z.boolean().optional(),
  preferred_username: z.string().optional(),
  /** Keycloak / OIDC tenant claim (canonical). */
  tenant_id: z.string().uuid().optional(),
  /** Transitional claim names — prefer tenant_id. */
  tenantId: z.string().uuid().optional(),
  org_id: z.string().uuid().optional(),
  realm_access: z
    .object({
      roles: z.array(z.string()),
    })
    .optional(),
  resource_access: z.record(z.object({ roles: z.array(z.string()) })).optional(),
});

export type ConforaJwtPayload = z.infer<typeof conforaJwtPayloadSchema>;

export const authLoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  totp: z.string().optional(),
});

export type AuthLoginRequest = z.infer<typeof authLoginRequestSchema>;

export const authMfaVerifyRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  totp: z.string().min(6).max(10),
});

export type AuthMfaVerifyRequest = z.infer<typeof authMfaVerifyRequestSchema>;

export const authRefreshRequestSchema = z.object({
  refresh_token: z.string().min(1),
});

export type AuthRefreshRequest = z.infer<typeof authRefreshRequestSchema>;

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;

export const authMeResponseSchema = z.object({
  sub: z.string(),
  roles: z.array(rbacRoleSchema),
  scope: z.array(z.string()),
  mfa_verified: z.boolean(),
  amr: z.array(z.string()),
  preferred_username: z.string().optional(),
});

export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;

export const coiActionTypeSchema = z.enum([
  'EXAMINER_ACTION',
  'DECISION_ACTION',
  'VOTE',
  'TRAINING_RELATED',
  'ASSIGN',
  'ACCEPT',
  'START_REVIEW',
  'ELIGIBILITY_REVIEW',
  'EXAM_AUTHORIZATION',
  'RESULT_VALIDATION',
  'CERTIFICATION_DECISION',
  'CERTIFICATE_ISSUANCE',
  'CERTIFICATE_LIFECYCLE',
  'RECERTIFICATION',
  'APPEAL',
  'COMPLAINT',
  'COMPLAINT_TRIAGE',
  'COMPLAINT_INVESTIGATION',
  'COMPLAINT_DECISION',
  'COMPLAINT_ACTION_IMPLEMENTATION',
]);

export type CoiActionType = z.infer<typeof coiActionTypeSchema>;

export const coiEvaluationResultSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().optional(),
});

export type CoiEvaluationResult = z.infer<typeof coiEvaluationResultSchema>;

export const ROUTE_PERMISSIONS = [
  {
    prefix: '/admin',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const,
    roles: [
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'STAFF_AUD',
      'SME',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/auth',
    methods: ['GET', 'POST'] as const,
    roles: [
      'USR_CAND',
      'USR_CERT',
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'COM_TECH',
      'COM_CERT',
      'COM_IMP',
      'COM_APP',
      'STAFF_AUD',
      'SME',
      'EXAMINER',
      'INVIGILATOR',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/api/auth',
    methods: ['GET'] as const,
    roles: [
      'USR_CAND',
      'USR_CERT',
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'COM_TECH',
      'COM_CERT',
      'COM_IMP',
      'COM_APP',
      'STAFF_AUD',
      'SME',
      'EXAMINER',
      'INVIGILATOR',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/api/exams',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const,
    roles: [
      'USR_CAND',
      'USR_CERT',
      'STAFF_TRAINADM',
      'EXAMINER',
      'INVIGILATOR',
      'STAFF_SYSADM',
      'STAFF_DIR',
      'COM_TECH',
      'COM_CERT',
      'COM_IMP',
      'COM_APP',
      'STAFF_AUD',
      'SME',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/exam',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const,
    roles: [
      'USR_CAND',
      'USR_CERT',
      'STAFF_TRAINADM',
      'EXAMINER',
      'INVIGILATOR',
      'STAFF_SYSADM',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/cert',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const,
    roles: [
      'USR_CAND',
      'USR_CERT',
      'STAFF_DIR',
      'COM_TECH',
      'COM_CERT',
      'COM_IMP',
      'COM_APP',
      'STAFF_SYSADM',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/v1/audit',
    methods: ['GET', 'POST'] as const,
    roles: [
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_AUD',
      'STAFF_TRAINADM',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/v1/sysadmin',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const,
    roles: ['STAFF_DIR', 'STAFF_SYSADM', 'STAFF_AUD'] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/v1/ai/metrics',
    methods: ['GET'] as const,
    roles: [
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_AUD',
      'STAFF_TRAINADM',
      'SME',
      'COM_TECH',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/v1/notifications/me',
    methods: ['GET', 'PUT', 'PATCH', 'POST'] as const,
    roles: [
      'USR_CAND',
      'USR_CERT',
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'COM_TECH',
      'COM_CERT',
      'COM_IMP',
      'COM_APP',
      'STAFF_AUD',
      'SME',
      'EXAMINER',
      'INVIGILATOR',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/v1/notifications/admin',
    methods: ['GET', 'POST', 'PUT', 'PATCH'] as const,
    roles: [
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'STAFF_AUD',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/v1/admin/courses',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const,
    roles: [
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'COM_TECH',
      'STAFF_AUD',
      'SME',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/v1/admin/item-bank',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const,
    roles: [
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'COM_TECH',
      'STAFF_AUD',
      'SME',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/v1/admin/exams/configurations',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const,
    roles: [
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'COM_TECH',
      'STAFF_AUD',
      'SME',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/pdf',
    methods: ['POST'] as const,
    roles: [
      'USR_CAND',
      'USR_CERT',
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'COM_TECH',
      'COM_CERT',
      'COM_IMP',
      'COM_APP',
      'STAFF_AUD',
      'SME',
    ] as const satisfies readonly RbacRole[],
  },
  {
    prefix: '/v1',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const,
    roles: [
      'STAFF_DIR',
      'STAFF_SYSADM',
      'STAFF_TRAINADM',
      'STAFF_AUD',
      'SME',
      'COM_TECH',
      'COM_CERT',
      'COM_IMP',
      'COM_APP',
      'USR_CAND',
      'USR_CERT',
      'EXAMINER',
      'INVIGILATOR',
    ] as const satisfies readonly RbacRole[],
  },
] as const;

export type RoutePermissionRule = (typeof ROUTE_PERMISSIONS)[number];

/** Canonical privileged / staff roles (BAR-P04 OD-P04-18). Exactly 15. */
export const PRIVILEGED_ROLES: readonly RbacRole[] = [
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
];

/** Learner / non-privileged roles. Exactly 2. */
export const LEARNER_ROLES: readonly RbacRole[] = ['USR_CAND', 'USR_CERT'];

/**
 * Global MFA-mandatory roles. Same source as PRIVILEGED_ROLES (OD-P04-18).
 * ISSUANCE_OFFICER and LIFECYCLE_OFFICER are included.
 */
export const MFA_MANDATORY_ROLES: readonly RbacRole[] = PRIVILEGED_ROLES;

export const MFA_FOR_EXAM_START_ROLES: readonly RbacRole[] = ['USR_CAND', 'USR_CERT'];

export function parseScope(scope: string | undefined): string[] {
  if (!scope) return [];
  return scope.split(/\s+/).filter(Boolean);
}

export function parseRolesFromPayload(payload: ConforaJwtPayload): RbacRole[] {
  const raw = payload.realm_access?.roles ?? [];
  const out: RbacRole[] = [];
  for (const r of raw) {
    const parsed = rbacRoleSchema.safeParse(r);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

export function deriveMfaVerified(payload: ConforaJwtPayload): boolean {
  if (payload.mfa_verified === true) return true;
  const amr = payload.amr ?? [];
  return amr.some((m) => m === 'otp' || m === 'totp' || m === 'mfa');
}
