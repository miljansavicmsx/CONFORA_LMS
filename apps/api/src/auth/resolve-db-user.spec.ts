import type { ConforaUser } from './types/confora-user';

import { resolveAuthUserIdWithMeta } from './resolve-db-user';

const DB_USER_ID = 'b2000000-0000-4000-8000-000000000001';
const KEYCLOAK_SUB = '2cfd2e35-f971-4b68-8de7-93fd25292019';
const PILOT_EMAIL = 'pilot.learner@confora.test';

function user(overrides: Partial<ConforaUser> = {}): ConforaUser {
  return {
    sub: KEYCLOAK_SUB,
    payload: {
      sub: KEYCLOAK_SUB,
      realm_access: { roles: ['USR_CAND'] },
    },
    roles: ['USR_CAND'],
    scope: [],
    mfaVerified: false,
    amr: ['pwd'],
    tenantContext: {
      tenantId: '00000000-0000-4000-8000-000000000001',
      claimSource: 'tenant_id',
      isPlatformScope: false,
    },
    ...overrides,
  };
}

describe('resolveAuthUserIdWithMeta', () => {
  const findUnique = jest.fn();

  beforeEach(() => {
    findUnique.mockReset();
  });

  it('resolves by email when Keycloak sub differs from DB id', async () => {
    findUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id === KEYCLOAK_SUB) return Promise.resolve(null);
      if (where.email === PILOT_EMAIL) {
        return Promise.resolve({ id: DB_USER_ID, tenantId: '00000000-0000-4000-8000-000000000001' });
      }
      return Promise.resolve(null);
    });

    const result = await resolveAuthUserIdWithMeta(
      { user: { findUnique } } as never,
      user({
        payload: {
          sub: KEYCLOAK_SUB,
          email: PILOT_EMAIL,
          realm_access: { roles: ['USR_CAND'] },
        },
      }),
    );

    expect(result).toEqual({
      userId: DB_USER_ID,
      method: 'email',
      tenantId: '00000000-0000-4000-8000-000000000001',
    });
  });

  it('resolves by preferred_username claim when email claim is absent', async () => {
    findUnique.mockImplementation(({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id === KEYCLOAK_SUB) return Promise.resolve(null);
      if (where.email === PILOT_EMAIL) {
        return Promise.resolve({ id: DB_USER_ID, tenantId: '00000000-0000-4000-8000-000000000001' });
      }
      return Promise.resolve(null);
    });

    const result = await resolveAuthUserIdWithMeta(
      { user: { findUnique } } as never,
      user({
        username: PILOT_EMAIL,
        payload: {
          sub: KEYCLOAK_SUB,
          preferred_username: PILOT_EMAIL,
          realm_access: { roles: ['USR_CAND'] },
        },
      }),
    );

    expect(result).toEqual({
      userId: DB_USER_ID,
      method: 'preferred_username',
      tenantId: '00000000-0000-4000-8000-000000000001',
    });
  });

  it('returns none when JWT lacks resolvable identity claims', async () => {
    findUnique.mockImplementation(({ where }: { where: { id?: string } }) => {
      if (where.id === KEYCLOAK_SUB) return Promise.resolve(null);
      return Promise.resolve(null);
    });

    const result = await resolveAuthUserIdWithMeta(
      { user: { findUnique } } as never,
      user({
        payload: {
          sub: KEYCLOAK_SUB,
          realm_access: { roles: ['USR_CAND'] },
        },
      }),
    );

    expect(result).toEqual({ userId: null, method: 'none', tenantId: null });
  });
});
