import {
  isTenantRegisteredModel,
  TENANT_MODEL_OWNERSHIP,
  TENANT_REGISTERED_MODELS,
} from './tenant-model-policy';

describe('tenant-model-policy', () => {
  it('registers exactly Tenant, User, ExternalIdentityLink', () => {
    expect([...TENANT_REGISTERED_MODELS]).toEqual(['Tenant', 'User', 'ExternalIdentityLink']);
    expect(TENANT_MODEL_OWNERSHIP.Tenant).toBe('id');
    expect(TENANT_MODEL_OWNERSHIP.User).toBe('tenantId');
    expect(TENANT_MODEL_OWNERSHIP.ExternalIdentityLink).toBe('tenantId');
  });

  it('classifies unregistered models as outside tenant model policy', () => {
    expect(isTenantRegisteredModel('Certificate')).toBe(false);
    expect(isTenantRegisteredModel('User')).toBe(true);
  });
});
