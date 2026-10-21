/**
 * Pause before another SERIALIZABLE append attempt.
 *
 * PostgreSQL aborts one or both transactions on a serialization conflict.
 * Retrying at once puts those writers back into the same conflict, including
 * independent tenants that share index pages and identical idempotency replays.
 * The chain compare-and-swap stays fail-closed. This delay only separates the
 * retries so one attempt can commit and the others can append or replay.
 * The attempt budget remains MAX_SERIALIZABLE_RETRIES.
 */
export const AUDIT_RETRY_FLOOR_MS = 40;
export const AUDIT_RETRY_SPAN_MS = 40;

export function auditSerializableRetryDelayMs(
  retryNumber: number,
  random: () => number = Math.random,
): number {
  if (!Number.isInteger(retryNumber) || retryNumber < 1) {
    return 0;
  }
  const floor = AUDIT_RETRY_FLOOR_MS * retryNumber;
  const span = AUDIT_RETRY_SPAN_MS * retryNumber;
  const sample = random();
  const unit = sample >= 0 && sample < 1 ? sample : 0;
  return floor + Math.floor(unit * span);
}

export function waitForAuditRetry(retryNumber: number): Promise<void> {
  const delay = auditSerializableRetryDelayMs(retryNumber);
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}
