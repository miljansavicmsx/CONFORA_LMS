import { TenantAccessDeniedError } from '../tenant/tenant-errors';
import { TenantContextStore } from '../tenant/tenant-context.store';
import { TenantPrismaService } from './tenant-prisma.service';

const tenantId = '11111111-1111-4111-8111-111111111111';
const otherTenant = '33333333-3333-4333-8333-333333333333';
const userId = '22222222-2222-4222-8222-222222222222';

describe('TenantPrismaService', () => {
  const findUniqueUser = jest.fn();
  const findManyUser = jest.fn();
  const findUniqueTenant = jest.fn();
  const findUniqueLink = jest.fn();

  const prisma = {
    user: {
      findUnique: findUniqueUser,
      findMany: findManyUser,
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    tenant: { findUnique: findUniqueTenant },
    externalIdentityLink: {
      findUnique: findUniqueLink,
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
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

  it('P04_TEST_036 TenantPrisma User same-tenant id read succeeds', async () => {
    findUniqueUser.mockResolvedValue({ id: userId, tenantId });
    const row = await service.user.findUnique({ where: { id: userId } });
    expect(row).toEqual({ id: userId, tenantId });
    expect(findUniqueUser).toHaveBeenCalledWith({
      where: { tenantId_id: { tenantId, id: userId } },
    });
  });

  it('P04_TEST_037 TenantPrisma global User id-only authority is unavailable/forbidden', async () => {
    // Facade never issues a bare { id } unique selector.
    findUniqueUser.mockResolvedValue({ id: userId, tenantId });
    await service.user.findUnique({ where: { id: userId } });
    const idCalls = findUniqueUser.mock.calls as unknown as Array<
      [{ where: Record<string, unknown> }]
    >;
    const idArg = idCalls[0][0];
    expect(idArg.where).toHaveProperty('tenantId_id');
    expect(idArg.where).not.toEqual({ id: userId });
  });

  it('P04_TEST_038 TenantPrisma global User email authority is unavailable/forbidden', async () => {
    findUniqueUser.mockResolvedValue({ id: userId, tenantId, email: 'a@example.test' });
    await service.user.findUnique({ where: { email: 'a@example.test' } });
    const emailCalls = findUniqueUser.mock.calls as unknown as Array<
      [{ where: Record<string, unknown> }]
    >;
    const emailArg = emailCalls[0][0];
    expect(emailArg.where).toHaveProperty('tenantId_email');
    expect(emailArg.where).not.toEqual({ email: 'a@example.test' });
  });

  it('P04_TEST_039 foreign tenant User lookup returns null/not-found semantics', async () => {
    findUniqueUser.mockResolvedValue(null);
    const row = await service.user.findUnique({ where: { id: userId } });
    expect(row).toBeNull();
  });

  it('P04_TEST_040 User list forces request tenant; caller cannot override', async () => {
    findManyUser.mockResolvedValue([]);
    await service.user.findMany({ where: { tenantId: otherTenant } });
    const manyCalls = findManyUser.mock.calls as unknown as Array<[{ where: { AND: unknown[] } }]>;
    const manyArg = manyCalls[0][0];
    expect(manyArg.where.AND[0]).toEqual({ tenantId });
  });

  it('P04_TEST_041 ExternalIdentityLink resolution is tenant-qualified only', async () => {
    findUniqueLink.mockResolvedValue(null);
    await service.externalIdentityLink.findUnique({
      where: { issuer: 'iss', subject: 'sub' },
    });
    expect(findUniqueLink).toHaveBeenCalledWith({
      where: {
        tenantId_issuer_subject: { tenantId, issuer: 'iss', subject: 'sub' },
      },
    });
  });

  it('P04_TEST_042 TenantPrisma Tenant lookup may access current tenant only', async () => {
    findUniqueTenant.mockResolvedValue({ id: tenantId, isActive: true });
    const self = await service.tenant.findUnique({ where: { id: tenantId } });
    expect(self?.id).toBe(tenantId);
    const foreign = await service.tenant.findUnique({ where: { id: otherTenant } });
    expect(foreign).toBeNull();
    expect(findUniqueTenant).toHaveBeenCalledTimes(1);
  });

  it('P04_TEST_043 unregistered model access is denied', () => {
    expect(() => service.forModel('Certificate')).toThrow(TenantAccessDeniedError);
  });

  it('P04_TEST_044 TenantPrisma create/update/delete/upsert capability denied', () => {
    expect(service.create).toBeUndefined();
    expect(service.update).toBeUndefined();
    expect(service.delete).toBeUndefined();
    expect(service.upsert).toBeUndefined();
    expect(service.createMany).toBeUndefined();
    expect(service.updateMany).toBeUndefined();
    expect(service.deleteMany).toBeUndefined();
  });

  it('P04_TEST_045 nested-write capability denied', () => {
    expect(service.create).toBeUndefined();
    expect(service.upsert).toBeUndefined();
  });

  it('P04_TEST_046 $transaction capability denied', () => {
    expect(service.$transaction).toBeUndefined();
  });

  it('P04_TEST_047 $queryRaw/$executeRaw capability denied', () => {
    expect(service.$queryRaw).toBeUndefined();
    expect(service.$executeRaw).toBeUndefined();
    expect(service.$queryRawUnsafe).toBeUndefined();
    expect(service.$executeRawUnsafe).toBeUndefined();
  });
});
