import type { TenantId } from './tenant.js';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string | null;
}

export interface TenantEntity extends BaseEntity {
  tenantId: TenantId;
}
