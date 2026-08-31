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

  it('P04_TEST_043 unregistered model access is denied (policy predicate)', () => {
    expect(isTenantRegisteredModel('Certificate')).toBe(false);
    expect(isTenantRegisteredModel('User')).toBe(true);
  });
});
