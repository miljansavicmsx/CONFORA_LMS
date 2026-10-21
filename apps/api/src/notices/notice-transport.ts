export type OutboundEmail = {
  to: string;
  subject: string;
  body: string;
};

export interface EmailTransport {
  readonly id: string;
  send(message: OutboundEmail): Promise<{ accepted: boolean }>;
}

export class StubEmailTransport implements EmailTransport {
  readonly id = 'stub';

  send(): Promise<{ accepted: boolean }> {
    return Promise.resolve({ accepted: true });
  }
}

export type SesSender = (message: OutboundEmail & { source: string }) => Promise<void>;

/**
 * Amazon SES adapter. The default process does not construct it and does not send.
 * SPF, DKIM and DMARC are required before a later change selects this transport.
 */
export class SesEmailTransport implements EmailTransport {
  readonly id = 'ses';

  constructor(private readonly sender: SesSender | null) {}

  async send(message: OutboundEmail): Promise<{ accepted: boolean }> {
    if (!this.sender) {
      throw new Error('SES_NOT_CONFIGURED');
    }
    await this.sender({ ...message, source: 'noreply@example.invalid' });
    return { accepted: true };
  }
}

/** Stub until a later decision wires SES. No credentials are read. */
export function selectEmailTransport(): EmailTransport {
  return new StubEmailTransport();
}
