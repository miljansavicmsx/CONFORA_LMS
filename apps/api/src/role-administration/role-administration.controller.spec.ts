import { readFileSync } from 'node:fs';
import type { Server } from 'node:http';
import { resolve } from 'node:path';

import {
  ForbiddenException,
  Injectable,
  Module,
  UnauthorizedException,
  UnprocessableEntityException,
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ROLE_AUTHORITY_SOURCE } from '@confora/shared-types';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import type { NextFunction, Request, Response } from 'express';

import {
  validateRoleAdministrationAuditMetadata,
  type RoleAdministrationAuditEventType,
} from '../audit/audit-event.registry';
import type { AuditAppendInput } from '../audit/audit-event.types';
import { AuditService } from '../audit/audit.service';
import { MfaAssuranceGuard } from '../auth/mfa-assurance.guard';
import {
  getRequestPrincipal,
  type AuthenticatedActor,
  type RequestWithPrincipal,
} from '../auth/request-principal';
import { ActiveAssuranceGuard } from '../tenant/active-assurance.guard';
import { ActiveAssuranceService } from '../tenant/active-assurance.service';
import { ClientTenantRejectionMiddleware } from '../tenant/client-tenant-rejection.middleware';
import { AccessDeniedError } from '../tenant/tenant-errors';
import {
  parseRoleAdministrationCommandDto,
  type RoleAdministrationCommandParseResult,
} from './dto/role-administration-command.dto';
import { ExternalIdpRoleManagementPort } from './external-idp-role-management.port';
import { RoleAdministrationBoundaryService } from './role-administration-boundary.service';
import {
  RoleAdministrationAuthorityGuard,
  RoleAdministrationController,
} from './role-administration.controller';
import { RoleAdministrationWorkflowService } from './role-administration-workflow.service';
import { UnboundExternalIdpRoleManagementAdapter } from './unbound-external-idp-role-management.adapter';

const TENANT = '11111111-1111-4111-8111-111111111111';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const TARGET = '33333333-3333-4333-8333-333333333333';
const INITIATOR = '44444444-4444-4444-8444-444444444444';
const APPROVER = '55555555-5555-4555-8555-555555555555';
const OTHER_TENANT = '99999999-9999-4999-8999-999999999999';
const REQUESTED_AT = '2026-10-05T10:00:00.000Z';
const DECIDED_AT = '2026-10-05T10:05:00.000Z';

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

function grantRequested(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    operation: 'GRANT',
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

function parse(body: unknown, trustedTenantId = TENANT): RoleAdministrationCommandParseResult {
  return parseRoleAdministrationCommandDto(body, trustedTenantId);
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
    const parsed = parse({ role: 'COMPLAINT_HANDLER' });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['COMMAND_SCHEMA_REJECTED']);
    }
  });

  it('rejects an unknown command field', () => {
    const parsed = parse({ ...grantRequested(), extraNote: 'nope' });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['COMMAND_SCHEMA_REJECTED']);
    }
  });

  it('rejects a provider field', () => {
    const parsed = parse({ ...grantRequested(), provider: 'keycloak' });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['COMMAND_FIELD_FORBIDDEN']);
    }
  });

  it('rejects a host or realm field', () => {
    const parsed = parse({
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
    const parsed = parse({
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
    expect(execute).toHaveBeenCalledWith(
      serverActor,
      expect.objectContaining({
        role: 'COMPLAINT_HANDLER',
        tenantId: TENANT,
        initiatorTenantId: TENANT,
        targetTenantId: TENANT,
      }),
    );
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

  it('rejects a client tenantId before the workflow', async () => {
    const parsed = parse({ ...grantRequested(), tenantId: TENANT });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['COMMAND_FIELD_FORBIDDEN']);
    }
    await expect(
      controller.execute(requestWith(actor()), { ...grantRequested(), tenantId: TENANT }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects alternate and nested tenant authority fields', () => {
    for (const body of [
      { ...grantRequested(), actorTenantId: TENANT },
      { ...grantRequested(), targetTenantId: TENANT },
      { ...grantRequested(), tenant: TENANT },
      { ...grantRequested(), organizationId: TENANT },
      { ...grantRequested(), actor: { tenantId: TENANT } },
      { ...grantRequested(), target: { tenantId: TENANT } },
    ]) {
      const parsed = parse(body);
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) {
        expect(parsed.codes).toEqual(['COMMAND_FIELD_FORBIDDEN']);
      }
    }
  });

  it('rejects client APPLIED before the workflow', async () => {
    for (const decision of ['APPLIED', 'applied', 'Applied']) {
      const parsed = parse({ ...grantRequested(), decision });
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) {
        expect(parsed.codes).toEqual(['CLIENT_APPLIED_DECISION_FORBIDDEN']);
      }
    }
    await expect(
      controller.execute(requestWith(actor()), { ...grantRequested(), decision: 'APPLIED' }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects an empty trusted tenant before the workflow', () => {
    const parsed = parse(grantRequested(), '   ');
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) {
      expect(parsed.codes).toEqual(['ACTOR_TENANT_EMPTY']);
    }
  });

  it('binds only the trusted actor tenant and does not accept a body actor', async () => {
    const serverActor = actor();
    await controller.execute(requestWith(serverActor), grantRequested());
    const command = execute.mock.calls[0]?.[1] as { tenantId: string; initiatorUserId: string };
    expect(command.tenantId).toBe(serverActor.tenantId);
    expect(command.initiatorUserId).toBe(INITIATOR);
    await expect(
      controller.execute(requestWith(serverActor), {
        ...grantRequested(),
        userId: '55555555-5555-4555-8555-555555555555',
        email: 'forged@example.test',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('does not log the actor or embed a provider client', () => {
    const source = readFileSync(resolve(__dirname, 'role-administration.controller.ts'), 'utf8');
    expect(source).not.toContain('console.');
    expect(source).not.toContain('Logger');
    expect(source).not.toContain('fetch(');
    expect(source).toContain('getRequestPrincipal');
  });
});

const routeEffects: string[] = [];

const routeAudit = {
  append: jest.fn((actor: AuthenticatedActor, input: AuditAppendInput) => {
    routeEffects.push(`audit:${input.eventType}`);
    validateRoleAdministrationAuditMetadata(
      input.eventType as RoleAdministrationAuditEventType,
      input.metadata,
    );
    if (
      input.metadata !== null &&
      typeof input.metadata === 'object' &&
      !Array.isArray(input.metadata) &&
      input.metadata['tenantId'] !== actor.tenantId
    ) {
      throw new Error('audit tenant drifted from the trusted actor');
    }
    return { id: input.eventType };
  }),
};

@Injectable()
class RoutePrincipalMiddleware {
  use(req: Request & RequestWithPrincipal, _res: Response, next: NextFunction): void {
    const encoded = req.header('x-test-principal');
    if (encoded !== undefined && encoded.length > 0) {
      req.user = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as AuthenticatedActor;
    }
    next();
  }
}

@Injectable()
class RouteAuthenticationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    if (!getRequestPrincipal(request)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

const routeActiveAssurance: Pick<ActiveAssuranceService, 'assertActiveTenantAndUser'> = {
  async assertActiveTenantAndUser(actor: AuthenticatedActor): Promise<void> {
    if (actor.userId.trim().length === 0 || actor.tenantId.trim().length === 0) {
      throw new AccessDeniedError();
    }
  },
};

@Module({
  controllers: [RoleAdministrationController],
  providers: [
    RoleAdministrationBoundaryService,
    UnboundExternalIdpRoleManagementAdapter,
    {
      provide: ExternalIdpRoleManagementPort,
      useExisting: UnboundExternalIdpRoleManagementAdapter,
    },
    RoleAdministrationWorkflowService,
    RoleAdministrationAuthorityGuard,
    { provide: AuditService, useValue: routeAudit },
    { provide: ActiveAssuranceService, useValue: routeActiveAssurance },
    { provide: APP_GUARD, useClass: RouteAuthenticationGuard },
    { provide: APP_GUARD, useClass: ActiveAssuranceGuard },
    { provide: APP_GUARD, useClass: MfaAssuranceGuard },
  ],
})
class RoleAdministrationRouteModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ClientTenantRejectionMiddleware, RoutePrincipalMiddleware).forRoutes('*');
  }
}

function principalHeader(value: AuthenticatedActor): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function grantApprovalBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...grantRequested({
      decision: 'APPROVED',
      approverUserId: APPROVER,
      approverExternalSubjectId: 'approver-subject',
      approverRole: 'STAFF_ROLEADM',
      decidedAt: DECIDED_AT,
      previousState: 'PENDING',
      resultingState: 'PENDING',
    }),
    ...overrides,
  };
}

describe('RoleAdministrationController HTTP route', () => {
  let app: INestApplication;
  let portSpy: jest.SpyInstance;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RoleAdministrationRouteModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
    const port = app.get(UnboundExternalIdpRoleManagementAdapter);
    const original = port.requestRoleChange.bind(port);
    portSpy = jest
      .spyOn(port, 'requestRoleChange')
      .mockImplementation((...args: Parameters<ExternalIdpRoleManagementPort['requestRoleChange']>) => {
        routeEffects.push('port');
        return original(...args);
      });
  });

  afterAll(async () => {
    portSpy.mockRestore();
    await app.close();
  });

  beforeEach(() => {
    routeEffects.length = 0;
    routeAudit.append.mockClear();
    portSpy.mockClear();
  });

  function http(): Server {
    return app.getHttpServer() as Server;
  }

  it('accepts a tenant-free approval, binds the trusted tenant, and fails closed unbound', async () => {
    const approver = actor({
      userId: APPROVER,
      subject: 'approver-subject',
      email: 'approver@example.test',
    });
    const response = await request(http())
      .post('/v1/role-administration/commands')
      .set('x-test-principal', principalHeader(approver))
      .send(grantApprovalBody())
      .expect(200);

    expect(response.body).toMatchObject({
      recorded: true,
      roleApplied: false,
      externalEffect: 'UNBOUND_NO_APPLY',
      reviewObligationCreated: false,
      codes: ['PROVIDER_UNBOUND'],
    });
    expect(response.body.auditEvents).toEqual(['ROLE_GRANT_APPROVED', 'ROLE_GRANT_FAILED']);
    expect(response.body.auditEvents).not.toContain('ROLE_GRANT_APPLIED');
    expect(routeEffects).toEqual(['audit:ROLE_GRANT_APPROVED', 'port', 'audit:ROLE_GRANT_FAILED']);
    expect(routeAudit.append.mock.calls[0]?.[0]).toMatchObject({
      userId: APPROVER,
      tenantId: TENANT,
    });
    expect(portSpy).toHaveBeenCalledTimes(1);
    const command = portSpy.mock.calls[0]?.[1] as {
      tenantId: string;
      targetTenantId: string;
      initiatorTenantId: string;
    };
    expect(command.tenantId).toBe(approver.tenantId);
    expect(command.targetTenantId).toBe(approver.tenantId);
    expect(command.initiatorTenantId).toBe(approver.tenantId);
    expect(JSON.stringify(response.body)).not.toContain('approver@example.test');
  });

  it('returns HTTP 400 when the body contains tenantId', async () => {
    const response = await request(http())
      .post('/v1/role-administration/commands')
      .set('x-test-principal', principalHeader(actor()))
      .send({ ...grantRequested(), tenantId: TENANT })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      code: 'CLIENT_TENANT_CONTEXT_FORBIDDEN',
    });
    expect(routeAudit.append).not.toHaveBeenCalled();
    expect(portSpy).not.toHaveBeenCalled();
  });

  it('rejects nested and alternate tenant authority before PKG-02', async () => {
    for (const extra of [
      { actorTenantId: OTHER_TENANT },
      { targetTenantId: OTHER_TENANT },
      { tenant: OTHER_TENANT },
      { organizationId: OTHER_TENANT },
      { actor: { tenantId: OTHER_TENANT } },
      { target: { tenantId: OTHER_TENANT } },
    ]) {
      routeEffects.length = 0;
      portSpy.mockClear();
      const response = await request(http())
        .post('/v1/role-administration/commands')
        .set('x-test-principal', principalHeader(actor()))
        .send({ ...grantRequested(), ...extra })
        .expect(422);
      expect(response.body.codes).toEqual(['COMMAND_FIELD_FORBIDDEN']);
      expect(portSpy).not.toHaveBeenCalled();
      expect(routeAudit.append).not.toHaveBeenCalled();
    }
  });

  it('rejects client APPLIED before PKG-02', async () => {
    for (const decision of ['APPLIED', 'applied', 'Applied']) {
      portSpy.mockClear();
      routeAudit.append.mockClear();
      const response = await request(http())
        .post('/v1/role-administration/commands')
        .set('x-test-principal', principalHeader(actor({ userId: APPROVER, subject: 'approver-subject' })))
        .send(grantApprovalBody({ decision }))
        .expect(422);
      expect(response.body.codes).toEqual(['CLIENT_APPLIED_DECISION_FORBIDDEN']);
      expect(portSpy).not.toHaveBeenCalled();
      expect(routeAudit.append).not.toHaveBeenCalled();
    }
  });

  it('rejects a missing principal', async () => {
    await request(http()).post('/v1/role-administration/commands').send(grantRequested()).expect(401);
    expect(portSpy).not.toHaveBeenCalled();
    expect(routeAudit.append).not.toHaveBeenCalled();
  });

  it('rejects an actor without STAFF_ROLEADM', async () => {
    const response = await request(http())
      .post('/v1/role-administration/commands')
      .set('x-test-principal', principalHeader(actor({ roles: ['STAFF_DIR'] })))
      .send(grantRequested())
      .expect(403);
    expect(response.body.codes).toEqual(['ACTOR_AUTHORITY_ROLE_MISSING']);
    expect(portSpy).not.toHaveBeenCalled();
  });

  it('rejects an actor without MFA', async () => {
    const response = await request(http())
      .post('/v1/role-administration/commands')
      .set('x-test-principal', principalHeader(actor({ mfaVerified: false })))
      .send(grantRequested())
      .expect(403);
    expect(response.body.code).toBe('MFA_REQUIRED');
    expect(portSpy).not.toHaveBeenCalled();
    expect(routeAudit.append).not.toHaveBeenCalled();
  });

  it('rejects an empty trusted actor tenant', async () => {
    await request(http())
      .post('/v1/role-administration/commands')
      .set('x-test-principal', principalHeader(actor({ tenantId: '   ' })))
      .send(grantRequested())
      .expect(403);
    expect(portSpy).not.toHaveBeenCalled();
    expect(routeAudit.append).not.toHaveBeenCalled();
  });

  it('does not let body actor fields replace the authenticated actor', async () => {
    const approver = actor({
      userId: APPROVER,
      subject: 'approver-subject',
      email: 'approver@example.test',
    });
    const response = await request(http())
      .post('/v1/role-administration/commands')
      .set('x-test-principal', principalHeader(approver))
      .send(
        grantApprovalBody({
          userId: INITIATOR,
          roles: ['STAFF_ROLEADM'],
          mfaVerified: true,
          email: 'forged@example.test',
        }),
      )
      .expect(422);
    expect(response.body.codes).toEqual(['COMMAND_FIELD_FORBIDDEN']);
    expect(portSpy).not.toHaveBeenCalled();
    const passedActor = routeAudit.append.mock.calls[0]?.[0] as AuthenticatedActor | undefined;
    expect(passedActor).toBeUndefined();
  });
});
