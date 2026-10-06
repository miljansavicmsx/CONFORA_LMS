import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ROLE_AUTHORITY_SOURCE, type RoleAdministrationContractInput } from '@confora/shared-types';

import {
  validateRoleAdministrationAuditMetadata,
  type RoleAdministrationAuditEventType,
} from '../audit/audit-event.registry';
import type { AuditAppendInput } from '../audit/audit-event.types';
import { AuditService } from '../audit/audit.service';
import { validateIdempotencyKey, validateOccurredAt, validateOutcome } from '../audit/audit-validators';
import type { AuthenticatedActor } from '../auth/request-principal';
import { RoleAdministrationBoundaryService } from './role-administration-boundary.service';
import { RoleAdministrationWorkflowService } from './role-administration-workflow.service';
import { UnboundExternalIdpRoleManagementAdapter } from './unbound-external-idp-role-management.adapter';

const TENANT = '11111111-1111-4111-8111-111111111111';
const OTHER_TENANT = '99999999-9999-4999-8999-999999999999';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const TARGET = '33333333-3333-4333-8333-333333333333';
const INITIATOR = '44444444-4444-4444-8444-444444444444';
const APPROVER = '55555555-5555-4555-8555-555555555555';
const REVIEWER = '66666666-6666-4666-8666-666666666666';
const REQUESTED_AT = '2026-10-05T10:00:00.000Z';
const DECIDED_AT = '2026-10-05T10:05:00.000Z';
const REVIEW_DUE_AT = '2026-10-06T10:00:00.000Z';

function initiatorActor(overrides: Partial<AuthenticatedActor> = {}): AuthenticatedActor {
  return {
    userId: INITIATOR,
    tenantId: TENANT,
    issuer: 'http://issuer.test/realms/confora',
    subject: 'initiator-subject',
    email: 'initiator@example.test',
    roles: ['STAFF_ROLEADM'],
    mfaVerified: true,
    ...overrides,
  };
}

function approverActor(overrides: Partial<AuthenticatedActor> = {}): AuthenticatedActor {
  return initiatorActor({
    userId: APPROVER,
    subject: 'approver-subject',
    email: 'approver@example.test',
    ...overrides,
  });
}

function reviewerActor(): AuthenticatedActor {
  return initiatorActor({
    userId: REVIEWER,
    subject: 'reviewer-subject',
    email: 'reviewer@example.test',
  });
}

function grantRequested(
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
    reasonCode: 'ASSIGNMENT_REQUIRED',
    decision: 'REQUESTED',
    requestedAt: REQUESTED_AT,
    previousState: 'ABSENT',
    resultingState: 'PENDING',
    correlationId: 'corr-pkg03',
    sourceSystem: ROLE_AUTHORITY_SOURCE,
    ...overrides,
  };
}

function grantApproved(
  overrides: Partial<RoleAdministrationContractInput> = {},
): RoleAdministrationContractInput {
  return grantRequested({
    decision: 'APPROVED',
    approverUserId: APPROVER,
    approverExternalSubjectId: 'approver-subject',
    approverRole: 'STAFF_ROLEADM',
    decidedAt: DECIDED_AT,
    previousState: 'PENDING',
    resultingState: 'PENDING',
    ...overrides,
  });
}

function grantRejected(): RoleAdministrationContractInput {
  return grantApproved({
    decision: 'REJECTED',
    previousState: 'PENDING',
    resultingState: 'ABSENT',
  });
}

function revokeRequested(
  overrides: Partial<RoleAdministrationContractInput> = {},
): RoleAdministrationContractInput {
  return {
    operation: 'REVOKE',
    tenantId: TENANT,
    requestId: REQUEST,
    targetUserId: TARGET,
    targetExternalSubjectId: 'target-subject',
    role: 'COMPLAINT_HANDLER',
    initiatorUserId: INITIATOR,
    initiatorExternalSubjectId: 'initiator-subject',
    initiatorRole: 'STAFF_ROLEADM',
    actorUserId: INITIATOR,
    actorExternalSubjectId: 'initiator-subject',
    actorRole: 'STAFF_ROLEADM',
    reasonCode: 'CONTAINMENT_REQUIRED',
    decision: 'REQUESTED',
    requestedAt: REQUESTED_AT,
    previousState: 'ACTIVE',
    resultingState: 'ACTIVE',
    correlationId: 'corr-pkg03-revoke',
    sourceSystem: ROLE_AUTHORITY_SOURCE,
    ...overrides,
  };
}

describe('RoleAdministrationWorkflowService', () => {
  const boundary = new RoleAdministrationBoundaryService();
  const port = UnboundExternalIdpRoleManagementAdapter.create(boundary);
  const originalFetch = global.fetch;
  let events: string[] = [];
  let metadata: Array<Record<string, unknown>> = [];
  let append: jest.Mock;
  let workflow: RoleAdministrationWorkflowService;
  let portSpy: jest.SpyInstance;

  beforeEach(() => {
    events = [];
    metadata = [];
    global.fetch = jest.fn() as typeof fetch;
    append = jest.fn((_actor: AuthenticatedActor, input: AuditAppendInput) => {
      recordAppend(input);
      return { id: input.eventType };
    });
    workflow = new RoleAdministrationWorkflowService(boundary, port, {
      append,
    } as unknown as AuditService);
    portSpy = jest.spyOn(port, 'requestRoleChange');
  });

  afterEach(() => {
    portSpy.mockRestore();
    global.fetch = originalFetch;
  });

  function recordAppend(input: AuditAppendInput): void {
    validateIdempotencyKey(input.idempotencyKey);
    validateOccurredAt(input.occurredAt);
    validateOutcome(input.outcome);
    validateRoleAdministrationAuditMetadata(
      input.eventType as RoleAdministrationAuditEventType,
      input.metadata,
    );
    events.push(input.eventType);
    metadata.push((input.metadata ?? {}) as Record<string, unknown>);
  }

  function expectNoApply(result: { roleApplied: false; auditEvents: readonly string[] }): void {
    expect(result.roleApplied).toBe(false);
    expect(result.auditEvents).not.toContain('ROLE_GRANT_APPLIED');
    expect(result.auditEvents).not.toContain('ROLE_REVOKE_APPLIED');
    expect(events).not.toContain('ROLE_GRANT_APPLIED');
    expect(events).not.toContain('ROLE_REVOKE_APPLIED');
    expect(metadata.some((item) => 'reviewDueAt' in item)).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  }

  it('records an authenticated grant request without calling PKG-02', async () => {
    const result = await workflow.execute(initiatorActor(), grantRequested());
    expect(result.recorded).toBe(true);
    expect(result.externalEffect).toBe('NONE');
    expect(events).toEqual(['ROLE_GRANT_REQUESTED']);
    expect(portSpy).not.toHaveBeenCalled();
    expectNoApply(result);
  });

  it('appends ROLE_GRANT_REQUESTED before any external effect', async () => {
    await workflow.execute(initiatorActor(), grantRequested());
    expect(events[0]).toBe('ROLE_GRANT_REQUESTED');
    expect(metadata[0]?.['role']).toBe('COMPLAINT_HANDLER');
    expect(metadata[0]?.['tenantId']).toBe(TENANT);
    expect(metadata[0]).not.toHaveProperty('password');
    expect(metadata[0]).not.toHaveProperty('accessToken');
  });

  it('calls PKG-02 only after grant approval is recorded', async () => {
    const order: string[] = [];
    append.mockImplementation((_actor: AuthenticatedActor, input: AuditAppendInput) => {
      order.push(`audit:${input.eventType}`);
      recordAppend(input);
      return { id: input.eventType };
    });
    portSpy.mockImplementation((...args: unknown[]) => {
      order.push('port');
      return UnboundExternalIdpRoleManagementAdapter.prototype.requestRoleChange.call(
        port,
        ...(args as [AuthenticatedActor, unknown]),
      );
    });
    const result = await workflow.execute(approverActor(), grantApproved());
    expect(order).toEqual(['audit:ROLE_GRANT_APPROVED', 'port', 'audit:ROLE_GRANT_FAILED']);
    expect(result.codes).toEqual(['PROVIDER_UNBOUND']);
    expect(result.externalEffect).toBe('UNBOUND_NO_APPLY');
    expectNoApply(result);
  });

  it('appends ROLE_GRANT_FAILED when the port is unbound', async () => {
    const result = await workflow.execute(approverActor(), grantApproved());
    expect(events).toContain('ROLE_GRANT_FAILED');
    expect(result.auditEvents).toContain('ROLE_GRANT_FAILED');
  });

  it('does not append ROLE_GRANT_APPLIED when the port is unbound', async () => {
    const result = await workflow.execute(approverActor(), grantApproved());
    expect(result.auditEvents).not.toContain('ROLE_GRANT_APPLIED');
    expect(result.roleApplied).toBe(false);
  });

  it('rejects the same grant initiator and approver before audit or PKG-02', async () => {
    const result = await workflow.execute(
      initiatorActor(),
      grantApproved({
        approverUserId: INITIATOR,
        approverExternalSubjectId: 'initiator-subject',
      }),
    );
    expect(result.recorded).toBe(false);
    expect(result.codes).toContain('GRANT_INITIATOR_AND_APPROVER_MUST_DIFFER');
    expect(events).toEqual([]);
    expect(portSpy).not.toHaveBeenCalled();
  });

  it('rejects an actor who is not the grant decision party', async () => {
    const result = await workflow.execute(initiatorActor(), grantApproved());
    expect(result.codes).toContain('ACTOR_DECISION_PARTY_MISMATCH');
    expect(portSpy).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it('rejects an actor who lacks STAFF_ROLEADM', async () => {
    const result = await workflow.execute(
      initiatorActor({ roles: ['COMPLAINT_HANDLER'] }),
      grantRequested(),
    );
    expect(result.codes).toContain('ACTOR_AUTHORITY_ROLE_MISSING');
    expect(portSpy).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it('rejects a target role other than COMPLAINT_HANDLER', async () => {
    const result = await workflow.execute(initiatorActor(), grantRequested({ role: 'STAFF_DIR' }));
    expect(result.recorded).toBe(false);
    expect(result.codes).toContain('COMMAND_SCHEMA_REJECTED');
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expect(portSpy).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it('rejects a cross-tenant grant before audit or PKG-02', async () => {
    const result = await workflow.execute(
      initiatorActor(),
      grantRequested({ targetTenantId: OTHER_TENANT }),
    );
    expect(result.codes).toContain('CROSS_TENANT_ASSIGNMENT_FORBIDDEN');
    expect(portSpy).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it('records grant rejection without calling PKG-02', async () => {
    const result = await workflow.execute(approverActor(), grantRejected());
    expect(events).toEqual(['ROLE_GRANT_REJECTED']);
    expect(portSpy).not.toHaveBeenCalled();
    expectNoApply(result);
  });

  it('reaches PKG-02 for an authorized immediate revoke request', async () => {
    const result = await workflow.execute(initiatorActor(), revokeRequested());
    expect(events).toEqual(['ROLE_REVOKE_REQUESTED', 'ROLE_REVOKE_FAILED']);
    expect(portSpy).toHaveBeenCalledTimes(1);
    expect(result.externalEffect).toBe('UNBOUND_NO_APPLY');
    expectNoApply(result);
  });

  it('appends ROLE_REVOKE_FAILED when revoke apply is unbound', async () => {
    const result = await workflow.execute(initiatorActor(), revokeRequested());
    expect(result.codes).toEqual(['PROVIDER_UNBOUND']);
    expect(result.auditEvents).toContain('ROLE_REVOKE_FAILED');
  });

  it('does not append ROLE_REVOKE_APPLIED when the port is unbound', async () => {
    const result = await workflow.execute(initiatorActor(), revokeRequested());
    expect(result.auditEvents).not.toContain('ROLE_REVOKE_APPLIED');
    expect(result.roleApplied).toBe(false);
  });

  it('creates no review deadline for an unapplied revoke', async () => {
    const command = revokeRequested({ reviewDueAt: REVIEW_DUE_AT });
    const result = await workflow.execute(initiatorActor(), command);
    expect(result.reviewObligationCreated).toBe(false);
    expect(metadata.every((item) => !('reviewDueAt' in item))).toBe(true);
    expect(JSON.stringify(result)).not.toContain(REVIEW_DUE_AT);
  });

  it('rejects the same revoke actor and reviewer before audit or PKG-02', async () => {
    const result = await workflow.execute(
      initiatorActor(),
      revokeRequested({
        decision: 'REVIEWED',
        previousState: 'REVOKED',
        resultingState: 'REVOKED',
        reviewerUserId: INITIATOR,
        reviewerExternalSubjectId: 'initiator-subject',
        reviewerRole: 'STAFF_ROLEADM',
        reviewedAt: '2026-10-05T12:00:00.000Z',
      }),
    );
    expect(result.codes).toContain('REVOKE_POST_REVIEW_ACTOR_MUST_DIFFER');
    expect(events).toEqual([]);
    expect(portSpy).not.toHaveBeenCalled();
  });

  it('rejects an incorrect PT24H deadline before audit or PKG-02', async () => {
    const result = await workflow.execute(
      initiatorActor(),
      revokeRequested({
        decision: 'APPLIED',
        previousState: 'ACTIVE',
        resultingState: 'REVOKED',
        appliedAt: REQUESTED_AT,
        reviewDueAt: '2026-10-05T11:00:00.000Z',
      }),
    );
    expect(result.codes).toContain('REVOKE_POST_REVIEW_DUE_PERIOD_INVALID');
    expect(events).toEqual([]);
    expect(portSpy).not.toHaveBeenCalled();
  });

  it('rejects a cross-tenant revoke before audit or PKG-02', async () => {
    const result = await workflow.execute(
      initiatorActor(),
      revokeRequested({ targetTenantId: OTHER_TENANT }),
    );
    expect(result.codes).toContain('CROSS_TENANT_REVOCATION_FORBIDDEN');
    expect(portSpy).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it('rejects an empty actor user id', async () => {
    const result = await workflow.execute(initiatorActor({ userId: '   ' }), grantRequested());
    expect(result.codes).toContain('ACTOR_USER_ID_EMPTY');
    expect(portSpy).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it('rejects an empty actor tenant id', async () => {
    const result = await workflow.execute(initiatorActor({ tenantId: '' }), grantRequested());
    expect(result.codes).toContain('ACTOR_TENANT_EMPTY');
    expect(portSpy).not.toHaveBeenCalled();
  });

  it('rejects forged STAFF_ROLEADM metadata when actor.roles lacks the role', async () => {
    const result = await workflow.execute(
      initiatorActor({ roles: ['LEARNER'] }),
      grantRequested({ initiatorRole: 'STAFF_ROLEADM' }),
    );
    expect(result.codes).toContain('ACTOR_AUTHORITY_ROLE_MISSING');
    expect(portSpy).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it('rejects an unsupported operation', async () => {
    const result = await workflow.execute(initiatorActor(), {
      ...grantRequested(),
      operation: 'TRANSFER',
    });
    expect(result.recorded).toBe(false);
    expect(result.codes).toContain('COMMAND_SCHEMA_REJECTED');
    expect(portSpy).not.toHaveBeenCalled();
    expect(events).toEqual([]);
  });

  it('does not call PKG-02 when PKG-01 rejects', async () => {
    await workflow.execute(initiatorActor({ roles: [] }), grantApproved());
    expect(portSpy).not.toHaveBeenCalled();
    expect(append).not.toHaveBeenCalled();
  });

  it('stops before PKG-02 when the first audit append fails', async () => {
    append.mockRejectedValueOnce(new Error('audit-down'));
    await expect(workflow.execute(approverActor(), grantApproved())).rejects.toThrow('audit-down');
    expect(portSpy).not.toHaveBeenCalled();
  });

  it('stops after an unbound port call when the failure audit append fails', async () => {
    append.mockImplementationOnce((_actor: AuthenticatedActor, input: AuditAppendInput) => {
      recordAppend(input);
      return { id: 'approved' };
    });
    append.mockImplementationOnce(() => {
      throw new Error('audit-down');
    });
    await expect(workflow.execute(approverActor(), grantApproved())).rejects.toThrow('audit-down');
    expect(portSpy).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['ROLE_GRANT_APPROVED']);
    expect(events).not.toContain('ROLE_GRANT_FAILED');
    expect(events).not.toContain('ROLE_GRANT_APPLIED');
  });

  it('does not record review for a revoke that this unbound slice never applied', async () => {
    const result = await workflow.execute(
      reviewerActor(),
      revokeRequested({
        decision: 'REVIEWED',
        previousState: 'REVOKED',
        resultingState: 'REVOKED',
        reviewerUserId: REVIEWER,
        reviewerExternalSubjectId: 'reviewer-subject',
        reviewerRole: 'STAFF_ROLEADM',
        reviewedAt: '2026-10-06T10:00:00.000Z',
      }),
    );
    expect(result.recorded).toBe(false);
    expect(result.codes).toEqual(['REVOKE_REVIEW_REQUIRES_APPLIED_REVOKE']);
    expect(events).toEqual([]);
    expect(portSpy).not.toHaveBeenCalled();
  });

  it('makes no direct network call and does not name a provider client', () => {
    const source = readFileSync(
      resolve(__dirname, 'role-administration-workflow.service.ts'),
      'utf8',
    );
    expect(source).not.toContain('PrismaService');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('HttpService');
    expect(source).not.toContain('console.');
    expect(source).not.toContain('Logger');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
