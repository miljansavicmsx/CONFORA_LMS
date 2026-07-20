import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULT_TENANT_ID, parseTenantClaim } from './tenant.js';

describe('parseTenantClaim', () => {
  it('accepts tenant_id claim', () => {
    const result = parseTenantClaim({ tenant_id: DEFAULT_TENANT_ID });
    assert.equal(result?.tenantId, DEFAULT_TENANT_ID);
    assert.equal(result?.claimSource, 'tenant_id');
  });

  it('accepts tenantId claim', () => {
    const result = parseTenantClaim({ tenantId: DEFAULT_TENANT_ID });
    assert.equal(result?.claimSource, 'tenantId');
  });

  it('accepts org_id claim', () => {
    const result = parseTenantClaim({ org_id: DEFAULT_TENANT_ID });
    assert.equal(result?.claimSource, 'org_id');
  });

  it('prefers tenant_id over tenantId', () => {
    const other = '11111111-2222-3333-4444-555555555555';
    const result = parseTenantClaim({ tenant_id: DEFAULT_TENANT_ID, tenantId: other });
    assert.equal(result?.tenantId, DEFAULT_TENANT_ID);
  });

  it('returns undefined when no valid claim', () => {
    assert.equal(parseTenantClaim({}), undefined);
    assert.equal(parseTenantClaim({ tenant_id: 'not-a-uuid' }), undefined);
  });
});
