export const INVALID_STATUS = 'INVALID_STATUS' as const;
export const INVALID_SCHEME_REF = 'INVALID_SCHEME_REF' as const;
export const MALFORMED_DATE = 'MALFORMED_DATE' as const;
export const INVERTED_DATE_RANGE = 'INVERTED_DATE_RANGE' as const;
export const DATE_RANGE_OVERFLOW = 'DATE_RANGE_OVERFLOW' as const;
export const INCOMPLETE_DATE_PAIR = 'INCOMPLETE_DATE_PAIR' as const;
export const DATE_RANGE_REQUIRED = 'DATE_RANGE_REQUIRED' as const;
export const UNKNOWN_FILTER = 'UNKNOWN_FILTER' as const;
export const INVALID_INVOCATION = 'INVALID_INVOCATION' as const;

export type ReportQueryErrorCode =
  | typeof INVALID_STATUS
  | typeof INVALID_SCHEME_REF
  | typeof MALFORMED_DATE
  | typeof INVERTED_DATE_RANGE
  | typeof DATE_RANGE_OVERFLOW
  | typeof INCOMPLETE_DATE_PAIR
  | typeof DATE_RANGE_REQUIRED
  | typeof UNKNOWN_FILTER
  | typeof INVALID_INVOCATION;

export class ReportQueryContractError extends Error {
  readonly code: ReportQueryErrorCode;

  constructor(code: ReportQueryErrorCode, message: string) {
    super(message);
    this.name = 'ReportQueryContractError';
    this.code = code;
  }
}
