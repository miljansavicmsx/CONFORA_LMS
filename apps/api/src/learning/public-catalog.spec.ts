import {
  LearningNotFoundError,
  listPublicPublishedPrograms,
  getPublicPublishedProgram,
  publicCatalogTenantIds,
  type LearningClient,
} from '../prisma/learning-tenant-store';

const listedTenant = '22222222-2222-4222-8222-222222222222';
const otherTenant = '33333333-3333-4333-8333-333333333333';

const published = {
  id: '11111111-1111-4111-8111-111111111111',
  code: 'DIG-1',
  title: 'Javni program',
  description: 'Opis programa',
  areaCode: 'DIGCOMP',
  language: 'bs',
  typicalLearningTimeMinutes: 60,
  learningObjectives: 'Ishodi',
  educationalLevel: 'osnovni',
  targetAudience: 'kandidati',
};

type FindArgs = {
  where: {
    id?: string;
    lifecycle: string;
    tenantId?: { in: string[] };
  };
  select: Record<string, boolean>;
};

function recordedQuery(mock: jest.Mock): FindArgs {
  const calls: unknown = mock.mock.calls;
  if (!Array.isArray(calls) || !Array.isArray(calls[0])) {
    throw new Error('query was not recorded');
  }
  const first: unknown = calls[0][0];
  if (!first || typeof first !== 'object') {
    throw new Error('query was not recorded');
  }
  return first as FindArgs;
}

function client(): { db: LearningClient; findMany: jest.Mock; findFirst: jest.Mock } {
  const findMany = jest.fn().mockImplementation((args: FindArgs) => {
    const allowed = args.where.tenantId?.in ?? [];
    if (args.where.lifecycle !== 'PUBLISHED' || !allowed.includes(listedTenant)) {
      return [];
    }
    return [published];
  });
  const findFirst = jest.fn().mockImplementation((args: FindArgs) => {
    const allowed = args.where.tenantId?.in ?? [];
    if (
      args.where.lifecycle !== 'PUBLISHED' ||
      args.where.id !== published.id ||
      !allowed.includes(listedTenant)
    ) {
      return null;
    }
    return published;
  });
  const db = { course: { findMany, findFirst } } as unknown as LearningClient;
  return { db, findMany, findFirst };
}

describe('public programme catalogue', () => {
  it('treats an unset, empty, or wildcard configuration as no organizations', () => {
    expect(publicCatalogTenantIds(undefined)).toEqual([]);
    expect(publicCatalogTenantIds('')).toEqual([]);
    expect(publicCatalogTenantIds(' , ')).toEqual([]);
    expect(publicCatalogTenantIds('*')).toEqual([]);
    expect(publicCatalogTenantIds('not-a-uuid')).toEqual([]);
    expect(publicCatalogTenantIds(` ${listedTenant.toUpperCase()} , * `)).toEqual([listedTenant]);
  });

  it('returns an empty list when the allowlist is unset', async () => {
    const { db, findMany } = client();
    await expect(listPublicPublishedPrograms(db, [])).resolves.toEqual({ courses: [] });
    expect(findMany).not.toHaveBeenCalled();
  });

  it('returns 404 for a published course whose organization is not listed', async () => {
    const { db, findFirst } = client();
    await expect(getPublicPublishedProgram(db, [], published.id)).rejects.toBeInstanceOf(
      LearningNotFoundError,
    );
    expect(findFirst).not.toHaveBeenCalled();
    await expect(getPublicPublishedProgram(db, [otherTenant], published.id)).rejects.toBeInstanceOf(
      LearningNotFoundError,
    );
    const queried = recordedQuery(findFirst);
    expect(queried.where.tenantId).toEqual({ in: [otherTenant] });
    expect(queried.where.lifecycle).toBe('PUBLISHED');
  });

  it('returns a published programme only for a listed organization', async () => {
    const { db, findMany } = client();
    const view = await listPublicPublishedPrograms(db, [listedTenant]);
    expect(view.courses).toEqual([
      {
        courseId: published.id,
        code: 'DIG-1',
        title: 'Javni program',
        description: 'Opis programa',
        areaCode: 'DIGCOMP',
        language: 'bs',
        typicalLearningTimeMinutes: 60,
        learningObjectives: 'Ishodi',
        educationalLevel: 'osnovni',
        targetAudience: 'kandidati',
      },
    ]);
    const queried = recordedQuery(findMany);
    expect(queried.where.lifecycle).toBe('PUBLISHED');
    expect(queried.where.tenantId).toEqual({ in: [listedTenant] });
    expect(queried.select).not.toHaveProperty('tenantId');
    expect(queried.select).not.toHaveProperty('authorUserId');
    expect(queried.select).not.toHaveProperty('priceAmount');
    expect(queried.select).not.toHaveProperty('imageObjectKey');
    await expect(getPublicPublishedProgram(db, [listedTenant], published.id)).resolves.toEqual(
      view.courses[0],
    );
  });

  it('does not reveal a draft or missing programme', async () => {
    const { db } = client();
    await expect(
      getPublicPublishedProgram(db, [listedTenant], '99999999-9999-4999-8999-999999999999'),
    ).rejects.toBeInstanceOf(LearningNotFoundError);
  });
});
