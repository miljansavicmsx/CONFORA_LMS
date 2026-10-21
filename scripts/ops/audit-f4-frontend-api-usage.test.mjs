import assert from 'node:assert/strict';
import test from 'node:test';

import { findingsForSource, isProductionSource } from './audit-f4-frontend-api-usage.mjs';

test('registry legacyPath metadata is not a production call', () => {
  const source = `export const entry = {\n  legacyPath: "/v1/admin/reports/catalog",\n};\n`;
  assert.deepEqual(findingsForSource('frontend-app/src/lib/api/endpoint-registry.ts', source), []);
});

test('comments and registry todo notes that mention removed export URLs are not calls', () => {
  const source = `// GET /api/reports/export removed in F4-8e\nexport const entry = {\n  todo: "POST export only — GET /api/reports/export removed in F4-8e",\n  nestPath: "/v1/staff/reports/export",\n};\n`;
  assert.deepEqual(findingsForSource('frontend-app/src/lib/api/endpoint-registry.ts', source), []);
});

test('production GET of the legacy admin reports export is an export bypass', () => {
  const source = `await client.get("/v1/admin/reports/export?reportKey=overview&format=csv");\n`;
  const findings = findingsForSource('frontend-app/src/lib/admin-reports-api.ts', source);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.rule, 'EXPORT_BYPASS');
});

test('production use of a blocked admin reports route fails the gate', () => {
  const source = `const url = "/v1/admin/reports/catalog";\n`;
  const findings = findingsForSource('frontend-app/src/pages/admin/AdminReportsPage.tsx', source);
  assert.equal(findings[0]?.rule, 'BLOCKED_ROUTE_PRODUCTION');
});

test('legacy admin mutation calls fail the gate', () => {
  const source = `await client.patch("/v1/admin/complaints/00000000-0000-4000-8000-000000000099", {});\n`;
  const findings = findingsForSource('frontend-app/src/lib/api/complaints-client.ts', source);
  assert.equal(findings[0]?.rule, 'LEGACY_MUTATION_PRODUCTION');
});

test('test files are outside the production gate', () => {
  assert.equal(
    isProductionSource('frontend-app/src/lib/__tests__/admin-reports-api.test.ts'),
    false,
  );
  const source = `expect(client.get("/v1/admin/reports/export")).toBeUndefined();\n`;
  assert.deepEqual(
    findingsForSource('frontend-app/src/lib/__tests__/admin-reports-api.test.ts', source),
    [],
  );
});
