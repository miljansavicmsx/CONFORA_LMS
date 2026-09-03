import { Controller, Get, Header, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { getRequestPrincipal, type RequestWithPrincipal } from '../auth/request-principal';
import { ReportQueryService } from '../report-query/report-query.service';
import type {
  ReportQuerySchemeRefAggregateResult,
  ReportQueryStatusAggregateResult,
} from '../report-query/report-query.result';
import { AccessDeniedError } from '../tenant/tenant-errors';
import {
  ReportAggregateQueryDto,
  toReportQueryAggregateInput,
} from './dto/report-aggregate-query.dto';
import { ReportQueryContractFilter } from './report-query-contract.filter';
import { ReportsRolesGuard } from './reports-roles.guard';

@Controller('staff/reports/certification-applications')
@UseGuards(ReportsRolesGuard, ThrottlerGuard)
@UseFilters(ReportQueryContractFilter)
export class ReportsController {
  constructor(private readonly reportQuery: ReportQueryService) {}

  @Get('by-status')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Header('Cache-Control', 'private, no-store')
  async byStatus(
    @Req() request: RequestWithPrincipal,
    @Query() query: ReportAggregateQueryDto,
  ): Promise<ReportQueryStatusAggregateResult> {
    const actor = getRequestPrincipal(request);
    if (!actor) {
      throw new AccessDeniedError();
    }
    return this.reportQuery.aggregateByStatus(actor, toReportQueryAggregateInput(query));
  }

  @Get('by-scheme-ref')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Header('Cache-Control', 'private, no-store')
  async bySchemeRef(
    @Req() request: RequestWithPrincipal,
    @Query() query: ReportAggregateQueryDto,
  ): Promise<ReportQuerySchemeRefAggregateResult> {
    const actor = getRequestPrincipal(request);
    if (!actor) {
      throw new AccessDeniedError();
    }
    return this.reportQuery.aggregateBySchemeRef(actor, toReportQueryAggregateInput(query));
  }
}
