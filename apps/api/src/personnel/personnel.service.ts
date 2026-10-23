import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import type { AuthenticatedActor } from '../auth/request-principal';
import { PersonnelNotFoundError } from '../prisma/personnel-certificate-store';
import { TenantPrismaService } from '../prisma/tenant-prisma.service';
import { AccessDeniedError } from '../tenant/tenant-errors';
import {
  assertPublicRateLimit,
  claimDirectoryConsentRefusalWrite,
  DIRECTORY_CONSENT_PROCEDURE,
  DIRECTORY_CONSENT_PROCEDURE_REF,
  DIRECTORY_CONSENT_SECTIONS,
  DIRECTORY_CONSENT_UNAUTHORIZED_LIMIT,
  DIRECTORY_CONSENT_UNAUTHORIZED_WINDOW_MS,
  DIRECTORY_CONSENT_VERIFY_ACTION,
  directoryConsentVerifierRole,
  PersonnelRuleError,
  publicCertificateStatus,
  releaseDirectoryConsentRefusalWrite,
} from './personnel-rules';
import { importVerificationJwk, publicJwk } from './personnel-vc';

const DENIED = new Set([
  'ROLE_SEPARATION',
  'CANDIDATE_CANNOT_ISSUE',
  'TRAINER_CANNOT_ISSUE',
  'NOT_HOLDER',
  'FOUR_EYES',
  'TENANT_REQUIRED',
]);

const REJECTED = new Set([
  'HOLDER_MISMATCH',
  'VERIFIER_UNKNOWN',
  'VERIFIER_IS_HOLDER',
  'VERIFIER_NOT_STAFF',
  'VERIFIER_NOT_ACTIVE',
  'RECEIVED_AT',
  'NOT_VERIFIED',
  'NOT_REQUESTED',
  'EVIDENCE_REF',
  'WITHDRAWAL_FAILED',
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
    if (REJECTED.has(error.code)) {
      throw new BadRequestException(error.code);
    }
    throw new BadRequestException(error.code);
  }
  throw error;
}

@Injectable()
export class PersonnelCertificateService {
  private readonly logger = new Logger(PersonnelCertificateService.name);

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
      .issue({
        ...body,
        actor: this.actor(actor),
        now,
        writeCertificateAudit: async (tx, result) => {
          await this.audit.executeInTransaction(
            actor,
            async (ops) => {
              await ops.append({
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
            },
            tx,
          );
        },
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

  refuseNumber(number: string, sourceIp: string) {
    return this.tenantPrisma.personnel.refuseNumber(number, sourceIp, new Date()).catch(fail);
  }

  search(input: { name?: string }) {
    return this.tenantPrisma.personnel.search(input, new Date()).catch(fail);
  }

  statusList() {
    return this.tenantPrisma.personnel.statusList().catch(fail);
  }

  publicKeys() {
    const jwk = publicJwk();
    importVerificationJwk(jwk);
    return { keys: [jwk] };
  }

  publicPdf(publicUid: string, sourceIp: string) {
    return this.tenantPrisma.personnel.publicPdf(publicUid, sourceIp, new Date()).catch(fail);
  }

  /**
   * Records the withdrawal request. The verifier is not chosen on this call.
   * The certificate lifecycle, signature, and original consent time stay as they are.
   */
  openDirectoryConsentRequest(
    actor: AuthenticatedActor,
    credentialId: string,
    body: {
      holderUserId: string;
      channel: 'EMAIL' | 'POST' | 'IN_PERSON' | 'TELEPHONE';
      receivedAt: string;
    },
  ) {
    const now = new Date();
    const section = DIRECTORY_CONSENT_SECTIONS.request;
    return this.tenantPrisma.personnel
      .openDirectoryConsentRequest({
        actor: this.actor(actor),
        credentialId,
        holderUserId: body.holderUserId,
        channel: body.channel,
        receivedAt: new Date(body.receivedAt),
        now,
        writeAudit: (tx, result) =>
          this.appendConsent(actor, tx, 'DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED', now, {
            credentialId: result.credentialId,
            holderUserId: result.holderUserId,
            channel: result.channel,
            receivedAt: result.receivedAt,
            requesterUserId: result.requesterUserId,
            result: result.result,
            procedure: result.procedure,
            procedureRef: result.procedureRef,
            procedureSection: result.procedureSection,
          }),
      })
      .catch(async (error: unknown) => {
        await this.recordRefusal(actor, {
          credentialId,
          eventType: 'DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED',
          section,
          occurredAt: now,
          error,
          fields: {
            holderUserId: body.holderUserId,
            channel: body.channel,
            receivedAt: body.receivedAt,
            requesterUserId: actor.userId,
          },
        });
        fail(error);
      });
  }

  /**
   * The verifier is the authenticated user. Their staff role is the one held now.
   * A non-staff role is refused before any certificate or request read.
   */
  verifyDirectoryConsent(
    actor: AuthenticatedActor,
    credentialId: string,
    body: {
      verificationMethod:
        | 'IN_PERSON_DOCUMENT_SIGHT'
        | 'VIDEO_DOCUMENT_SIGHT'
        | 'KNOWN_ACCOUNT_CONFIRMATION';
      evidenceRef: string;
    },
  ) {
    const now = new Date();
    const section = DIRECTORY_CONSENT_SECTIONS.identity;
    if (!directoryConsentVerifierRole(actor.roles)) {
      return this.refuseNonStaffVerification(actor, credentialId, now);
    }
    return this.tenantPrisma.personnel
      .verifyDirectoryConsent({
        actor: this.actor(actor),
        credentialId,
        verificationMethod: body.verificationMethod,
        evidenceRef: body.evidenceRef,
        now,
        writeAudit: (tx, result) =>
          this.appendConsent(actor, tx, 'DIRECTORY_CONSENT_VERIFIED', now, {
            credentialId: result.credentialId,
            holderUserId: result.holderUserId,
            verifierUserId: result.verifierUserId,
            verifierRole: result.verifierRole,
            verificationMethod: result.verificationMethod,
            evidenceRef: result.evidenceRef,
            verifiedAt: result.verifiedAt,
            result: result.result,
            procedure: result.procedure,
            procedureRef: result.procedureRef,
            procedureSection: result.procedureSection,
          }),
      })
      .catch(async (error: unknown) => {
        await this.recordRefusal(actor, {
          credentialId,
          eventType: 'DIRECTORY_CONSENT_VERIFIED',
          section,
          occurredAt: now,
          error,
          fields: {
            verifierUserId: actor.userId,
            verificationMethod: body.verificationMethod,
            evidenceRef: body.evidenceRef,
          },
        });
        fail(error);
      });
  }

  /**
   * Executes only a request that already has a verification by a different person.
   * Follows the existing FOUR_EYES rule: the executor cannot be the verifier.
   */
  withdrawDirectoryConsent(actor: AuthenticatedActor, credentialId: string) {
    const now = new Date();
    const section = DIRECTORY_CONSENT_SECTIONS.execution;
    return this.tenantPrisma.personnel
      .withdrawDirectoryConsent({
        actor: this.actor(actor),
        credentialId,
        now,
        writeAudit: (tx, result) =>
          this.appendConsent(actor, tx, 'DIRECTORY_CONSENT_WITHDRAWN', now, {
            credentialId: result.credentialId,
            holderUserId: result.holderUserId,
            channel: result.channel,
            receivedAt: result.receivedAt,
            verifierUserId: result.verifierUserId,
            verifierRole: result.verifierRole,
            verificationMethod: result.verificationMethod,
            evidenceRef: result.evidenceRef,
            verifiedAt: result.verifiedAt,
            executorUserId: result.executorUserId,
            result: result.result,
            procedure: result.procedure,
            procedureRef: result.procedureRef,
            procedureSection: result.procedureSection,
          }),
      })
      .then((result) => ({
        credentialId: result.credentialId,
        holderUserId: result.holderUserId,
        channel: result.channel,
        receivedAt: result.receivedAt,
        verifierUserId: result.verifierUserId,
        verifierRole: result.verifierRole,
        verificationMethod: result.verificationMethod,
        evidenceRef: result.evidenceRef,
        verifiedAt: result.verifiedAt,
        executorUserId: result.executorUserId,
        executedAt: now.toISOString(),
        result: result.result,
        registryConsentRevokedAt: result.registryConsentRevokedAt.toISOString(),
        lifecycle: result.lifecycle,
        status: publicCertificateStatus(result.lifecycle, result.expiresAt, now),
        procedure: result.procedure,
        procedureRef: result.procedureRef,
        procedureSection: result.procedureSection,
      }))
      .catch(async (error: unknown) => {
        await this.recordRefusal(actor, {
          credentialId,
          eventType: 'DIRECTORY_CONSENT_WITHDRAWN',
          section,
          occurredAt: now,
          error,
          fields: {
            executorUserId: actor.userId,
            verifierUserId:
              error instanceof PersonnelRuleError && error.code === 'FOUR_EYES'
                ? actor.userId
                : undefined,
          },
        });
        fail(error);
      });
  }

  private appendConsent(
    actor: AuthenticatedActor,
    tx: unknown,
    eventType:
      | 'DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED'
      | 'DIRECTORY_CONSENT_VERIFIED'
      | 'DIRECTORY_CONSENT_WITHDRAWN',
    occurredAt: Date,
    metadata: Record<string, string>,
  ) {
    const resourceId = metadata['credentialId'] ?? '';
    return this.audit.executeInTransaction(
      actor,
      async (ops) => {
        await ops.append({
          idempotencyKey: randomUUID(),
          eventType,
          outcome: 'SUCCESS',
          occurredAt,
          resourceType: 'Credential',
          resourceId,
          metadata,
        });
      },
      tx as Parameters<AuditService['executeInTransaction']>[2],
    );
  }

  /**
   * Refusal audit is a new append after the business transaction has rolled back.
   * Metadata is identifiers and procedure codes only.
   */
  private async recordRefusal(
    actor: AuthenticatedActor,
    input: {
      credentialId: string;
      eventType:
        | 'DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED'
        | 'DIRECTORY_CONSENT_VERIFIED'
        | 'DIRECTORY_CONSENT_WITHDRAWN';
      section: (typeof DIRECTORY_CONSENT_SECTIONS)[keyof typeof DIRECTORY_CONSENT_SECTIONS];
      occurredAt: Date;
      error: unknown;
      fields: Record<string, string | undefined>;
    },
  ): Promise<void> {
    const code =
      input.error instanceof PersonnelNotFoundError
        ? 'NOT_FOUND'
        : input.error instanceof PersonnelRuleError
          ? input.error.code
          : null;
    if (!code) {
      return;
    }
    const anchor =
      input.section === DIRECTORY_CONSENT_SECTIONS.identity
        ? 'identity-check'
        : input.section === DIRECTORY_CONSENT_SECTIONS.execution
          ? 'execution'
          : 'request';
    const metadata: Record<string, string> = {
      credentialId: input.credentialId,
      result: code,
      procedure: DIRECTORY_CONSENT_PROCEDURE,
      procedureRef: `${DIRECTORY_CONSENT_PROCEDURE_REF}#${anchor}`,
      procedureSection: input.section,
    };
    for (const [key, value] of Object.entries(input.fields)) {
      if (value) {
        metadata[key] = value;
      }
    }
    await this.appendRefusal(actor, {
      eventType: input.eventType,
      occurredAt: input.occurredAt,
      credentialId: input.credentialId,
      result: code,
      metadata,
    });
  }

  /**
   * Staff role comes from the session. This runs before a certificate lookup,
   * so a missing certificate and an existing one return the same 403.
   * The refusal row is the caller, the action, the result, and the time.
   */
  private async refuseNonStaffVerification(
    actor: AuthenticatedActor,
    credentialId: string,
    occurredAt: Date,
  ): Promise<never> {
    const result = 'VERIFIER_NOT_STAFF';
    try {
      assertPublicRateLimit(
        `directory-consent-verify:${actor.tenantId}:${actor.userId}`,
        occurredAt.getTime(),
        DIRECTORY_CONSENT_UNAUTHORIZED_LIMIT,
        DIRECTORY_CONSENT_UNAUTHORIZED_WINDOW_MS,
      );
    } catch (error) {
      if (error instanceof PersonnelRuleError && error.code === 'RATE_LIMIT') {
        throw new HttpException('RATE_LIMIT', 429);
      }
      throw error;
    }
    const dedupKey = [
      actor.tenantId,
      actor.userId,
      credentialId,
      DIRECTORY_CONSENT_VERIFY_ACTION,
      result,
    ].join(':');
    if (claimDirectoryConsentRefusalWrite(dedupKey, occurredAt.getTime())) {
      const wrote = await this.appendRefusal(actor, {
        eventType: 'DIRECTORY_CONSENT_VERIFIED',
        occurredAt,
        credentialId,
        result,
        metadata: {
          credentialId,
          action: DIRECTORY_CONSENT_VERIFY_ACTION,
          result,
          procedure: DIRECTORY_CONSENT_PROCEDURE,
          procedureRef: `${DIRECTORY_CONSENT_PROCEDURE_REF}#identity-check`,
          procedureSection: DIRECTORY_CONSENT_SECTIONS.identity,
        },
      });
      if (!wrote) {
        releaseDirectoryConsentRefusalWrite(dedupKey);
      }
    }
    throw new AccessDeniedError();
  }

  /**
   * A failed refusal append must not replace the original 4xx.
   * The log names the event and the result code only.
   */
  private async appendRefusal(
    actor: AuthenticatedActor,
    input: {
      eventType:
        | 'DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED'
        | 'DIRECTORY_CONSENT_VERIFIED'
        | 'DIRECTORY_CONSENT_WITHDRAWN';
      occurredAt: Date;
      credentialId: string;
      result: string;
      metadata: Record<string, string>;
    },
  ): Promise<boolean> {
    try {
      await this.audit.append(actor, {
        idempotencyKey: randomUUID(),
        eventType: input.eventType,
        outcome: 'DENIED',
        occurredAt: input.occurredAt,
        resourceType: 'Credential',
        resourceId: input.credentialId,
        metadata: input.metadata,
      });
      return true;
    } catch {
      this.logger.warn(
        `directory consent refusal audit failed event=${input.eventType} result=${input.result}`,
      );
      return false;
    }
  }
}
