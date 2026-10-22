/** Proposed price list. Charges read the scheme row, not this constant. */
export const PROPOSED_ANNUAL_FEE_MINOR = 9000;
export const PROPOSED_ANNUAL_FEE_CURRENCY = 'EUR';

export type FeeSchedule = {
  annualAmountMinor: number;
  currency: string;
  firstYearIncluded: boolean;
  recertificationSeparate: boolean;
};

export function obligationForIssuance(fee: FeeSchedule): {
  kind: 'FIRST_YEAR';
  amountMinor: number;
  currency: string;
  status: 'INCLUDED' | 'DUE';
} {
  return {
    kind: 'FIRST_YEAR',
    amountMinor: fee.annualAmountMinor,
    currency: fee.currency,
    status: fee.firstYearIncluded ? 'INCLUDED' : 'DUE',
  };
}

/** Non-payment must not change a credential lifecycle. */
export function assertLifecycleUntouched(before: string, after: string): void {
  if (before !== after) {
    throw new Error('FEE_LIFECYCLE_CHANGED');
  }
}
