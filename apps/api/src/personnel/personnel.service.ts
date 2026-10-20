import { randomUUID } from 'node:crypto';
import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import type { AuthenticatedActor } from '../auth/request-principal';
import { PersonnelNotFoundError } from '../prisma/personnel-certificate-store';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { PersonnelRuleError } from './personnel-rules';

const DENIED = new Set([
  'ROLE_SEPARATION',
  'CANDIDATE_CANNOT_ISSUE',
  'TRAINER_CANNOT_ISSUE',
  'NOT_HOLDER',
  'FOUR_EYES',
]);

function fail(error: unknown): never {
  if (error instanceof PersonnelNotFoundError) {
    throw new NotFoundException();
  }
  if (error instanceof PersonnelRuleError) {
    if (error.code === 'RATE_LIMIT') {
      throw new HttpException(error.code, 429);
    }
    if (DENIED.has(error.code)) {
      throw new AccessDeniedError();
    }
    throw new BadRequestException(error.code);
  }
  throw error;
}

@Injectable()
export class PersonnelCertificateService {
  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly audit: AuditService,
  ) {}

  private actor(actor: AuthenticatedActor) {
    return { userId: actor.userId, roles: actor.roles };
  }

  issue(
    actor: AuthenticatedActor,
    body: { decisionId: string; holderDisplayName: string; registryConsent: boolean },
  ) {
    const now = new Date();
    return this.tenantPrisma.personnel
      .issue({ ...body, actor: this.actor(actor), now })
      .then(async (result) => {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'PERSONNEL_CERTIFICATE_ISSUED',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'Credential',
          resourceId: result.credentialId,
          metadata: {
            credentialId: result.credentialId,
            decisionId: result.decisionId,
            certificateNumber: result.certificateNumber,
            registryListed: result.registryListed,
          },
        });
        return result;
      })
      .catch(fail);
  }

  changeStatus(
    actor: AuthenticatedActor,
    credentialId: string,
    body: { toStatus: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN'; reason: string },
  ) {
    const now = new Date();
    return this.tenantPrisma.personnel
      .changeStatus({ ...body, actor: this.actor(actor), credentialId, now })
      .then(async (result) => {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'PERSONNEL_CERTIFICATE_STATUS_CHANGED',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'Credential',
          resourceId: result.credentialId,
          metadata: {
            credentialId: result.credentialId,
            fromStatus: result.fromStatus,
            toStatus: result.toStatus,
            reason: body.reason,
          },
        });
        return result;
      })
      .catch(fail);
  }

  proposeAmf(actor: AuthenticatedActor, credentialId: string, reason: string) {
    const now = new Date();
    return this.tenantPrisma.personnel
      .proposeAmf({ actor: this.actor(actor), credentialId, reason, now })
      .then(async (result) => {
        await this.audit.append(actor, {
          idempotencyKey: randomUUID(),
          eventType: 'AMF_SUSPENSION_PROPOSED',
          outcome: 'SUCCESS',
          occurredAt: now,
          resourceType: 'AmfSuspensionProposal',
          resourceId: result.proposalId,
          metadata: {
            credentialId: result.credentialId,
            proposalId: result.proposalId,
            suspended: result.suspended,
          },
        });
        return result;
      })
      .catch(fail);
  }

  listMine(actor: AuthenticatedActor) {
    return this.tenantPrisma.personnel.listMine(actor.userId, new Date()).catch(fail);
  }

  pdf(actor: AuthenticatedActor, credentialId: string) {
    return this.tenantPrisma.personnel.pdf(actor.userId, credentialId, new Date()).catch(fail);
  }

  pdfUrl(actor: AuthenticatedActor, credentialId: string) {
    return this.listMine(actor).then((items) => {
      const item = items.find((row) => row.certificateId === credentialId);
      if (!item) {
        throw new NotFoundException();
      }
      return { pdfUrl: item.pdfUrl, certificateId: credentialId };
    });
  }

  credential(actor: AuthenticatedActor, credentialId: string) {
    return this.tenantPrisma.personnel.credential(actor.userId, credentialId).catch(fail);
  }

  addCpd(
    actor: AuthenticatedActor,
    credentialId: string,
    body: { title: string; hours: number; completedAt: string },
  ) {
    return this.tenantPrisma.personnel
      .addCpd({
        userId: actor.userId,
        credentialId,
        title: body.title,
        hours: body.hours,
        completedAt: new Date(body.completedAt),
      })
      .catch(fail);
  }

  reminders(actor: AuthenticatedActor, credentialId: string) {
    return this.tenantPrisma.personnel.reminders(actor.userId, credentialId).catch(fail);
  }

  publicOne(publicUid: string, sourceIp: string) {
    return this.tenantPrisma.personnel.publicOne(publicUid, new Date(), sourceIp).catch(fail);
  }

  search(input: { number?: string; name?: string }) {
    return this.tenantPrisma.personnel.search(input, new Date()).catch(fail);
  }

  statusList() {
    return this.tenantPrisma.personnel.statusList().catch(fail);
  }

  publicPdf(publicUid: string, ticket: string) {
    return this.tenantPrisma.personnel.publicPdf(publicUid, ticket, new Date()).catch(fail);
  }
}
