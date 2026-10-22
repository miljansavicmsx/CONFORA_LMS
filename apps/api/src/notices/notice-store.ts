import { randomUUID } from 'node:crypto';

import type { Prisma } from '@confora/database';

import { nextAttempt } from './notice-attempt';
import type { EmailTransport } from './notice-transport';

export class NoticeRuleError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'NoticeRuleError';
  }
}

export class NoticeNotFoundError extends Error {
  constructor() {
    super('NOTICE_NOT_FOUND');
    this.name = 'NoticeNotFoundError';
  }
}

type NoticeClient = Pick<
  Prisma.TransactionClient,
  | 'noticeJob'
  | 'inAppNotice'
  | 'user'
  | 'credential'
  | 'certificationExamSession'
  | 'annualFeeObligation'
>;

type Actor = { userId: string; roles: readonly string[] };

const EXPIRY_WINDOW_MS = 90 * 86_400_000;
const EXAM_WINDOW_MS = 14 * 86_400_000;

const COPY = {
  CERTIFICATE_EXPIRY: {
    subject: 'Podsjetnik: istek certifikata',
    body: 'Certifikat uskoro ističe. Ovo je podsjetnik, a ne promjena statusa.',
  },
  RECERTIFICATION: {
    subject: 'Podsjetnik: recertifikacija',
    body: 'Otvoren je period recertifikacije. Odluku i dalje donosi ovlaštena osoba.',
  },
  EXAM: {
    subject: 'Podsjetnik: zakazani ispit',
    body: 'Imate zakazani ispit. Ovo nije rezultat niti certifikat.',
  },
  FEE: {
    subject: 'Podsjetnik: godišnja naknada',
    body: 'Godišnja naknada je dospjela. Neplaćanje ne povlači certifikat automatski.',
  },
  GENERAL: {
    subject: 'Obavijest',
    body: 'Imate novu obavijest.',
  },
} as const;

type NoticeKind = keyof typeof COPY;
type NoticeChannel = 'EMAIL' | 'IN_APP';

export type NoticeJobView = {
  id: string;
  channel: string;
  kind: string;
  status: string;
  attempts: number;
};

function assertRole(roles: readonly string[], required: string): void {
  if (!roles.includes(required)) {
    throw new NoticeRuleError('ROLE_SEPARATION');
  }
}

export async function listInAppNotices(client: NoticeClient, tenantId: string, userId: string) {
  const rows = await client.inAppNotice.findMany({
    where: { tenantId, userId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((row) => ({
    noticeId: row.id,
    title: row.title,
    body: row.body,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function markNoticeRead(
  client: NoticeClient,
  input: { tenantId: string; userId: string; noticeId: string; now: Date },
) {
  const row = await client.inAppNotice.findFirst({
    where: { tenantId: input.tenantId, id: input.noticeId, userId: input.userId },
  });
  if (!row) {
    throw new NoticeNotFoundError();
  }
  if (!row.readAt) {
    await client.inAppNotice.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: row.id } },
      data: { readAt: input.now },
    });
  }
  return { noticeId: row.id, read: true as const };
}

export async function enqueueDueReminders(
  client: NoticeClient,
  input: { tenantId: string; actor: Actor; now: Date },
): Promise<NoticeJobView[]> {
  assertRole(input.actor.roles, 'COM_TECH');
  const emails = new Map<string, string>();
  const created: NoticeJobView[] = [];
  const expiryHorizon = new Date(input.now.getTime() + EXPIRY_WINDOW_MS);
  const expiring = await client.credential.findMany({
    where: {
      tenantId: input.tenantId,
      credentialType: 'PERSONNEL',
      lifecycle: 'ACTIVE',
      expiresAt: { gte: input.now, lte: expiryHorizon },
    },
    select: { id: true, holderUserId: true },
  });
  for (const row of expiring) {
    created.push(
      ...(await enqueuePair(client, emails, {
        tenantId: input.tenantId,
        userId: row.holderUserId,
        kind: 'CERTIFICATE_EXPIRY',
        referenceId: row.id,
        now: input.now,
      })),
    );
    created.push(
      ...(await enqueuePair(client, emails, {
        tenantId: input.tenantId,
        userId: row.holderUserId,
        kind: 'RECERTIFICATION',
        referenceId: row.id,
        now: input.now,
      })),
    );
  }
  const examHorizon = new Date(input.now.getTime() + EXAM_WINDOW_MS);
  const sessions = await client.certificationExamSession.findMany({
    where: {
      tenantId: input.tenantId,
      status: { in: ['SCHEDULED', 'READY'] },
      scheduledStartAt: { gte: input.now, lte: examHorizon },
    },
    select: { id: true, candidateUserId: true },
  });
  for (const session of sessions) {
    created.push(
      ...(await enqueuePair(client, emails, {
        tenantId: input.tenantId,
        userId: session.candidateUserId,
        kind: 'EXAM',
        referenceId: session.id,
        now: input.now,
      })),
    );
  }
  const dues = await client.annualFeeObligation.findMany({
    where: { tenantId: input.tenantId, status: 'DUE' },
    select: { id: true, holderUserId: true },
  });
  for (const due of dues) {
    created.push(
      ...(await enqueuePair(client, emails, {
        tenantId: input.tenantId,
        userId: due.holderUserId,
        kind: 'FEE',
        referenceId: due.id,
        now: input.now,
      })),
    );
  }
  return created;
}

export async function drainNoticeQueue(
  client: NoticeClient,
  input: { tenantId: string; now: Date; transport: EmailTransport },
): Promise<NoticeJobView[]> {
  const due = await client.noticeJob.findMany({
    where: { tenantId: input.tenantId, status: 'QUEUED', nextAttemptAt: { lte: input.now } },
    orderBy: { nextAttemptAt: 'asc' },
    take: 50,
  });
  const results: NoticeJobView[] = [];
  for (const job of due) {
    await client.noticeJob.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: job.id } },
      data: { status: 'SENDING' },
    });
    const attempt = await deliver(client, input.transport, job, input.now);
    const saved = await client.noticeJob.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: job.id } },
      data: attempt,
    });
    results.push({
      id: saved.id,
      channel: saved.channel,
      kind: saved.kind,
      status: saved.status,
      attempts: saved.attempts,
    });
  }
  return results;
}

export async function markNoticeBounce(
  client: NoticeClient,
  input: { tenantId: string; actor: Actor; jobId: string },
) {
  assertRole(input.actor.roles, 'COM_TECH');
  return markDisposition(client, input.tenantId, input.jobId, 'BOUNCED');
}

export async function markNoticeComplaint(
  client: NoticeClient,
  input: { tenantId: string; actor: Actor; jobId: string },
) {
  assertRole(input.actor.roles, 'COM_TECH');
  return markDisposition(client, input.tenantId, input.jobId, 'COMPLAINT');
}

async function markDisposition(
  client: NoticeClient,
  tenantId: string,
  jobId: string,
  status: 'BOUNCED' | 'COMPLAINT',
): Promise<NoticeJobView> {
  const job = await client.noticeJob.findFirst({ where: { tenantId, id: jobId } });
  if (!job) {
    throw new NoticeNotFoundError();
  }
  if (job.channel !== 'EMAIL') {
    throw new NoticeRuleError('NOT_EMAIL');
  }
  const saved = await client.noticeJob.update({
    where: { tenantId_id: { tenantId, id: job.id } },
    data: { status },
  });
  return {
    id: saved.id,
    channel: saved.channel,
    kind: saved.kind,
    status: saved.status,
    attempts: saved.attempts,
  };
}

async function enqueuePair(
  client: NoticeClient,
  emails: Map<string, string>,
  input: { tenantId: string; userId: string; kind: NoticeKind; referenceId: string; now: Date },
): Promise<NoticeJobView[]> {
  const address = await emailFor(client, emails, input.tenantId, input.userId);
  if (!address) {
    return [];
  }
  const created: NoticeJobView[] = [];
  for (const channel of ['EMAIL', 'IN_APP'] as const) {
    const job = await enqueueOne(client, { ...input, channel, toAddress: address });
    if (job) {
      created.push(job);
    }
  }
  return created;
}

async function enqueueOne(
  client: NoticeClient,
  input: {
    tenantId: string;
    userId: string;
    kind: NoticeKind;
    referenceId: string;
    channel: NoticeChannel;
    toAddress: string;
    now: Date;
  },
): Promise<NoticeJobView | null> {
  const existing = await client.noticeJob.findUnique({
    where: {
      tenantId_kind_referenceId_channel: {
        tenantId: input.tenantId,
        kind: input.kind,
        referenceId: input.referenceId,
        channel: input.channel,
      },
    },
  });
  if (existing) {
    return null;
  }
  const copy = COPY[input.kind];
  const saved = await client.noticeJob.create({
    data: {
      id: randomUUID(),
      tenantId: input.tenantId,
      recipientUserId: input.userId,
      channel: input.channel,
      kind: input.kind,
      referenceId: input.referenceId,
      toAddress: input.toAddress,
      subject: copy.subject,
      body: copy.body,
      status: 'QUEUED',
      attempts: 0,
      maxAttempts: 3,
      nextAttemptAt: input.now,
    },
  });
  return {
    id: saved.id,
    channel: saved.channel,
    kind: saved.kind,
    status: saved.status,
    attempts: saved.attempts,
  };
}

async function emailFor(
  client: NoticeClient,
  cache: Map<string, string>,
  tenantId: string,
  userId: string,
): Promise<string | null> {
  const cached = cache.get(userId);
  if (cached) {
    return cached;
  }
  const user = await client.user.findUnique({
    where: { tenantId_id: { tenantId, id: userId } },
    select: { email: true },
  });
  if (!user) {
    return null;
  }
  cache.set(userId, user.email);
  return user.email;
}

async function deliver(
  client: NoticeClient,
  transport: EmailTransport,
  job: {
    id: string;
    tenantId: string;
    recipientUserId: string;
    channel: string;
    subject: string;
    body: string;
    toAddress: string;
    attempts: number;
    maxAttempts: number;
  },
  now: Date,
) {
  let accepted = false;
  let error: string | null = null;
  try {
    if (job.channel === 'EMAIL') {
      const result = await transport.send({
        to: job.toAddress,
        subject: job.subject,
        body: job.body,
      });
      accepted = result.accepted;
    } else {
      const existing = await client.inAppNotice.findUnique({
        where: { tenantId_jobId: { tenantId: job.tenantId, jobId: job.id } },
      });
      if (!existing) {
        await client.inAppNotice.create({
          data: {
            id: randomUUID(),
            tenantId: job.tenantId,
            userId: job.recipientUserId,
            jobId: job.id,
            title: job.subject,
            body: job.body,
          },
        });
      }
      accepted = true;
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message.slice(0, 500) : 'SEND_FAILED';
  }
  return nextAttempt({
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    accepted,
    now,
    error,
  });
}
