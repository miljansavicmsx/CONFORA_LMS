import { Module } from '@nestjs/common';

import { ComplaintCasePolicy } from './complaint-case.policy';

/**
 * PKG-04 complaints-only policy module.
 * Exports the in-memory policy provider. No controller, store, audit writer,
 * or identity-provider binding. No other case-domain module is imported.
 */
@Module({
  providers: [ComplaintCasePolicy],
  exports: [ComplaintCasePolicy],
})
export class CertComplaintsModule {}
