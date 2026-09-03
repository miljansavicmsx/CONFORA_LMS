import { Module } from '@nestjs/common';

import { ReportQueryModule } from '../report-query/report-query.module';
import { ReportQueryContractFilter } from './report-query-contract.filter';
import { ReportsController } from './reports.controller';
import { ReportsRolesGuard } from './reports-roles.guard';

@Module({
  imports: [ReportQueryModule],
  controllers: [ReportsController],
  providers: [ReportsRolesGuard, ReportQueryContractFilter],
})
export class ReportsModule {}
