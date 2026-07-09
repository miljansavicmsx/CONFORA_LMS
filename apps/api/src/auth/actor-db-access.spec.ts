import { ForbiddenException } from '@nestjs/common';

import { DEFAULT_TENANT_ID } from '@confora/shared-kernel';

import { resolveActorDbAccess } from './actor-db-access';
import type { ConforaUser } from './types/confora-user';

const DB_USER_ID = 'b2000000-0000-4000-8000-000000000004';
const WRONG_TENANT_ID = '11111111-1111-4111-8111-111111111111';

function actor(overrides: Partial<ConforaUser> = {}): ConforaUser {
  return {
    sub: 'kc-wrong-tenant-sub',
    payload: {
      sub: 'kc-wrong-tenant-sub',
      email: 'pilot.wrong-tenant@confora.test',
      tenant_id: WRONG_TENANT_ID,
      realm_access: { roles: ['USR_CAND'] },
    },
    roles: ['USR_CAND'],
    scope: [],
    mfaVerified: true,
    amr: ['pwd'],
    tenantContext: { tenantId: WRONG_TENANT_ID, claimSource: 'tenant_id', isPlatformScope: false },
    ...overrides,
  };
}

describe('resolveActorDbAccess', () => {
  const findUnique = jest.fn();

  beforeEach(() => {
    findUnique.mockReset();
  });

  it('returns user and tenant when JWT and DB tenant align', async () => {
    findUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.email === 'pilot.learner@confora.test') {
        return Promise.resolve({ id: DB_USER_ID, tenantId: DEFAULT_TENANT_ID });
      }
      return Promise.resolve(null);
    });

    const result = await resolveActorDbAccess(
      { user: { findUnique } } as never,
      actor({
        payload: {
          sub: 'kc-wrong-tenant-sub',
          email: 'pilot.learner@confora.test',
          tenant_id: DEFAULT_TENANT_ID,
          realm_access: { roles: ['USR_CAND'] },
        },
        tenantContext: { tenantId: DEFAULT_TENANT_ID, claimSource: 'tenant_id', isPlatformScope: false },
      }),
    );

    expect(result).toEqual({ userId: DB_USER_ID, tenantId: DEFAULT_TENANT_ID });
  });

  it('throws ForbiddenException when JWT tenant mismatches DB tenant', async () => {
    findUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.email === 'pilot.wrong-tenant@confora.test') {
        return Promise.resolve({ id: DB_USER_ID, tenantId: DEFAULT_TENANT_ID });
      }
      return Promise.resolve(null);
    });

    await expect(resolveActorDbAccess({ user: { findUnique } } as never, actor())).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when user cannot be resolved', async () => {
    findUnique.mockResolvedValue(null);

    await expect(resolveActorDbAccess({ user: { findUnique } } as never, actor())).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
