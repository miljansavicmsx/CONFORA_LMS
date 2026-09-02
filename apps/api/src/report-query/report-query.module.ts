import { Module } from '@nestjs/common';

import { TenantModule } from '../tenant/tenant.module';
import { ReportQueryService } from './report-query.service';

@Module({
  imports: [TenantModule],
  controllers: [],
  providers: [ReportQueryService],
  exports: [ReportQueryService],
})
export class ReportQueryModule {}
