import {
  assertRecordTenantOwnership,
  injectTenantIntoCreateData,
  injectTenantIntoCreateManyData,
  mergeTenantIntoWhere,
  TenantAccessViolationError,
} from './tenant-prisma.util';

describe('tenant-prisma.util', () => {
  it('forces the active tenant and drops a caller tenant predicate', () => {
    expect(mergeTenantIntoWhere({ tenantId: 'other', status: 'DRAFT' }, 'tenant-a')).toEqual({
      AND: [{ tenantId: 'tenant-a' }, { status: 'DRAFT' }],
    });
  });

  it('stamps tenantId onto create rows', () => {
    expect(injectTenantIntoCreateData({ email: 'a@example.test' }, 'tenant-a')).toEqual({
      email: 'a@example.test',
      tenantId: 'tenant-a',
    });
    expect(
      injectTenantIntoCreateManyData(
        [{ email: 'a@example.test' }, { email: 'b@example.test' }],
        'tenant-a',
      ),
    ).toEqual([
      { email: 'a@example.test', tenantId: 'tenant-a' },
      { email: 'b@example.test', tenantId: 'tenant-a' },
    ]);
  });

  it('rejects a record from another tenant and allows a missing row', () => {
    expect(() => {
      assertRecordTenantOwnership({ tenantId: 'other' }, 'tenant-a', 'findUnique');
    }).toThrow(TenantAccessViolationError);
    expect(() => {
      assertRecordTenantOwnership(null, 'tenant-a', 'findUnique');
    }).not.toThrow();
  });
});
