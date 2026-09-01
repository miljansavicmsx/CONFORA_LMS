import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { AuditEventRegistry } from './audit-event.registry';
import { AuditHashService } from './audit-hash.service';
import { AuditIntegrityService } from './audit-integrity.service';
import { AuditRepository } from './audit.repository';
import { AUDIT_EVENT_REGISTRY, AuditService } from './audit.service';

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [],
  providers: [
    AuditRepository,
    AuditHashService,
    AuditIntegrityService,
    {
      provide: AUDIT_EVENT_REGISTRY,
      useFactory: () => AuditEventRegistry.production(),
    },
    AuditService,
  ],
  exports: [AuditService],
})
export class AuditModule {}
