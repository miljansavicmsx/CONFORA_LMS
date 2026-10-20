import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import {
  AuditEventRegistry,
  ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
} from './audit-event.registry';
import { AuditHashService } from './audit-hash.service';
import { AuditIntegrityService } from './audit-integrity.service';
import { EXAM_AUDIT_EVENT_DEFINITIONS } from './exam-audit-events';
import { CASE_AUDIT_EVENT_DEFINITIONS } from './case-audit-events';
import { PERSONNEL_AUDIT_EVENT_DEFINITIONS } from './personnel-audit-events';
import { LEARNING_AUDIT_EVENT_DEFINITIONS } from './learning-audit-events';
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
      useFactory: () =>
        new AuditEventRegistry([
          ...ROLE_ADMINISTRATION_AUDIT_EVENT_DEFINITIONS,
          ...LEARNING_AUDIT_EVENT_DEFINITIONS,
          ...EXAM_AUDIT_EVENT_DEFINITIONS,
          ...PERSONNEL_AUDIT_EVENT_DEFINITIONS,
          ...CASE_AUDIT_EVENT_DEFINITIONS,
        ]),
    },
    AuditService,
  ],
  exports: [AuditService],
})
export class AuditModule {}
