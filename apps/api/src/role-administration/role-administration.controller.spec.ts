import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ForbiddenException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ROLE_AUTHORITY_SOURCE, type RoleAdministrationContractInput } from '@confora/shared-types';

import type { AuthenticatedActor, RequestWithPrincipal } from '../auth/request-principal';
import { parseRoleAdministrationCommandDto } from './dto/role-administration-command.dto';
import {
  RoleAdministrationAuthorityGuard,
  RoleAdministrationController,
} from './role-administration.controller';
import type { RoleAdministrationWorkflowService } from './role-administration-workflow.service';

const TENANT = '11111111-1111-4111-8111-111111111111';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const TARGET = '33333333-3333-4333-8333-333333333333';
const INITIATOR = '44444444-4444-4444-8444-444444444444';
const REQUESTED_AT = '2026-10-05T10:00:00.000Z';

function actor(overrides: Partial<AuthenticatedActor> = {}): AuthenticatedActor {
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
    correlationId: 'corr-pkg03-http',
    sourceSystem: ROLE_AUTHORITY_SOURCE,
    ...overrides,
  };
}

function requestWith(principal: AuthenticatedActor | undefined): RequestWithPrincipal {
  return { user: principal };
}

describe('RoleAdministrationController', () => {
  const execute = jest.fn();
  const workflow = { execute } as unknown as RoleAdministrationWorkflowService;
  const controller = new RoleAdministrationController(workflow);
  const guard = new RoleAdministrationAuthorityGuard();

  beforeEach(() => {
    execute.mockReset();
    execute.mockResolvedValue({
      recorded: true,
      roleApplied: false,
      externalEffect: 'NONE',
      reviewObligationCreated: false,
      auditEvents: ['ROLE_GRANT_REQUESTED'],
      codes: [],
    });
  });

  it('rejects a malformed command in the DTO', () => {
    const parsed = parseRoleAdministrationCommandDto({ role: 'COMPLAINT_HANDLER' });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['COMMAND_SCHEMA_REJECTED']);
    }
  });

  it('rejects an unknown command field', () => {
    const parsed = parseRoleAdministrationCommandDto({ ...grantRequested(), extraNote: 'nope' });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['COMMAND_SCHEMA_REJECTED']);
    }
  });

  it('rejects a provider field', () => {
    const parsed = parseRoleAdministrationCommandDto({ ...grantRequested(), provider: 'keycloak' });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['COMMAND_FIELD_FORBIDDEN']);
    }
  });

  it('rejects a host or realm field', () => {
    const parsed = parseRoleAdministrationCommandDto({
      ...grantRequested(),
      host: 'https://idp.example',
      realm: 'confora',
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['COMMAND_FIELD_FORBIDDEN']);
    }
  });

  it('rejects a secret or token field', () => {
    const parsed = parseRoleAdministrationCommandDto({
      ...grantRequested(),
      secret: 'sentinel',
      token: 'sentinel',
    });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['COMMAND_FIELD_FORBIDDEN']);
    }
  });

  it('passes the server actor and ignores body authority fields', async () => {
    const serverActor = actor();
    await controller.execute(requestWith(serverActor), grantRequested());
    expect(execute).toHaveBeenCalledWith(serverActor, expect.objectContaining({ role: 'COMPLAINT_HANDLER' }));
    const calls = execute.mock.calls as ReadonlyArray<readonly [AuthenticatedActor, unknown]>;
    const passedActor = calls[0]?.[0];
    if (passedActor === undefined) {
      throw new Error('expected the workflow to receive the server actor');
    }
    expect(passedActor).toBe(serverActor);
    expect(passedActor.userId).toBe(INITIATOR);
  });

  it('requires an authenticated server actor', async () => {
    await expect(controller.execute(requestWith(undefined), grantRequested())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it('requires MFA and STAFF_ROLEADM', () => {
    expect(() =>
      guard.canActivate({
        switchToHttp: () => ({ getRequest: () => requestWith(actor({ mfaVerified: false })) }),
      } as never),
    ).toThrow(ForbiddenException);
    expect(() =>
      guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => requestWith(actor({ roles: ['COMPLAINT_HANDLER'] })),
        }),
      } as never),
    ).toThrow(ForbiddenException);
  });

  it('does not treat body roles as authority', async () => {
    const serverActor = actor({ roles: ['COMPLAINT_HANDLER'], mfaVerified: true });
    await expect(
      controller.execute(requestWith(serverActor), {
        ...grantRequested(),
        roles: ['STAFF_ROLEADM'],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects a forbidden provider field before the workflow', async () => {
    await expect(
      controller.execute(requestWith(actor()), { ...grantRequested(), provider: 'keycloak' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(execute).not.toHaveBeenCalled();
  });

  it('does not log the actor or embed a provider client', () => {
    const source = readFileSync(resolve(__dirname, 'role-administration.controller.ts'), 'utf8');
    expect(source).not.toContain('console.');
    expect(source).not.toContain('Logger');
    expect(source).not.toContain('fetch(');
    expect(source).toContain('getRequestPrincipal');
  });
});
