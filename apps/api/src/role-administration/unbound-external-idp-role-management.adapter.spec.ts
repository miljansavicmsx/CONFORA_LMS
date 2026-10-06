import { Test } from '@nestjs/testing';
import { ROLE_AUTHORITY_SOURCE, type RoleAdministrationContractInput } from '@confora/shared-types';

import type { AuthenticatedActor } from '../auth/request-principal';
import { ExternalIdpRoleManagementPort } from './external-idp-role-management.port';
import { RoleAdministrationBoundaryService } from './role-administration-boundary.service';
import { RoleAdministrationModule } from './role-administration.module';
import {
  UnboundExternalIdpConfigurationRejectedError,
  UnboundExternalIdpRoleManagementAdapter,
} from './unbound-external-idp-role-management.adapter';

const TENANT = '11111111-1111-4111-8111-111111111111';
const OTHER_TENANT = '99999999-9999-4999-8999-999999999999';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const TARGET = '33333333-3333-4333-8333-333333333333';
const INITIATOR = '44444444-4444-4444-8444-444444444444';
const APPROVER = '55555555-5555-4555-8555-555555555555';
const REVIEWER = '66666666-6666-4666-8666-666666666666';
const APPLIED_AT = '2026-10-05T10:00:00.000Z';
const REVIEW_DUE_AT = '2026-10-06T10:00:00.000Z';
const SENTINEL = 'pkg02-sentinel-do-not-log';

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
    correlationId: 'corr-pkg02',
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
    correlationId: 'corr-pkg02-revoke',
    sourceSystem: ROLE_AUTHORITY_SOURCE,
    ...overrides,
  };
}

describe('UnboundExternalIdpRoleManagementAdapter', () => {
  const boundary = new RoleAdministrationBoundaryService();
  const adapter = UnboundExternalIdpRoleManagementAdapter.create(boundary);
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn() as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function expectNoSideEffects(): void {
    expect(adapter.networkCallCount).toBe(0);
    expect(adapter.persistenceCallCount).toBe(0);
    expect(adapter.auditWriteCount).toBe(0);
    expect(adapter.idpCallCount).toBe(0);
    expect(global.fetch).not.toHaveBeenCalled();
  }

  it('rejects an authorized grant before any network, persistence, or audit call', () => {
    const result = adapter.requestRoleChange(initiatorActor(), grantRequested());
    expect(result).toEqual({
      accepted: false,
      effect: 'UNBOUND_NO_APPLY',
      roleApplied: false,
      networkCalled: false,
      persistenceCalled: false,
      auditAppended: false,
      idpCalled: false,
      codes: ['PROVIDER_UNBOUND'],
    });
    expectNoSideEffects();
  });

  it('rejects an authorized revoke before any network, persistence, or audit call', () => {
    const result = adapter.requestRoleChange(initiatorActor(), revokeApplied());
    expect(result.accepted).toBe(false);
    expect(result.codes).toEqual(['PROVIDER_UNBOUND']);
    expect(result.roleApplied).toBe(false);
    expect(result.idpCalled).toBe(false);
    expectNoSideEffects();
  });

  it('rejects a missing authenticated actor before reading command secrets', () => {
    const result = adapter.requestRoleChange(null, {
      ...grantRequested(),
      password: SENTINEL,
    });
    expect(result.codes).toEqual(['ACTOR_NOT_AUTHENTICATED']);
    expect(JSON.stringify(result)).not.toContain(SENTINEL);
    expectNoSideEffects();
  });

  it('rejects an empty actor user id and an empty tenant id', () => {
    const result = adapter.requestRoleChange(
      initiatorActor({ userId: '   ', tenantId: '' }),
      grantRequested(),
    );
    expect(result.accepted).toBe(false);
    expect(result.codes).toEqual(['ACTOR_USER_ID_EMPTY', 'ACTOR_TENANT_EMPTY']);
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expectNoSideEffects();
  });

  it('rejects a missing STAFF_ROLEADM authority role', () => {
    const result = adapter.requestRoleChange(
      initiatorActor({ roles: ['COMPLAINT_HANDLER'] }),
      grantRequested(),
    );
    expect(result.codes).toContain('ACTOR_AUTHORITY_ROLE_MISSING');
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expectNoSideEffects();
  });

  it('rejects forged metadata authority when actor.roles lacks STAFF_ROLEADM', () => {
    const result = adapter.requestRoleChange(initiatorActor({ roles: ['STAFF_DIR'] }), {
      ...grantRequested(),
      roles: ['STAFF_ROLEADM'],
      initiatorRole: 'STAFF_ROLEADM',
    });
    expect(result.codes).toContain('ACTOR_AUTHORITY_ROLE_MISSING');
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expectNoSideEffects();
  });

  it('rejects the wrong canonical role as role-administration authority', () => {
    const result = adapter.requestRoleChange(
      initiatorActor({ roles: ['STAFF_AUD'] }),
      grantRequested(),
    );
    expect(result.codes).toContain('ACTOR_AUTHORITY_ROLE_MISSING');
    expect(result.roleApplied).toBe(false);
    expectNoSideEffects();
  });

  it('rejects a cross-tenant command and does not echo the foreign tenant', () => {
    const result = adapter.requestRoleChange(
      initiatorActor(),
      grantRequested({ targetTenantId: OTHER_TENANT }),
    );
    expect(result.codes).toContain('CROSS_TENANT_ASSIGNMENT_FORBIDDEN');
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expect(JSON.stringify(result)).not.toContain(OTHER_TENANT);
    expectNoSideEffects();
  });

  it('rejects a malformed command', () => {
    const result = adapter.requestRoleChange(initiatorActor(), [SENTINEL]);
    expect(result.codes).toContain('COMMAND_SCHEMA_REJECTED');
    expect(JSON.stringify(result)).not.toContain(SENTINEL);
    expectNoSideEffects();
  });

  it('rejects an unsupported operation', () => {
    const result = adapter.requestRoleChange(initiatorActor(), {
      ...grantRequested(),
      operation: 'TRANSFER',
    });
    expect(result.codes).toContain('UNSUPPORTED_OPERATION');
    expect(result.codes).toContain('COMMAND_SCHEMA_REJECTED');
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expectNoSideEffects();
  });

  it('rejects a target role other than COMPLAINT_HANDLER', () => {
    const result = adapter.requestRoleChange(
      initiatorActor(),
      grantRequested({ role: 'STAFF_DIR' }),
    );
    expect(result.codes).toContain('MANAGED_ROLE_FORBIDDEN');
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expectNoSideEffects();
  });

  it('rejects STAFF_ROLEADM as a managed role', () => {
    const result = adapter.requestRoleChange(
      initiatorActor(),
      grantRequested({ role: 'STAFF_ROLEADM' }),
    );
    expect(result.codes).toContain('MANAGED_ROLE_FORBIDDEN');
    expect(result.roleApplied).toBe(false);
    expectNoSideEffects();
  });

  it('rejects legacy role aliases instead of treating them as canonical authority', () => {
    const result = adapter.requestRoleChange(initiatorActor(), grantRequested({ role: 'admin' }));
    expect(result.codes).toContain('LEGACY_ROLE_ALIAS_REJECTED');
    expect(result.codes).toContain('MANAGED_ROLE_FORBIDDEN');
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expectNoSideEffects();
  });

  it('rejects decision-party substitution on grant approval', () => {
    const result = adapter.requestRoleChange(initiatorActor(), grantApproved());
    expect(result.codes).toContain('ACTOR_DECISION_PARTY_MISMATCH');
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expectNoSideEffects();
  });

  it('keeps four-eyes approval unbound and does not apply the role', () => {
    const result = adapter.requestRoleChange(approverActor(), grantApproved());
    expect(result.codes).toEqual(['PROVIDER_UNBOUND']);
    expect(result.roleApplied).toBe(false);
    expectNoSideEffects();
  });

  it('rejects revoke review by the same actor', () => {
    const reviewed = revokeApplied({
      decision: 'REVIEWED',
      previousState: 'REVOKED',
      resultingState: 'REVOKED',
      reviewerUserId: REVIEWER,
      reviewerExternalSubjectId: 'reviewer-subject',
      reviewerRole: 'STAFF_ROLEADM',
      reviewedAt: '2026-10-05T12:00:00.000Z',
    });
    const result = adapter.requestRoleChange(initiatorActor(), reviewed);
    expect(result.codes).toContain('ACTOR_DECISION_PARTY_MISMATCH');
    expect(result.codes).not.toContain('PROVIDER_UNBOUND');
    expectNoSideEffects();
  });

  it('returns the same rejection for a repeated command', () => {
    const command = grantRequested();
    const first = adapter.requestRoleChange(initiatorActor(), command);
    const second = adapter.requestRoleChange(initiatorActor(), command);
    expect(second).toEqual(first);
    expect(first.codes).toEqual(['PROVIDER_UNBOUND']);
    expectNoSideEffects();
  });

  it('rejects a privileged caller who has not completed MFA before any IdP call', () => {
    const result = adapter.requestRoleChange(
      initiatorActor({ mfaVerified: false }),
      grantRequested(),
    );
    expect(result.codes).toContain('MFA_ASSURANCE_REQUIRED');
    expect(result.idpCalled).toBe(false);
    expectNoSideEffects();
  });

  it('rejects adapter configuration that carries a secret, token, or client credential', () => {
    const forbidden = [
      { secret: SENTINEL },
      { token: SENTINEL },
      { clientSecret: SENTINEL },
      { client_secret: SENTINEL },
      { credential: SENTINEL },
      { password: SENTINEL },
      { provider: 'keycloak', host: 'https://idp.example', realm: 'confora' },
      { nested: { token: SENTINEL } },
      [SENTINEL],
      SENTINEL,
    ];
    for (const configuration of forbidden) {
      expect(() => UnboundExternalIdpRoleManagementAdapter.create(boundary, configuration)).toThrow(
        UnboundExternalIdpConfigurationRejectedError,
      );
      try {
        UnboundExternalIdpRoleManagementAdapter.create(boundary, configuration);
      } catch (error) {
        expect(error).toBeInstanceOf(UnboundExternalIdpConfigurationRejectedError);
        expect(String(error)).not.toContain(SENTINEL);
        expect(JSON.stringify(error)).not.toContain(SENTINEL);
        if (error instanceof UnboundExternalIdpConfigurationRejectedError) {
          expect(error.codes).toEqual(['CONFIGURATION_REJECTED']);
        }
      }
    }
    expect(UnboundExternalIdpRoleManagementAdapter.create(boundary, {}).idpCallCount).toBe(0);
    expect(UnboundExternalIdpRoleManagementAdapter.create(boundary).idpCallCount).toBe(0);
  });

  it('loads the port without audit, persistence, or provider collaborators', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RoleAdministrationModule],
    }).compile();
    const port = moduleRef.get(ExternalIdpRoleManagementPort);
    const resolved = moduleRef.get(UnboundExternalIdpRoleManagementAdapter);
    expect(port).toBe(resolved);
    const providers = Reflect.getMetadata('providers', RoleAdministrationModule) as unknown[];
    const serialized = JSON.stringify(providers, (_key, value: unknown) =>
      typeof value === 'function' ? value.name : value,
    );
    expect(serialized).not.toContain('AuditService');
    expect(serialized).not.toContain('PrismaService');
    expect(serialized).not.toContain('HttpService');
    const result = port.requestRoleChange(initiatorActor(), grantRequested());
    expect(result.codes).toEqual(['PROVIDER_UNBOUND']);
    expect(result.persistenceCalled).toBe(false);
    expect(result.auditAppended).toBe(false);
    expect(result.idpCalled).toBe(false);
    await moduleRef.close();
  });
});
