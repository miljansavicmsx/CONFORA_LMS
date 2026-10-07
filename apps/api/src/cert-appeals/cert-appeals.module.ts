import { Module } from '@nestjs/common';

import { AppealCasePolicy } from './appeal-case.policy';

/**
 * PKG-05 appeals-only policy module.
 * Exports the in-memory policy provider. No route, store, audit writer,
 * or identity-provider binding. The complaints module is not imported.
 */
@Module({
  providers: [AppealCasePolicy],
  exports: [AppealCasePolicy],
})
export class CertAppealsModule {}
