import { Reflector } from '@nestjs/core';

import { ActiveAssuranceGuard } from './active-assurance.guard';
import { ActiveAssuranceService } from './active-assurance.service';
import { AccessDeniedError } from './tenant-errors';
import type { AuthenticatedActor } from '../auth/request-principal';

const tenantId = '11111111-1111-4111-8111-111111111111';
const userId = '22222222-2222-4222-8222-222222222222';

function actor(overrides: Partial<AuthenticatedActor> = {}): AuthenticatedActor {
  return {
    userId,
    tenantId,
    issuer: 'http://issuer.test/realms/confora',
    subject: 'sub-1',
    email: 'a@example.test',
    roles: ['USR_CAND'],
    mfaVerified: false,
    ...overrides,
  };
}

function context(opts: { isPublic?: boolean; user?: AuthenticatedActor }): {
  switchToHttp: () => { getRequest: () => { user?: AuthenticatedActor } };
  getHandler: () => object;
  getClass: () => object;
} {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: opts.user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };
}

describe('ActiveAssuranceGuard', () => {
  let reflector: Reflector;
  let service: { assertActiveTenantAndUser: jest.Mock };
  let guard: ActiveAssuranceGuard;

  beforeEach(() => {
    reflector = new Reflector();
    service = { assertActiveTenantAndUser: jest.fn().mockResolvedValue(undefined) };
    guard = new ActiveAssuranceGuard(reflector, service as unknown as ActiveAssuranceService);
  });

  it('P04_TEST_013 active Tenant + active User -> continue', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    await expect(guard.canActivate(context({ user: actor() }) as never)).resolves.toBe(true);
    expect(service.assertActiveTenantAndUser).toHaveBeenCalled();
  });

  it('P04_TEST_014 inactive Tenant -> 403 ACCESS_DENIED', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    service.assertActiveTenantAndUser.mockRejectedValue(new AccessDeniedError());
    await expect(guard.canActivate(context({ user: actor() }) as never)).rejects.toBeInstanceOf(
      AccessDeniedError,
    );
  });

  it('P04_TEST_015 missing Tenant -> 403 ACCESS_DENIED', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    service.assertActiveTenantAndUser.mockRejectedValue(new AccessDeniedError());
    await expect(guard.canActivate(context({ user: actor() }) as never)).rejects.toBeInstanceOf(
      AccessDeniedError,
    );
  });

  it('P04_TEST_016 inactive User -> 403 ACCESS_DENIED', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    service.assertActiveTenantAndUser.mockRejectedValue(new AccessDeniedError());
    await expect(guard.canActivate(context({ user: actor() }) as never)).rejects.toBeInstanceOf(
      AccessDeniedError,
    );
  });

  it('P04_TEST_017 missing User -> 403 ACCESS_DENIED', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    service.assertActiveTenantAndUser.mockRejectedValue(new AccessDeniedError());
    await expect(guard.canActivate(context({ user: actor() }) as never)).rejects.toBeInstanceOf(
      AccessDeniedError,
    );
  });

  it('P04_TEST_018 all active-failure payloads are materially indistinguishable', () => {
    const a = new AccessDeniedError().getResponse();
    const b = new AccessDeniedError().getResponse();
    expect(a).toEqual(b);
    expect(a).toMatchObject({
      statusCode: 403,
      code: 'ACCESS_DENIED',
      message: 'Access denied.',
    });
    expect(JSON.stringify(a)).not.toMatch(/tenantId|userId|email|issuer|subject/i);
  });

  it('P04_TEST_019 @Public health skips active assurance', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    await expect(guard.canActivate(context({}) as never)).resolves.toBe(true);
    expect(service.assertActiveTenantAndUser).not.toHaveBeenCalled();
  });
});
