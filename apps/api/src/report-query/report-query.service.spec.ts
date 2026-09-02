import type { RbacRole } from '@confora/shared-types';

import type { AuthenticatedActor } from '../auth/request-principal';
import type { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { TenantContextStore } from '../tenant/tenant-context.store';
import { AccessDeniedError, TenantAccessDeniedError } from '../tenant/tenant-errors';
import {
  DATE_RANGE_OVERFLOW,
  DATE_RANGE_REQUIRED,
  INCOMPLETE_DATE_PAIR,
  INVALID_SCHEME_REF,
  INVALID_STATUS,
  INVERTED_DATE_RANGE,
  MALFORMED_DATE,
  ReportQueryContractError,
  UNKNOWN_FILTER,
} from './report-query.errors';
import { MS_PER_DAY } from './report-query.input';
import { ReportQueryService } from './report-query.service';

const TENANT_A = '11111111-1111-4111-8111-111111111111';
const TENANT_B = '33333333-3333-4333-8333-333333333333';

function actor(roles: RbacRole[] = ['STAFF_DIR'], tenantId = TENANT_A): AuthenticatedActor {
  return {
    userId: '22222222-2222-4222-8222-222222222222',
    tenantId,
    issuer: 'https://issuer.test',
    subject: 'sub',
    email: 'staff@example.test',
    roles,
    mfaVerified: true,
  };
}

function baseInput() {
  const from = new Date('2026-01-01T00:00:00.000Z');
  const to = new Date('2026-01-31T00:00:00.000Z');
  return { createdFrom: from, createdTo: to };
}

describe('ReportQueryService', () => {
  const groupByStatus = jest.fn();
  const groupBySchemeRef = jest.fn();
  const count = jest.fn();
  const getRequiredTenantId = jest.fn(() => TENANT_A);

  const tenantPrisma = {
    certificationApplication: { groupByStatus, groupBySchemeRef, count },
  } as unknown as TenantPrismaService;

  const tenantContext = {
    getRequiredTenantId,
  } as unknown as TenantContextStore;

  let service: ReportQueryService;

  beforeEach(() => {
    jest.clearAllMocks();
    getRequiredTenantId.mockReturnValue(TENANT_A);
    groupByStatus.mockResolvedValue([]);
    groupBySchemeRef.mockResolvedValue([]);
    service = new ReportQueryService(tenantPrisma, tenantContext);
  });

  it('P07_TEST_024 unauthorized role DB query count = 0', async () => {
    await expect(
      service.aggregateByStatus(actor(['USR_CAND']), baseInput()),
    ).rejects.toBeInstanceOf(AccessDeniedError);
    expect(groupByStatus).not.toHaveBeenCalled();
  });

  it('P07_TEST_030 input tenantId rejected as unknown filter', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        ...baseInput(),
        ...({ tenantId: TENANT_B } as object),
      }),
    ).rejects.toMatchObject({ code: UNKNOWN_FILTER });
    expect(groupByStatus).not.toHaveBeenCalled();
  });

  it('P07_TEST_031 actor tenant != request tenant denied before DB', async () => {
    getRequiredTenantId.mockReturnValue(TENANT_B);
    await expect(
      service.aggregateByStatus(actor(['STAFF_DIR'], TENANT_A), baseInput()),
    ).rejects.toBeInstanceOf(TenantAccessDeniedError);
    expect(groupByStatus).not.toHaveBeenCalled();
  });

  it('P07_TEST_032 platform-wide query impossible', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        ...baseInput(),
        ...({ platformWide: true } as object),
      }),
    ).rejects.toBeInstanceOf(ReportQueryContractError);
  });

  it('P07_TEST_039 valid status accepted', async () => {
    groupByStatus.mockResolvedValue([{ status: 'DRAFT', count: 5 }]);
    await service.aggregateByStatus(actor(), { ...baseInput(), status: 'DRAFT' });
    expect(groupByStatus).toHaveBeenCalled();
  });

  it('P07_TEST_040 invalid status rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        ...baseInput(),
        status: 'NOPE' as never,
      }),
    ).rejects.toMatchObject({ code: INVALID_STATUS });
    expect(groupByStatus).not.toHaveBeenCalled();
  });

  it('P07_TEST_042 empty schemeRef rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), { ...baseInput(), schemeRef: '' }),
    ).rejects.toMatchObject({ code: INVALID_SCHEME_REF });
  });

  it('P07_TEST_043 schemeRef length >128 rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), { ...baseInput(), schemeRef: 'x'.repeat(129) }),
    ).rejects.toMatchObject({ code: INVALID_SCHEME_REF });
  });

  it('P07_TEST_044 unknown filter rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        ...baseInput(),
        ...({ foo: 1 } as object),
      }),
    ).rejects.toMatchObject({ code: UNKNOWN_FILTER });
  });

  it('P07_TEST_045 applicantUserId filter rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        ...baseInput(),
        ...({ applicantUserId: 'x' } as object),
      }),
    ).rejects.toMatchObject({ code: UNKNOWN_FILTER });
  });

  it('P07_TEST_046 userId filter rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        ...baseInput(),
        ...({ userId: 'x' } as object),
      }),
    ).rejects.toMatchObject({ code: UNKNOWN_FILTER });
  });

  it('P07_TEST_047 applicationId filter rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        ...baseInput(),
        ...({ applicationId: 'x' } as object),
      }),
    ).rejects.toMatchObject({ code: UNKNOWN_FILTER });
  });

  it('P07_TEST_048 arbitrary groupBy request rejected/impossible', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        ...baseInput(),
        ...({ groupBy: 'applicantUserId' } as object),
      }),
    ).rejects.toMatchObject({ code: UNKNOWN_FILTER });
  });

  it('P07_TEST_051 incomplete created range rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), { createdFrom: new Date('2026-01-01T00:00:00.000Z') }),
    ).rejects.toMatchObject({ code: INCOMPLETE_DATE_PAIR });
  });

  it('P07_TEST_052 incomplete submitted range rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), { submittedTo: new Date('2026-01-01T00:00:00.000Z') }),
    ).rejects.toMatchObject({ code: INCOMPLETE_DATE_PAIR });
  });

  it('P07_TEST_053 no date range rejected', async () => {
    await expect(service.aggregateByStatus(actor(), {})).rejects.toMatchObject({
      code: DATE_RANGE_REQUIRED,
    });
  });

  it('P07_TEST_054 created from > to rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        createdFrom: new Date('2026-02-01T00:00:00.000Z'),
        createdTo: new Date('2026-01-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({ code: INVERTED_DATE_RANGE });
  });

  it('P07_TEST_055 submitted from > to rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        submittedFrom: new Date('2026-02-01T00:00:00.000Z'),
        submittedTo: new Date('2026-01-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({ code: INVERTED_DATE_RANGE });
  });

  it('P07_TEST_056 exact 365-day span allowed', async () => {
    const from = new Date('2025-01-01T00:00:00.000Z');
    const to = new Date(from.getTime() + 365 * MS_PER_DAY);
    groupByStatus.mockResolvedValue([{ status: 'APPROVED', count: 5 }]);
    await service.aggregateByStatus(actor(), { createdFrom: from, createdTo: to });
    expect(groupByStatus).toHaveBeenCalled();
  });

  it('P07_TEST_057 365-day +1ms rejected', async () => {
    const from = new Date('2025-01-01T00:00:00.000Z');
    const to = new Date(from.getTime() + 365 * MS_PER_DAY + 1);
    await expect(
      service.aggregateByStatus(actor(), { createdFrom: from, createdTo: to }),
    ).rejects.toMatchObject({ code: DATE_RANGE_OVERFLOW });
  });

  it('P07_TEST_058 malformed Date rejected', async () => {
    await expect(
      service.aggregateByStatus(actor(), {
        createdFrom: new Date('not-a-date'),
        createdTo: new Date('2026-01-02T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({ code: MALFORMED_DATE });
  });

  it('P07_TEST_033 aggregateByStatus returns all five statuses', async () => {
    groupByStatus.mockResolvedValue([{ status: 'APPROVED', count: 5 }]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.groups.map((g) => g.status)).toEqual([
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
    ]);
  });

  it('P07_TEST_063 status count 0 returns exact 0', async () => {
    groupByStatus.mockResolvedValue([]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.groups[0]).toEqual({ status: 'DRAFT', suppressed: false, count: 0 });
  });

  it('P07_TEST_064 status count 1 suppressed with no count field', async () => {
    groupByStatus.mockResolvedValue([{ status: 'DRAFT', count: 1 }]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    const draft = result.groups[0];
    expect(draft).toEqual({ status: 'DRAFT', suppressed: true });
    expect(Object.prototype.hasOwnProperty.call(draft, 'count')).toBe(false);
    expect(result.total).toBeUndefined();
  });

  it('P07_TEST_065 status count 4 suppressed with no count field', async () => {
    groupByStatus.mockResolvedValue([{ status: 'DRAFT', count: 4 }]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.groups[0]).toEqual({ status: 'DRAFT', suppressed: true });
    expect(result.total).toBeUndefined();
  });

  it('P07_TEST_066 status count 5 exact', async () => {
    groupByStatus.mockResolvedValue([
      { status: 'DRAFT', count: 5 },
      { status: 'SUBMITTED', count: 5 },
      { status: 'UNDER_REVIEW', count: 5 },
      { status: 'APPROVED', count: 5 },
      { status: 'REJECTED', count: 5 },
    ]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.groups.every((g) => !g.suppressed)).toBe(true);
    expect(result.total).toBe(25);
  });

  it('P07_TEST_067 status count >5 exact', async () => {
    groupByStatus.mockResolvedValue([
      { status: 'DRAFT', count: 6 },
      { status: 'SUBMITTED', count: 6 },
      { status: 'UNDER_REVIEW', count: 6 },
      { status: 'APPROVED', count: 6 },
      { status: 'REJECTED', count: 6 },
    ]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.groups[0]).toEqual({ status: 'DRAFT', suppressed: false, count: 6 });
    expect(result.total).toBe(30);
  });

  it('P07_TEST_071 one visible + one suppressed => total omitted', async () => {
    groupByStatus.mockResolvedValue([
      { status: 'DRAFT', count: 5 },
      { status: 'SUBMITTED', count: 1 },
    ]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.total).toBeUndefined();
  });

  it('P07_TEST_072 multiple suppressed => total omitted', async () => {
    groupByStatus.mockResolvedValue([
      { status: 'DRAFT', count: 1 },
      { status: 'SUBMITTED', count: 2 },
    ]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.total).toBeUndefined();
  });

  it('P07_TEST_073 all non-suppressed => total present and equals sum', async () => {
    groupByStatus.mockResolvedValue([
      { status: 'DRAFT', count: 5 },
      { status: 'SUBMITTED', count: 5 },
      { status: 'UNDER_REVIEW', count: 5 },
      { status: 'APPROVED', count: 5 },
      { status: 'REJECTED', count: 5 },
    ]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.total).toBe(25);
  });

  it('P07_TEST_074 all suppressed => total omitted', async () => {
    groupByStatus.mockResolvedValue([
      { status: 'DRAFT', count: 1 },
      { status: 'SUBMITTED', count: 1 },
      { status: 'UNDER_REVIEW', count: 1 },
      { status: 'APPROVED', count: 1 },
      { status: 'REJECTED', count: 1 },
    ]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.total).toBeUndefined();
  });

  it('P07_TEST_068 schemeRef count 1 suppressed', async () => {
    groupBySchemeRef.mockResolvedValue([{ schemeRef: 'alpha', count: 1 }]);
    const result = await service.aggregateBySchemeRef(actor(), baseInput());
    expect(result.groups[0]).toEqual({ schemeRef: 'alpha', suppressed: true });
    expect(result.total).toBeUndefined();
  });

  it('P07_TEST_069 schemeRef count 4 suppressed', async () => {
    groupBySchemeRef.mockResolvedValue([{ schemeRef: 'alpha', count: 4 }]);
    const result = await service.aggregateBySchemeRef(actor(), baseInput());
    expect(result.groups[0]).toEqual({ schemeRef: 'alpha', suppressed: true });
  });

  it('P07_TEST_070 schemeRef count 5 exact', async () => {
    groupBySchemeRef.mockResolvedValue([{ schemeRef: 'alpha', count: 5 }]);
    const result = await service.aggregateBySchemeRef(actor(), baseInput());
    expect(result.groups[0]).toEqual({ schemeRef: 'alpha', suppressed: false, count: 5 });
    expect(result.total).toBe(5);
  });

  it('P07_TEST_075 status and schemeRef totals independently protected', async () => {
    groupByStatus.mockResolvedValue([{ status: 'DRAFT', count: 1 }]);
    groupBySchemeRef.mockResolvedValue([{ schemeRef: 'a', count: 5 }]);
    const statusResult = await service.aggregateByStatus(actor(), baseInput());
    const schemeResult = await service.aggregateBySchemeRef(actor(), baseInput());
    expect(statusResult.total).toBeUndefined();
    expect(schemeResult.total).toBe(5);
  });

  it('P07_TEST_076 suppressed exact counts absent from errors', async () => {
    groupByStatus.mockResolvedValue([{ status: 'DRAFT', count: 2 }]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(JSON.stringify(result)).not.toMatch(/"count":\s*2/);
  });

  it('P07_TEST_077 status groups exact enum order', async () => {
    groupByStatus.mockResolvedValue([]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    expect(result.groups.map((g) => g.status)).toEqual([
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
    ]);
  });

  it('P07_TEST_078 schemeRef groups ascending UTF-16 code-unit order', async () => {
    groupBySchemeRef.mockResolvedValue([
      { schemeRef: 'zeta', count: 5 },
      { schemeRef: 'alpha', count: 5 },
    ]);
    const result = await service.aggregateBySchemeRef(actor(), baseInput());
    expect(result.groups.map((g) => g.schemeRef)).toEqual(['alpha', 'zeta']);
  });

  it('P07_TEST_079 schemeRef zero-count groups omitted', async () => {
    groupBySchemeRef.mockResolvedValue([{ schemeRef: 'only', count: 5 }]);
    const result = await service.aggregateBySchemeRef(actor(), baseInput());
    expect(result.groups).toHaveLength(1);
  });

  it('P07_TEST_080 response contains zero direct identifier fields', async () => {
    groupByStatus.mockResolvedValue([{ status: 'APPROVED', count: 5 }]);
    const result = await service.aggregateByStatus(actor(), baseInput());
    const json = JSON.stringify(result);
    expect(json).not.toMatch(/tenantId|applicantUserId|userId|applicationId/);
  });

  it('P07_TEST_081 identifiers absent from result JSON', async () => {
    groupBySchemeRef.mockResolvedValue([{ schemeRef: 's', count: 5 }]);
    const result = await service.aggregateBySchemeRef(actor(), baseInput());
    expect(JSON.stringify(result)).not.toMatch(/tenantId|applicantUserId/);
  });
});
