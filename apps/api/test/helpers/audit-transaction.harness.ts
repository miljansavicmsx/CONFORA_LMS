import type { AuthenticatedActor } from '../../src/auth/request-principal';
import type { AuditAppendInput, AuditEventView } from '../../src/audit/audit-event.types';
import type { AuditService } from '../../src/audit/audit.service';

/**
 * Test-only same-TX harness for BAR-P05 atomicity proofs via executeInTransaction.
 * Uses only bounded AuditTransactionOps.append — no production persistence escape hatch.
 * Must never be imported from apps/api/src/** (production import count = 0).
 */
export async function runSameTransactionDualAppend(
  auditService: AuditService,
  actor: AuthenticatedActor,
  firstAppend: AuditAppendInput,
  secondAppend: AuditAppendInput,
): Promise<{ first: AuditEventView; second: AuditEventView }> {
  return auditService.executeInTransaction(actor, async (ops) => {
    const first = await ops.append(firstAppend);
    const second = await ops.append(secondAppend);
    return { first, second };
  });
}

export async function runSameTransactionAppendThenFail(
  auditService: AuditService,
  actor: AuthenticatedActor,
  successfulAppend: AuditAppendInput,
  failingAppend: AuditAppendInput,
): Promise<void> {
  await auditService.executeInTransaction(actor, async (ops) => {
    await ops.append(successfulAppend);
    await ops.append(failingAppend);
  });
}
