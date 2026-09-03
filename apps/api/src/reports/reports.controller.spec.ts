import { ReportsController } from './reports.controller';
import {
  ReportAggregateQueryDto,
  toReportQueryAggregateInput,
} from './dto/report-aggregate-query.dto';
import type { ReportQueryService } from '../report-query/report-query.service';
import type { AuthenticatedActor } from '../auth/request-principal';
import { REQUEST_PRINCIPAL_KEY } from '../auth/request-principal';

describe('ReportsController', () => {
  const actor: AuthenticatedActor = {
    userId: 'u1',
    tenantId: 't1',
    issuer: 'iss',
    subject: 'sub',
    email: 'a@example.test',
    roles: ['STAFF_DIR'],
    mfaVerified: true,
  };

  const request = {
    user: actor,
    [REQUEST_PRINCIPAL_KEY]: actor,
  };

  it('P08_TEST_022 by-status invokes aggregateByStatus only', async () => {
    const aggregateByStatus = jest.fn().mockResolvedValue({ groups: [], total: 0 });
    const aggregateBySchemeRef = jest.fn();
    const controller = new ReportsController({
      aggregateByStatus,
      aggregateBySchemeRef,
    } as unknown as ReportQueryService);

    const dto = Object.assign(new ReportAggregateQueryDto(), {
      createdFrom: '2026-01-01T00:00:00Z',
      createdTo: '2026-06-01T00:00:00Z',
      status: 'DRAFT',
    });

    const result = await controller.byStatus(request, dto);
    expect(aggregateByStatus).toHaveBeenCalledTimes(1);
    expect(aggregateBySchemeRef).not.toHaveBeenCalled();
    expect(aggregateByStatus).toHaveBeenCalledWith(actor, toReportQueryAggregateInput(dto));
    expect(result).toEqual({ groups: [], total: 0 });
  });

  it('P08_TEST_023 by-scheme-ref invokes aggregateBySchemeRef only', async () => {
    const aggregateByStatus = jest.fn();
    const aggregateBySchemeRef = jest.fn().mockResolvedValue({ groups: [] });
    const controller = new ReportsController({
      aggregateByStatus,
      aggregateBySchemeRef,
    } as unknown as ReportQueryService);

    const dto = Object.assign(new ReportAggregateQueryDto(), {
      createdFrom: '2026-01-01T00:00:00Z',
      createdTo: '2026-06-01T00:00:00Z',
      schemeRef: 'Scheme-A',
    });

    await controller.bySchemeRef(request, dto);
    expect(aggregateBySchemeRef).toHaveBeenCalledTimes(1);
    expect(aggregateByStatus).not.toHaveBeenCalled();
  });

  it('P08_TEST_024/025/026/027 passthrough of filters and Date conversion', async () => {
    const aggregateByStatus = jest.fn().mockResolvedValue({ groups: [] });
    const controller = new ReportsController({
      aggregateByStatus,
      aggregateBySchemeRef: jest.fn(),
    } as unknown as ReportQueryService);

    const dto = Object.assign(new ReportAggregateQueryDto(), {
      status: 'APPROVED',
      schemeRef: ' ExactRef ',
      createdFrom: '2026-01-01T00:00:00.123Z',
      createdTo: '2026-01-02T00:00:00Z',
      submittedFrom: '2026-01-01T01:00:00+01:00',
      submittedTo: '2026-01-01T01:00:00.123+01:00',
    });

    await controller.byStatus(request, dto);
    expect(aggregateByStatus).toHaveBeenCalledTimes(1);
    const expected = toReportQueryAggregateInput(dto);
    expect(aggregateByStatus).toHaveBeenCalledWith(actor, expected);
    expect(expected.status).toBe('APPROVED');
    expect(expected.schemeRef).toBe(' ExactRef ');
    expect(expected.createdFrom).toBeInstanceOf(Date);
    expect(expected.createdTo).toBeInstanceOf(Date);
    expect(expected.submittedFrom).toBeInstanceOf(Date);
    expect(expected.submittedTo).toBeInstanceOf(Date);
    expect(expected.createdFrom?.getTime()).toBe(Date.parse('2026-01-01T00:00:00.123Z'));
  });
});
