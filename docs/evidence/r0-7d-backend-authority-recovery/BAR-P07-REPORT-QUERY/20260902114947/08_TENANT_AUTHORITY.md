# Tenant Authority

SERVER_DERIVED_TENANT_ONLY via TenantContextStore.
ACTOR_TENANT_CONTEXT_EQUALITY_CHECK=true
P07_CALLER_SUPPLIED_TENANT_ID_ALLOWED=false
P07_CROSS_TENANT_QUERY_ALLOWED=false
TenantPrisma force-injects request tenant; caller tenantId structurally impossible.
E2E P07_TEST_029 proves Tenant A aggregates exclude Tenant B rows.
