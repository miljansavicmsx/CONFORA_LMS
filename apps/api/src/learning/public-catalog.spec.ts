import {
  LearningNotFoundError,
  listPublicPublishedPrograms,
  getPublicPublishedProgram,
  type LearningClient,
} from '../prisma/learning-tenant-store';

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

function client(row: typeof published | null): LearningClient {
  return {
    course: {
      findMany: jest.fn().mockResolvedValue(row ? [row] : []),
      findFirst: jest.fn().mockResolvedValue(row),
    },
  } as unknown as LearningClient;
}

describe('public programme catalogue', () => {
  it('returns only the published programme fields', async () => {
    const db = client(published);
    const view = await listPublicPublishedPrograms(db);
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
    // The mock is inspected as data. It is not invoked.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const recorded = db.course.findMany as unknown as { mock: { calls: unknown[][] } };
    const first = recorded.mock.calls[0]?.[0];
    if (!first || typeof first !== 'object') {
      throw new Error('findMany was not called');
    }
    const findMany = first as {
      where: { lifecycle: string };
      select: Record<string, boolean>;
    };
    expect(findMany.where.lifecycle).toBe('PUBLISHED');
    expect(findMany.select).not.toHaveProperty('tenantId');
    expect(findMany.select).not.toHaveProperty('authorUserId');
    expect(findMany.select).not.toHaveProperty('priceAmount');
    expect(findMany.select).not.toHaveProperty('imageObjectKey');
  });

  it('does not reveal a draft or missing programme', async () => {
    const db = client(null);
    await expect(getPublicPublishedProgram(db, published.id)).rejects.toBeInstanceOf(
      LearningNotFoundError,
    );
  });
});
