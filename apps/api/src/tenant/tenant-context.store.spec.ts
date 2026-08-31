import { ForbiddenException } from '@nestjs/common';

import { TenantContextStore } from './tenant-context.store';
import { TenantAccessDeniedError } from './tenant-errors';

describe('TenantContextStore', () => {
  it('P04_TEST_001 TenantContextStore returns actor.tenantId', () => {
    const tenantId = '11111111-1111-4111-8111-111111111111';
    const store = new TenantContextStore({
      user: {
        userId: 'u1',
        tenantId,
        issuer: 'iss',
        subject: 'sub',
        email: 'a@example.test',
        roles: [],
        mfaVerified: false,
      },
    });
    expect(store.getRequiredTenantId()).toBe(tenantId);
  });

  it('P04_TEST_002 TenantContextStore fails closed without principal', () => {
    const store = new TenantContextStore({});
    expect(() => store.getRequiredTenantId()).toThrow(TenantAccessDeniedError);
  });

  it('P04_TEST_003 TenantContextStore exposes no setTenant/override API', () => {
    const store = new TenantContextStore({
      user: {
        userId: 'u1',
        tenantId: '11111111-1111-4111-8111-111111111111',
        issuer: 'iss',
        subject: 'sub',
        email: 'a@example.test',
        roles: [],
        mfaVerified: false,
      },
    });
    const proto = Object.getPrototypeOf(store) as Record<string, unknown>;
    const names = [...Object.keys(store), ...Object.getOwnPropertyNames(proto)];
    for (const forbidden of [
      'setTenant',
      'setTenantId',
      'overrideTenant',
      'runAsTenant',
      'platformScope',
      'systemTenant',
      'clearTenant',
    ]) {
      expect(names).not.toContain(forbidden);
    }
    expect(typeof store.getRequiredTenantId).toBe('function');
    expect(store).not.toBeInstanceOf(ForbiddenException);
  });
});
