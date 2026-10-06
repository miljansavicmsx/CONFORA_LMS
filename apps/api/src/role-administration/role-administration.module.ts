import { Module } from '@nestjs/common';

import { RoleAdministrationBoundaryService } from './role-administration-boundary.service';

/**
 * PKG-01 module. It exports the policy gate only.
 * It does not import persistence, audit, or an identity-provider client.
 */
@Module({
  providers: [RoleAdministrationBoundaryService],
  exports: [RoleAdministrationBoundaryService],
})
export class RoleAdministrationModule {}
