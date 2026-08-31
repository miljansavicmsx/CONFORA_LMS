import { Reflector } from '@nestjs/core';
import { PRIVILEGED_ROLES, type RbacRole } from '@confora/shared-types';

import { MfaAssuranceGuard } from './mfa-assurance.guard';
import { MfaRequiredError } from '../tenant/tenant-errors';
import type { AuthenticatedActor } from './request-principal';

function actor(overrides: Partial<AuthenticatedActor> = {}): AuthenticatedActor {
  return {
    userId: '22222222-2222-4222-8222-222222222222',
    tenantId: '11111111-1111-4111-8111-111111111111',
    issuer: 'http://issuer.test/realms/confora',
    subject: 'sub-1',
    email: 'a@example.test',
    roles: ['USR_CAND'],
    mfaVerified: false,
    ...overrides,
  };
}

function ctx(user?: AuthenticatedActor) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };
}

describe('MfaAssuranceGuard', () => {
  let reflector: Reflector;
  let guard: MfaAssuranceGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new MfaAssuranceGuard(reflector);
  });

  function mockMeta(publicRoute: boolean, requireMfa: boolean) {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: unknown) => {
      if (key === 'isPublic') return publicRoute;
      if (key === 'requireMfa') return requireMfa;
      return undefined;
    });
  }

  it('P04_TEST_027 privileged + mfaVerified=false -> 403 MFA_REQUIRED', () => {
    mockMeta(false, false);
    expect(() =>
      guard.canActivate(ctx(actor({ roles: ['STAFF_DIR'], mfaVerified: false })) as never),
    ).toThrow(MfaRequiredError);
  });

  it('P04_TEST_028 privileged + mfaVerified=true -> continue', () => {
    mockMeta(false, false);
    expect(
      guard.canActivate(ctx(actor({ roles: ['STAFF_DIR'], mfaVerified: true })) as never),
    ).toBe(true);
  });

  it('P04_TEST_029 all 15 privileged roles are globally MFA-required', () => {
    mockMeta(false, false);
    expect(PRIVILEGED_ROLES).toHaveLength(15);
    for (const role of PRIVILEGED_ROLES) {
      expect(() =>
        guard.canActivate(ctx(actor({ roles: [role], mfaVerified: false })) as never),
      ).toThrow(MfaRequiredError);
      expect(guard.canActivate(ctx(actor({ roles: [role], mfaVerified: true })) as never)).toBe(
        true,
      );
    }
  });

  it('P04_TEST_030 USR_CAND + false MFA is not globally MFA-rejected', () => {
    mockMeta(false, false);
    expect(
      guard.canActivate(ctx(actor({ roles: ['USR_CAND'], mfaVerified: false })) as never),
    ).toBe(true);
  });

  it('P04_TEST_031 USR_CERT + false MFA is not globally MFA-rejected', () => {
    mockMeta(false, false);
    expect(
      guard.canActivate(ctx(actor({ roles: ['USR_CERT'], mfaVerified: false })) as never),
    ).toBe(true);
  });

  it('P04_TEST_032 unknown role gains no privilege / no MFA mandate', () => {
    mockMeta(false, false);
    expect(
      guard.canActivate(
        ctx(actor({ roles: ['NOT_A_ROLE' as RbacRole], mfaVerified: false })) as never,
      ),
    ).toBe(true);
  });

  it('P04_TEST_033 @RequireMfa + learner false -> 403 MFA_REQUIRED', () => {
    mockMeta(false, true);
    expect(() =>
      guard.canActivate(ctx(actor({ roles: ['USR_CAND'], mfaVerified: false })) as never),
    ).toThrow(MfaRequiredError);
  });

  it('P04_TEST_034 @RequireMfa + learner true -> continue', () => {
    mockMeta(false, true);
    expect(guard.canActivate(ctx(actor({ roles: ['USR_CAND'], mfaVerified: true })) as never)).toBe(
      true,
    );
  });

  it('P04_TEST_035 MFA denial payload exposes no claims/roles/token/AMR', () => {
    const body = new MfaRequiredError().getResponse();
    expect(body).toMatchObject({
      statusCode: 403,
      code: 'MFA_REQUIRED',
      message: 'Additional authentication assurance required.',
    });
    const raw = JSON.stringify(body);
    expect(raw).not.toMatch(/amr|roles|token|jwt|issuer|subject|email/i);
  });
});
