import type { TenantId } from './tenant.js';

export interface AuditActorContext {
  actorId: string;
  tenantId?: TenantId;
  role?: string;
}
