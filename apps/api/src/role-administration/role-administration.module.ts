import { Module } from '@nestjs/common';

import { ExternalIdpRoleManagementPort } from './external-idp-role-management.port';
import { RoleAdministrationBoundaryService } from './role-administration-boundary.service';
import { UnboundExternalIdpRoleManagementAdapter } from './unbound-external-idp-role-management.adapter';

/**
 * PKG-01 policy gate and PKG-02 unbound role-management port.
 * The module does not import persistence, audit, or a provider client.
 */
@Module({
  providers: [
    RoleAdministrationBoundaryService,
    UnboundExternalIdpRoleManagementAdapter,
    {
      provide: ExternalIdpRoleManagementPort,
      useExisting: UnboundExternalIdpRoleManagementAdapter,
    },
  ],
  exports: [
    RoleAdministrationBoundaryService,
    UnboundExternalIdpRoleManagementAdapter,
    ExternalIdpRoleManagementPort,
  ],
})
export class RoleAdministrationModule {}
