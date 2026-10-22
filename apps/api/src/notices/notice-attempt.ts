export type NoticeAttempt = {
  status: 'SENT' | 'QUEUED' | 'FAILED';
  attempts: number;
  nextAttemptAt: Date;
  lastError: string | null;
};

/** Retry while attempts remain. Exhausted failures stay FAILED for the result log. */
export function nextAttempt(input: {
  attempts: number;
  maxAttempts: number;
  accepted: boolean;
  now: Date;
  error: string | null;
}): NoticeAttempt {
  const attempts = input.attempts + 1;
  if (input.accepted) {
    return { status: 'SENT', attempts, nextAttemptAt: input.now, lastError: null };
  }
  if (attempts >= input.maxAttempts) {
    return { status: 'FAILED', attempts, nextAttemptAt: input.now, lastError: input.error };
  }
  return {
    status: 'QUEUED',
    attempts,
    nextAttemptAt: new Date(input.now.getTime() + attempts * 60_000),
    lastError: input.error,
  };
}
