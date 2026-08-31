export const TENANT_REGISTERED_MODELS = ['Tenant', 'User', 'ExternalIdentityLink'] as const;

export type TenantRegisteredModel = (typeof TENANT_REGISTERED_MODELS)[number];

export type TenantOwnershipKey = 'id' | 'tenantId';

export const TENANT_MODEL_OWNERSHIP: Readonly<Record<TenantRegisteredModel, TenantOwnershipKey>> = {
  Tenant: 'id',
  User: 'tenantId',
  ExternalIdentityLink: 'tenantId',
};

export function isTenantRegisteredModel(model: string): model is TenantRegisteredModel {
  return (TENANT_REGISTERED_MODELS as readonly string[]).includes(model);
}
