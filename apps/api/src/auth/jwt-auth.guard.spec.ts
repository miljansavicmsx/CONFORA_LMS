import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedActor } from './request-principal';

function mockContext(request: Record<string, unknown> = {}): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const reflector = new Reflector();
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard(reflector);
  });

  it('AUTH_02 returns 401 when Authorization header is absent on protected route', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(Promise.reject(new UnauthorizedException()));

    await expect(guard.canActivate(mockContext({}))).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('AUTH_03 returns 401 when Authorization Bearer value is malformed', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(Promise.reject(new UnauthorizedException()));

    await expect(
      guard.canActivate(mockContext({ headers: { authorization: 'Bearer' } })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('AUTH_27 does not attach raw access token or full JWT payload to request', () => {
    const actor: AuthenticatedActor = {
      userId: '11111111-1111-4111-8111-111111111111',
      tenantId: '22222222-2222-4222-8222-222222222222',
      issuer: 'http://issuer.test/realms/confora',
      subject: 'opaque-sub',
      email: 'user@example.test',
      roles: ['USR_CAND'],
      mfaVerified: false,
    };

    expect(Object.keys(actor).sort()).toEqual([
      'email',
      'issuer',
      'mfaVerified',
      'roles',
      'subject',
      'tenantId',
      'userId',
    ]);
    expect(actor).not.toHaveProperty('accessToken');
    expect(actor).not.toHaveProperty('payload');
    expect(actor).not.toHaveProperty('authorization');
    expect(actor).not.toHaveProperty('rawToken');
  });
});
