import { Test } from '@nestjs/testing';
import { ROLE_AUTHORITY_SOURCE, type RoleAdministrationContractInput } from '@confora/shared-types';

import type { AuthenticatedActor } from '../auth/request-principal';
import { RoleAdministrationBoundaryService } from './role-administration-boundary.service';
import { RoleAdministrationModule } from './role-administration.module';

const TENANT = '11111111-1111-4111-8111-111111111111';
const OTHER_TENANT = '99999999-9999-4999-8999-999999999999';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const TARGET = '33333333-3333-4333-8333-333333333333';
const INITIATOR = '44444444-4444-4444-8444-444444444444';
const APPROVER = '55555555-5555-4555-8555-555555555555';
const REVIEWER = '66666666-6666-4666-8666-666666666666';
const APPLIED_AT = '2026-10-05T10:00:00.000Z';
const REVIEW_DUE_AT = '2026-10-06T10:00:00.000Z';
const SECRET = 'super-secret-token-value';

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
    requestedAt: APPLIED_AT,
    previousState: 'ABSENT',
    resultingState: 'PENDING',
    correlationId: 'corr-pkg01',
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
    decidedAt: '2026-10-05T10:05:00.000Z',
    previousState: 'PENDING',
    resultingState: 'PENDING',
    ...overrides,
  });
}

function revokeApplied(
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
    decision: 'APPLIED',
    requestedAt: APPLIED_AT,
    appliedAt: APPLIED_AT,
    reviewDueAt: REVIEW_DUE_AT,
    previousState: 'ACTIVE',
    resultingState: 'REVOKED',
    correlationId: 'corr-pkg01-revoke',
    sourceSystem: ROLE_AUTHORITY_SOURCE,
    ...overrides,
  };
}

describe('RoleAdministrationBoundaryService', () => {
  const service = new RoleAdministrationBoundaryService();

  it('accepts a grant request from the initiator and performs no mutation', () => {
    const result = service.evaluate(initiatorActor(), grantRequested());
    expect(result).toEqual({
      accepted: true,
      effect: 'POLICY_GATE_ONLY',
      roleMutationPerformed: false,
      auditAppended: false,
      idpCalled: false,
    });
  });

  it('accepts grant approval only from the distinct approver', () => {
    expect(service.evaluate(approverActor(), grantApproved()).accepted).toBe(true);
    const initiatorAttempt = service.evaluate(initiatorActor(), grantApproved());
    expect(initiatorAttempt.accepted).toBe(false);
    if (!initiatorAttempt.accepted) {
      expect(initiatorAttempt.codes).toContain('ACTOR_DECISION_PARTY_MISMATCH');
    }
  });

  it('rejects a missing actor before reading the command', () => {
    const result = service.evaluate(null, { password: SECRET });
    expect(result).toEqual({ accepted: false, codes: ['ACTOR_NOT_AUTHENTICATED'] });
    expect(JSON.stringify(result)).not.toContain(SECRET);
  });

  it('rejects metadata authority when actor.roles lacks STAFF_ROLEADM', () => {
    const result = service.evaluate(
      initiatorActor({ roles: ['COMPLAINT_HANDLER'] }),
      grantRequested(),
    );
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.codes).toContain('ACTOR_AUTHORITY_ROLE_MISSING');
      expect(result.codes).not.toContain('ACTOR_DECISION_PARTY_MISMATCH');
    }
  });

  it('rejects a privileged caller who has not completed MFA', () => {
    const result = service.evaluate(initiatorActor({ mfaVerified: false }), grantRequested());
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.codes).toContain('MFA_ASSURANCE_REQUIRED');
    }
  });

  it('rejects an actor tenant that differs from the command tenant', () => {
    const result = service.evaluate(initiatorActor({ tenantId: OTHER_TENANT }), grantRequested());
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.codes).toContain('ACTOR_TENANT_MISMATCH');
      expect(result.codes).toContain('CROSS_TENANT_ASSIGNMENT_FORBIDDEN');
      expect(JSON.stringify(result)).not.toContain(OTHER_TENANT);
    }
  });

  it('rejects a cross-tenant target', () => {
    const result = service.evaluate(
      initiatorActor(),
      grantRequested({ targetTenantId: OTHER_TENANT }),
    );
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.codes).toContain('CROSS_TENANT_ASSIGNMENT_FORBIDDEN');
      expect(JSON.stringify(result)).not.toContain(OTHER_TENANT);
    }
  });

  it('rejects an empty actor user id and an empty subject', () => {
    const emptyUser = service.evaluate(initiatorActor({ userId: '   ' }), grantRequested());
    expect(emptyUser).toEqual({ accepted: false, codes: ['ACTOR_USER_ID_EMPTY'] });
    const emptySubject = service.evaluate(initiatorActor({ subject: '' }), grantRequested());
    expect(emptySubject).toEqual({ accepted: false, codes: ['ACTOR_SUBJECT_EMPTY'] });
  });

  it('rejects self-assignment', () => {
    const result = service.evaluate(
      initiatorActor({ userId: TARGET, subject: 'target-subject' }),
      grantRequested({
        initiatorUserId: TARGET,
        initiatorExternalSubjectId: 'target-subject',
        targetUserId: TARGET,
        targetExternalSubjectId: 'target-subject',
      }),
    );
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.codes).toContain('SELF_ASSIGNMENT_FORBIDDEN');
    }
  });

  it('rejects a grant apply that does not move PENDING to ACTIVE', () => {
    const result = service.evaluate(
      approverActor(),
      grantApproved({
        decision: 'APPLIED',
        appliedAt: APPLIED_AT,
        previousState: 'ABSENT',
        resultingState: 'ABSENT',
      }),
    );
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.codes).toContain('INVALID_STATE_TRANSITION');
    }
  });

  it('returns the same decision for a repeated command', () => {
    const command = grantRequested();
    const actor = initiatorActor();
    expect(service.evaluate(actor, command)).toEqual(service.evaluate(actor, command));
  });

  it('does not create an audit event or echo forbidden command fields', () => {
    const result = service.evaluate(initiatorActor(), {
      ...grantRequested(),
      password: SECRET,
      accessToken: SECRET,
      email: 'person@example.test',
    });
    const rendered = JSON.stringify(result);
    expect(rendered).not.toContain(SECRET);
    expect(rendered).not.toContain('person@example.test');
    expect(rendered).not.toContain('password');
    expect(rendered).not.toContain('ROLE_GRANT_REQUESTED');
    if (result.accepted) {
      expect(result.auditAppended).toBe(false);
    }
  });

  it('rejects legacy role aliases', () => {
    const result = service.evaluate(
      initiatorActor(),
      grantRequested({ role: 'complaint_handler' }),
    );
    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.codes).toContain('LEGACY_ROLE_ALIAS_REJECTED');
      expect(result.codes).toContain('COMMAND_SCHEMA_REJECTED');
    }
  });

  it('accepts revoke apply from the revoke actor and review from a different reviewer', () => {
    expect(service.evaluate(initiatorActor(), revokeApplied()).accepted).toBe(true);
    const reviewed = revokeApplied({
      decision: 'REVIEWED',
      previousState: 'REVOKED',
      resultingState: 'REVOKED',
      reviewerUserId: REVIEWER,
      reviewerExternalSubjectId: 'reviewer-subject',
      reviewerRole: 'STAFF_ROLEADM',
      reviewedAt: '2026-10-05T12:00:00.000Z',
    });
    expect(
      service.evaluate(
        initiatorActor({
          userId: REVIEWER,
          subject: 'reviewer-subject',
          email: 'reviewer@example.test',
        }),
        reviewed,
      ).accepted,
    ).toBe(true);
    const sameActor = service.evaluate(initiatorActor(), reviewed);
    expect(sameActor.accepted).toBe(false);
    if (!sameActor.accepted) {
      expect(sameActor.codes).toContain('ACTOR_DECISION_PARTY_MISMATCH');
    }
  });

  it('loads without audit or persistence collaborators', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RoleAdministrationModule],
    }).compile();
    const resolved = moduleRef.get(RoleAdministrationBoundaryService);
    expect(resolved).toBeInstanceOf(RoleAdministrationBoundaryService);
    expect(resolved.evaluate(initiatorActor(), grantRequested()).accepted).toBe(true);
    await moduleRef.close();
  });
});
