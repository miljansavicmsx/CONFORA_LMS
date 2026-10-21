import {
  AUDIT_RETRY_FLOOR_MS,
  AUDIT_RETRY_SPAN_MS,
  auditSerializableRetryDelayMs,
} from './audit-retry';

describe('audit serializable retry delay', () => {
  it('does not delay a non-retry', () => {
    expect(auditSerializableRetryDelayMs(0, () => 0.5)).toBe(0);
    expect(auditSerializableRetryDelayMs(-1, () => 0.5)).toBe(0);
    expect(auditSerializableRetryDelayMs(1.5, () => 0.5)).toBe(0);
  });

  it('keeps each retry inside a positive floor and jitter span', () => {
    for (const retryNumber of [1, 2, 3]) {
      const floor = AUDIT_RETRY_FLOOR_MS * retryNumber;
      const span = AUDIT_RETRY_SPAN_MS * retryNumber;
      expect(auditSerializableRetryDelayMs(retryNumber, () => 0)).toBe(floor);
      expect(auditSerializableRetryDelayMs(retryNumber, () => 0.999999)).toBe(floor + span - 1);
      expect(auditSerializableRetryDelayMs(retryNumber, () => -1)).toBe(floor);
      expect(auditSerializableRetryDelayMs(retryNumber, () => 2)).toBe(floor);
    }
  });

  it('jitters so lockstep writers do not share one delay', () => {
    const samples = new Set<number>();
    for (let i = 0; i < 40; i += 1) {
      samples.add(auditSerializableRetryDelayMs(1));
    }
    expect(samples.size).toBeGreaterThan(1);
    for (const sample of samples) {
      expect(sample).toBeGreaterThanOrEqual(AUDIT_RETRY_FLOOR_MS);
      expect(sample).toBeLessThan(AUDIT_RETRY_FLOOR_MS + AUDIT_RETRY_SPAN_MS);
    }
  });
});
