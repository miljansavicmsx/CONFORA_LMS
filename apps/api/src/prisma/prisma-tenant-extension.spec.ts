import { createTenantQueryExtension } from './prisma-tenant-extension';

const callerWhere = {
  AND: [{ status: 'OPEN' }],
  OR: [{ email: 'a@example.test' }, { email: 'b@example.test' }],
  NOT: { email: 'blocked@example.test' },
};

const expectedWhere = {
  AND: [
    { tenantId: 'tenant-a' },
    { AND: [{ status: 'OPEN' }] },
    { OR: [{ email: 'a@example.test' }, { email: 'b@example.test' }] },
    { NOT: { email: 'blocked@example.test' } },
  ],
};

async function whereSeenBy(
  operation: string,
  args: Record<string, unknown>,
  result: unknown,
): Promise<unknown> {
  let seen: unknown;
  const extension = createTenantQueryExtension(() => 'tenant-a');
  await extension.query.$allModels.$allOperations({
    model: 'User',
    operation,
    args,
    query: (next) => {
      seen = next;
      return Promise.resolve(result);
    },
  });
  return seen;
}

describe('tenant query extension where merge', () => {
  it.each(['findMany', 'count', 'updateMany', 'deleteMany'] as const)(
    '%s keeps caller AND, OR, and NOT with the active tenant',
    async (operation) => {
      const result = operation === 'findMany' ? [] : operation === 'count' ? 0 : { count: 0 };
      const seen = (await whereSeenBy(operation, { where: callerWhere }, result)) as {
        where: unknown;
      };
      expect(seen.where).toEqual(expectedWhere);
    },
  );

  it('upsert keeps caller AND, OR, and NOT on where', async () => {
    const seen = (await whereSeenBy(
      'upsert',
      {
        where: callerWhere,
        create: { email: 'a@example.test' },
        update: { email: 'a@example.test' },
      },
      { tenantId: 'tenant-a' },
    )) as { where: unknown; create: { tenantId: string }; update: { tenantId: string } };
    expect(seen.where).toEqual(expectedWhere);
    expect(seen.create.tenantId).toBe('tenant-a');
    expect(seen.update.tenantId).toBe('tenant-a');
  });
});
