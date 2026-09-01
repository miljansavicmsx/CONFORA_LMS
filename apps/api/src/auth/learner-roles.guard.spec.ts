import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { LearnerRolesGuard } from './learner-roles.guard';
import { REQUIRE_LEARNER_ROLES_KEY } from './require-learner-roles.decorator';
import { AccessDeniedError } from '../tenant/tenant-errors';

describe('LearnerRolesGuard', () => {
  it('P06_TEST_015 USR_CAND allowed', () => {
    const guard = new LearnerRolesGuard(new Reflector());
    jest.spyOn(guard['reflector'], 'getAllAndOverride').mockImplementation((key) => {
      if (key === REQUIRE_LEARNER_ROLES_KEY) return true;
      return false;
    });
    const request = { user: { roles: ['USR_CAND'] } };
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('P06_TEST_016 USR_CERT allowed', () => {
    const guard = new LearnerRolesGuard(new Reflector());
    jest.spyOn(guard['reflector'], 'getAllAndOverride').mockImplementation((key) => {
      if (key === REQUIRE_LEARNER_ROLES_KEY) return true;
      return false;
    });
    const request = { user: { roles: ['USR_CERT'] } };
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('P06_TEST_017 staff-only actor denied', () => {
    const guard = new LearnerRolesGuard(new Reflector());
    jest.spyOn(guard['reflector'], 'getAllAndOverride').mockImplementation((key) => {
      if (key === REQUIRE_LEARNER_ROLES_KEY) return true;
      return false;
    });
    const request = { user: { roles: ['STAFF_DIR'] } };
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(context)).toThrow(AccessDeniedError);
  });
});
