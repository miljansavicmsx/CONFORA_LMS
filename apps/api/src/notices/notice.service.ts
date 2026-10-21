import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import type { AuthenticatedActor } from '../auth/request-principal';
import { NoticeNotFoundError, NoticeRuleError } from './notice-store';
import { selectEmailTransport } from './notice-transport';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { AccessDeniedError } from '../tenant/tenant-errors';

@Injectable()
export class NoticeService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly audit: AuditService,
  ) {}

  list(actor: AuthenticatedActor) {
    return this.tenantPrisma.notices.list(actor.userId).catch(fail);
  }

  read(actor: AuthenticatedActor, noticeId: string) {
    return this.tenantPrisma.notices
      .read({ userId: actor.userId, noticeId, now: new Date() })
      .catch(fail);
  }

  async remind(actor: AuthenticatedActor) {
    const now = new Date();
    try {
      const queued = await this.tenantPrisma.notices.remind({
        actor: { userId: actor.userId, roles: actor.roles },
        now,
      });
      for (const job of queued) {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'NOTICE_QUEUED',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'NoticeJob',
          resourceId: job.id,
          metadata: {
            kind: job.kind,
            channel: job.channel,
            status: job.status,
            attempts: job.attempts,
          },
        });
      }
      const results = await this.tenantPrisma.notices.drain(now, selectEmailTransport());
      for (const job of results) {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'NOTICE_RESULT',
          outcome: job.status === 'FAILED' ? 'FAILURE' : 'SUCCESS',
          occurredAt: now,
          resourceType: 'NoticeJob',
          resourceId: job.id,
          metadata: {
            kind: job.kind,
            channel: job.channel,
            status: job.status,
            attempts: job.attempts,
          },
        });
      }
      return {
        queued: queued.length,
        sent: results.filter((job) => job.status === 'SENT').length,
        failed: results.filter((job) => job.status === 'FAILED').length,
        jobs: results,
      };
    } catch (error) {
      fail(error);
    }
  }

  async bounce(actor: AuthenticatedActor, jobId: string) {
    return this.disposition(actor, jobId, 'NOTICE_BOUNCED', (roles) =>
      this.tenantPrisma.notices.bounce({ actor: { userId: actor.userId, roles }, jobId }),
    );
  }

  async complaint(actor: AuthenticatedActor, jobId: string) {
    return this.disposition(actor, jobId, 'NOTICE_COMPLAINT', (roles) =>
      this.tenantPrisma.notices.complaint({ actor: { userId: actor.userId, roles }, jobId }),
    );
  }

  private async disposition(
    actor: AuthenticatedActor,
    jobId: string,
    eventType: 'NOTICE_BOUNCED' | 'NOTICE_COMPLAINT',
    run: (roles: readonly string[]) => Promise<{
      id: string;
      channel: string;
      kind: string;
      status: string;
      attempts: number;
    }>,
  ) {
    const now = new Date();
    try {
      const job = await run(actor.roles);
      await this.audit.append(actor, {
        idempotencyKey: randomUUID(),
        eventType,
        outcome: 'SUCCESS',
        occurredAt: now,
        resourceType: 'NoticeJob',
        resourceId: jobId,
        metadata: {
          kind: job.kind,
          channel: job.channel,
          status: job.status,
          attempts: job.attempts,
        },
      });
      return job;
    } catch (error) {
      fail(error);
    }
  }
}

function fail(error: unknown): never {
  if (error instanceof NoticeNotFoundError) {
    throw new NotFoundException();
  }
  if (error instanceof NoticeRuleError && error.code === 'ROLE_SEPARATION') {
    throw new AccessDeniedError();
  }
  if (error instanceof NoticeRuleError) {
    throw new BadRequestException(error.code);
  }
  throw error;
}
