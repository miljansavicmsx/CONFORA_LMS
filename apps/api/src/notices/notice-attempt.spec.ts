import { nextAttempt } from './notice-attempt';
import { selectEmailTransport, SesEmailTransport } from './notice-transport';

const now = new Date('2026-10-21T00:00:00.000Z');

describe('notice delivery', () => {
  it('retries a failed send and then records exhaustion', () => {
    const first = nextAttempt({
      attempts: 0,
      maxAttempts: 3,
      accepted: false,
      now,
      error: 'temporary',
    });
    expect(first.status).toBe('QUEUED');
    expect(first.attempts).toBe(1);
    expect(first.nextAttemptAt.getTime()).toBe(now.getTime() + 60_000);
    const exhausted = nextAttempt({
      attempts: 2,
      maxAttempts: 3,
      accepted: false,
      now,
      error: 'temporary',
    });
    expect(exhausted.status).toBe('FAILED');
    expect(exhausted.attempts).toBe(3);
  });

  it('records an accepted send', () => {
    const sent = nextAttempt({
      attempts: 1,
      maxAttempts: 3,
      accepted: true,
      now,
      error: null,
    });
    expect(sent).toMatchObject({ status: 'SENT', attempts: 2, lastError: null });
  });

  it('keeps the stub transport and leaves SES unconfigured', async () => {
    expect(selectEmailTransport().id).toBe('stub');
    const ses = new SesEmailTransport(null);
    await expect(ses.send({ to: 'a@b.c', subject: 's', body: 'b' })).rejects.toThrow(
      'SES_NOT_CONFIGURED',
    );
  });
});
