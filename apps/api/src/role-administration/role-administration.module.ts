import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { RoleAdministrationAuthorityGuard, RoleAdministrationController } from './role-administration.controller';
import { ExternalIdpRoleManagementPort } from './external-idp-role-management.port';
import { RoleAdministrationBoundaryService } from './role-administration-boundary.service';
import { RoleAdministrationWorkflowService } from './role-administration-workflow.service';
import { UnboundExternalIdpRoleManagementAdapter } from './unbound-external-idp-role-management.adapter';

/**
 * PKG-01 policy gate, PKG-02 unbound port, and PKG-03 audit-backed workflow.
 * The module does not import a provider client or a workflow store.
 * Audit writes go through the existing AuditService API.
 */
@Module({
  imports: [AuditModule],
  controllers: [RoleAdministrationController],
  providers: [
    RoleAdministrationBoundaryService,
    UnboundExternalIdpRoleManagementAdapter,
    {
      provide: ExternalIdpRoleManagementPort,
      useExisting: UnboundExternalIdpRoleManagementAdapter,
    },
    RoleAdministrationWorkflowService,
    RoleAdministrationAuthorityGuard,
  ],
  exports: [
    RoleAdministrationBoundaryService,
    UnboundExternalIdpRoleManagementAdapter,
    ExternalIdpRoleManagementPort,
    RoleAdministrationWorkflowService,
  ],
})
export class RoleAdministrationModule {}
