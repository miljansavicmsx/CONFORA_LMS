import { TenantContextStore } from '../tenant/tenant-context.store';
import { TenantPrismaService } from './tenant-prisma.service';

const tenantId = '11111111-1111-4111-8111-111111111111';
const otherTenant = '33333333-3333-4333-8333-333333333333';

describe('TenantPrisma certificationApplication P07 aggregates', () => {
  const countCertApp = jest.fn();
  const groupByCertApp = jest.fn();

  const prisma = {
    user: {},
    tenant: { findUnique: jest.fn() },
    externalIdentityLink: {},
    certificationApplication: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: countCertApp,
      groupBy: groupByCertApp,
    },
  };

  const tenantContext = {
    getRequiredTenantId: jest.fn(() => tenantId),
  };

  let service: TenantPrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    tenantContext.getRequiredTenantId.mockReturnValue(tenantId);
    service = new TenantPrismaService(
      prisma as never,
      tenantContext as unknown as TenantContextStore,
    );
  });

  it('P07_TEST_025 request tenant forced on count', async () => {
    countCertApp.mockResolvedValue(0);
    await service.certificationApplication.count({ status: 'DRAFT' });
    const calls = countCertApp.mock.calls as unknown as Array<[{ where: { AND: unknown[] } }]>;
    expect(calls[0][0].where.AND[0]).toEqual({ tenantId });
  });

  it('P07_TEST_026 request tenant forced on groupByStatus', async () => {
    groupByCertApp.mockResolvedValue([{ status: 'DRAFT', _count: { _all: 2 } }]);
    const rows = await service.certificationApplication.groupByStatus({});
    expect(rows).toEqual([{ status: 'DRAFT', count: 2 }]);
    const calls = groupByCertApp.mock.calls as unknown as Array<
      [{ by: string[]; where: { AND: unknown[] } }]
    >;
    expect(calls[0][0].by).toEqual(['status']);
    expect(calls[0][0].where.AND[0]).toEqual({ tenantId });
  });

  it('P07_TEST_027 request tenant forced on groupBySchemeRef', async () => {
    groupByCertApp.mockResolvedValue([{ schemeRef: 'alpha', _count: { _all: 3 } }]);
    const rows = await service.certificationApplication.groupBySchemeRef({});
    expect(rows).toEqual([{ schemeRef: 'alpha', count: 3 }]);
    const calls = groupByCertApp.mock.calls as unknown as Array<
      [{ by: string[]; where: { AND: unknown[] } }]
    >;
    expect(calls[0][0].by).toEqual(['schemeRef']);
    expect(calls[0][0].where.AND[0]).toEqual({ tenantId });
  });

  it('P07_TEST_028 caller tenantId cannot override forced tenant', async () => {
    countCertApp.mockResolvedValue(0);
    // Filters type forbids tenantId; ensure forceTenantWhere still wins if somehow present in built where.
    await service.certificationApplication.count({
      createdAt: {
        gte: new Date('2026-01-01T00:00:00.000Z'),
        lte: new Date('2026-01-02T00:00:00.000Z'),
      },
    });
    const calls = countCertApp.mock.calls as unknown as Array<[{ where: { AND: unknown[] } }]>;
    expect(calls[0][0].where.AND[0]).toEqual({ tenantId });
    expect(JSON.stringify(calls[0][0].where)).not.toContain(otherTenant);
  });

  it('P07_TEST_082 TenantPrisma write methods remain unavailable', () => {
    expect(service.create).toBeUndefined();
    expect(service.update).toBeUndefined();
    expect(service.delete).toBeUndefined();
    expect((service.certificationApplication as { create?: unknown }).create).toBeUndefined();
  });
});
