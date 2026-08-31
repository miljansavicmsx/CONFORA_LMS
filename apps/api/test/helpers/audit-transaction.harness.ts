import type { AuthenticatedActor } from '../../src/auth/request-principal';
import type { AuditAppendInput, AuditEventView } from '../../src/audit/audit-event.types';
import type { AuditService } from '../../src/audit/audit.service';

/**
 * Test-only same-TX harness for BAR-P05 synthetic business + audit proofs.
 * Must never be imported from apps/api/src/** (production import count = 0).
 */
export async function runSyntheticBusinessWithAudit<T = AuditEventView>(
  auditService: AuditService,
  actor: AuthenticatedActor,
  params: {
    userId: string;
    email: string;
    appendInput: AuditAppendInput;
  },
): Promise<T> {
  return auditService.runSerializableWithApi(actor, async (api, ops) => {
    await api.syntheticUpdateUserEmail(actor.tenantId, params.userId, params.email);
    return (await ops.append(params.appendInput)) as T;
  });
}
