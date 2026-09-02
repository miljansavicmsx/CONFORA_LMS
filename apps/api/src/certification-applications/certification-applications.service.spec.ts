import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { CertificationApplicationsService } from './certification-applications.service';
import {
  ListCertificationApplicationsQueryDto,
  listCertificationApplicationsQuerySchema,
} from './dto/list-certification-applications-query.dto';

const actor = {
  userId: '22222222-2222-4222-8222-222222222222',
  tenantId: '11111111-1111-4111-8111-111111111111',
  issuer: 'https://issuer.test',
  subject: 'sub',
  email: 'learner@example.test',
  roles: ['USR_CAND'] as const,
  mfaVerified: false,
};

describe('CertificationApplicationsService', () => {
  const findMany = jest.fn();
  const findFirst = jest.fn();
  const tenantPrisma = {
    certificationApplication: { findMany, findFirst },
  };

  let service: CertificationApplicationsService;
  const pipe = new ZodValidationPipe(listCertificationApplicationsQuerySchema);

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CertificationApplicationsService(tenantPrisma as never);
  });

  function parseQuery(input: Record<string, unknown>): ListCertificationApplicationsQueryDto {
    return pipe.transform(input, {
      type: 'query',
      metatype: ListCertificationApplicationsQueryDto,
    }) as ListCertificationApplicationsQueryDto;
  }

  it('P06_TEST_024 explicit valid limit accepted', async () => {
    findMany.mockResolvedValue([]);
    const query = parseQuery({ limit: '25', offset: '0' });
    await service.listApplications(actor, query);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 26, skip: 0 }));
  });

  it('P06_TEST_025 limit minimum 1 accepted', async () => {
    findMany.mockResolvedValue([]);
    const query = parseQuery({ limit: '1' });
    const result = await service.listApplications(actor, query);
    expect(result.limit).toBe(1);
  });

  it('P06_TEST_026 limit maximum 100 accepted', async () => {
    findMany.mockResolvedValue([]);
    const query = parseQuery({ limit: '100' });
    const result = await service.listApplications(actor, query);
    expect(result.limit).toBe(100);
  });

  it('P06_TEST_027 limit 0 rejected', () => {
    expect(() => parseQuery({ limit: '0' })).toThrow(BadRequestException);
  });

  it('P06_TEST_028 limit 101 rejected', () => {
    expect(() => parseQuery({ limit: '101' })).toThrow(BadRequestException);
  });

  it('P06_TEST_029 noninteger limit rejected', () => {
    expect(() => parseQuery({ limit: '1.5' })).toThrow(BadRequestException);
  });

  it('P06_TEST_032 negative offset rejected', () => {
    expect(() => parseQuery({ offset: '-1' })).toThrow(BadRequestException);
  });

  it('P06_TEST_033 noninteger offset rejected', () => {
    expect(() => parseQuery({ offset: '1.5' })).toThrow(BadRequestException);
  });

  it('P06_TEST_034 all five canonical status filters accepted', async () => {
    findMany.mockResolvedValue([]);
    const statuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const;
    for (const status of statuses) {
      const query = parseQuery({ status });
      await service.listApplications(actor, query);
      expect(findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status }) as Record<string, unknown>,
        }),
      );
    }
  });

  it('P06_TEST_035 invalid status rejected', () => {
    expect(() => parseQuery({ status: 'INVALID' })).toThrow(BadRequestException);
  });

  it('P06_TEST_036 unknown query key rejected', () => {
    expect(() => parseQuery({ limit: '10', foo: 'bar' })).toThrow(BadRequestException);
  });

  it('P06_TEST_037 client sort selector rejected', () => {
    expect(() => parseQuery({ sort: 'createdAt' })).toThrow(BadRequestException);
  });

  it('P06_TEST_041 hasMore false when rows <= limit', async () => {
    const now = new Date('2026-03-01T00:00:00.000Z');
    findMany.mockResolvedValue([
      {
        id: 'a',
        status: 'DRAFT',
        schemeRef: 's',
        submittedAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    const result = await service.listApplications(actor, { limit: 50, offset: 0 });
    expect(result.hasMore).toBe(false);
  });

  it('P06_TEST_042 hasMore true when rows > limit', async () => {
    const now = new Date('2026-03-01T00:00:00.000Z');
    const row = {
      id: 'x',
      status: 'DRAFT',
      schemeRef: 's',
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    findMany.mockResolvedValue([row, row, row]);
    const result = await service.listApplications(actor, { limit: 2, offset: 0 });
    expect(result.hasMore).toBe(true);
    expect(result.items).toHaveLength(2);
  });

  it('P06_TEST_065 applicantUserId predicate applied in list query', async () => {
    findMany.mockResolvedValue([]);
    await service.listApplications(actor, { limit: 50, offset: 0 });
    const calls = findMany.mock.calls as Array<[{ where?: { applicantUserId?: string } }]>;
    expect(calls[0]?.[0].where?.applicantUserId).toBe(actor.userId);
  });

  it('P06_TEST_065 applicantUserId predicate applied in detail query', async () => {
    const detailId = '33333333-3333-4333-8333-333333333333';
    findFirst.mockResolvedValue(null);
    await expect(service.getApplicationById(actor, detailId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    const calls = findFirst.mock.calls as Array<
      [{ where?: { id?: string; applicantUserId?: string } }]
    >;
    expect(calls[0]?.[0].where?.id).toBe(detailId);
    expect(calls[0]?.[0].where?.applicantUserId).toBe(actor.userId);
  });
});
