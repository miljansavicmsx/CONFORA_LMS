import { Module } from '@nestjs/common';

import { MfaAssuranceGuard } from '../auth/mfa-assurance.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { ActiveAssuranceGuard } from './active-assurance.guard';
import { ActiveAssuranceService } from './active-assurance.service';
import { AssuranceExceptionFilter } from './assurance-exception.filter';
import { ClientTenantRejectionMiddleware } from './client-tenant-rejection.middleware';
import { TenantContextStore } from './tenant-context.store';

@Module({
  imports: [PrismaModule],
  providers: [
    TenantContextStore,
    ActiveAssuranceService,
    ClientTenantRejectionMiddleware,
    TenantPrismaService,
    ActiveAssuranceGuard,
    MfaAssuranceGuard,
    AssuranceExceptionFilter,
  ],
  exports: [
    TenantContextStore,
    ActiveAssuranceService,
    ClientTenantRejectionMiddleware,
    TenantPrismaService,
    ActiveAssuranceGuard,
    MfaAssuranceGuard,
    AssuranceExceptionFilter,
  ],
})
export class TenantModule {}
