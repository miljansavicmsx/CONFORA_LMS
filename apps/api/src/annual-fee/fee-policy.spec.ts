import {
  assertLifecycleUntouched,
  obligationForIssuance,
  PROPOSED_ANNUAL_FEE_MINOR,
} from './fee-policy';

describe('annual fee policy', () => {
  it('uses the proposed 90 EUR only as the default schedule', () => {
    expect(PROPOSED_ANNUAL_FEE_MINOR).toBe(9000);
    const included = obligationForIssuance({
      annualAmountMinor: 9000,
      currency: 'EUR',
      firstYearIncluded: true,
      recertificationSeparate: true,
    });
    expect(included.status).toBe('INCLUDED');
    const custom = obligationForIssuance({
      annualAmountMinor: 12000,
      currency: 'EUR',
      firstYearIncluded: false,
      recertificationSeparate: true,
    });
    expect(custom.amountMinor).toBe(12000);
    expect(custom.status).toBe('DUE');
  });

  it('rejects a lifecycle change', () => {
    expect(() => {
      assertLifecycleUntouched('ACTIVE', 'ACTIVE');
    }).not.toThrow();
    expect(() => {
      assertLifecycleUntouched('ACTIVE', 'WITHDRAWN');
    }).toThrow('FEE_LIFECYCLE_CHANGED');
  });
});
