import { randomBytes, randomUUID } from 'node:crypto';
import type { Prisma } from '@confora/database';

import { buildCertificatePdf } from '../personnel/personnel-pdf';
import {
  addYears,
  assertIssuer,
  assertStatusTransition,
  PERSONNEL_VALIDITY_YEARS,
  PersonnelRuleError,
  publicCertificateStatus,
  type PublicCertificateStatus,
  type StoredLifecycle,
} from '../personnel/personnel-rules';
import { includeFirstYear } from '../annual-fee/annual-fee-store';
import { encodedStatusList, statusListCredential } from '../personnel/personnel-status-list';
import {
  issueDownloadTicket,
  signPersonnelCredential,
  verifyDownloadTicket,
  type PersonnelVcClaims,
} from '../personnel/personnel-vc';

export class PersonnelNotFoundError extends Error {
  constructor() {
    super('PERSONNEL_NOT_FOUND');
    this.name = 'PersonnelNotFoundError';
  }
}

type Tx = Prisma.TransactionClient;

export type PersonnelClient = {
  $transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
} & Pick<
  Tx,
  | 'examCertificationDecision'
  | 'enrolmentTrainer'
  | 'credential'
  | 'achievementRecord'
  | 'credentialLifecycleEvent'
  | 'examPersonnelCredentialLink'
  | 'recertificationReminder'
  | 'cpdRecord'
  | 'amfMembership'
  | 'amfSuspensionProposal'
  | 'amfSuspensionConfirmation'
  | 'verificationLog'
>;

type Actor = { userId: string; roles: readonly string[] };

const includeIssued = {
  examPersonnelLink: {
    include: {
      schemeVersion: { include: { scheme: true } },
      reminders: true,
    },
  },
  achievement: true,
} as const;

type IssuedCredential = Prisma.CredentialGetPayload<{ include: typeof includeIssued }>;

function asLifecycle(value: string): StoredLifecycle {
  if (
    value === 'ACTIVE' ||
    value === 'EXPIRED' ||
    value === 'SUSPENDED' ||
    value === 'WITHDRAWN' ||
    value === 'SCOPE_REDUCED'
  ) {
    return value;
  }
  throw new PersonnelRuleError('STATUS_TRANSITION');
}

function statusListUrl(): string {
  const origin = process.env['API_PUBLIC_ORIGIN'] ?? 'http://127.0.0.1:4000';
  return `${origin}/v1/public/certificates/status-list`;
}

function appOrigin(): string {
  return process.env['PUBLIC_APP_ORIGIN'] ?? 'http://127.0.0.1:3001';
}

function apiOrigin(): string {
  return process.env['API_PUBLIC_ORIGIN'] ?? 'http://127.0.0.1:4000';
}

async function nextPublicUid(tx: Tx, year: number): Promise<string> {
  const prefix = `CON-${String(year)}-`;
  const count = await tx.credential.count({
    where: { credentialType: 'PERSONNEL', publicUid: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

function presentPublic(row: IssuedCredential, now: Date, includeName: boolean) {
  const link = row.examPersonnelLink;
  if (!link) {
    throw new PersonnelNotFoundError();
  }
  const status = publicCertificateStatus(asLifecycle(row.lifecycle), row.expiresAt, now);
  return {
    certificateNumber: row.publicUid,
    holderName: includeName ? link.holderDisplayName : null,
    scheme: link.schemeVersion.scheme.title,
    schemeVersion: link.schemeVersion.versionLabel,
    status,
    issuedAt: row.issuedAt.toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
    listed: link.registryListed,
  };
}

export async function issuePersonnelCertificate(
  client: PersonnelClient,
  input: {
    tenantId: string;
    actor: Actor;
    decisionId: string;
    holderDisplayName: string;
    registryConsent: boolean;
    now: Date;
  },
) {
  return client.$transaction(async (tx) => {
    const decision = await tx.examCertificationDecision.findFirst({
      where: { tenantId: input.tenantId, id: input.decisionId },
      include: {
        personnelIssue: true,
        result: {
          include: {
            session: {
              include: {
                form: {
                  include: {
                    blueprint: { include: { schemeVersion: { include: { scheme: true } } } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!decision) {
      throw new PersonnelNotFoundError();
    }
    if (decision.outcome !== 'GRANT') {
      throw new PersonnelRuleError('DECISION_NOT_GRANT');
    }
    if (decision.personnelIssue) {
      throw new PersonnelRuleError('CERTIFICATE_EXISTS');
    }
    const holderUserId = decision.result.session.candidateUserId;
    const trainer = await tx.enrolmentTrainer.findFirst({
      where: {
        tenantId: input.tenantId,
        trainerUserId: input.actor.userId,
        enrolment: { userId: holderUserId },
      },
    });
    const participants = new Set<string>([decision.decidedByUserId]);
    const flowCase = await tx.professionalCase.findFirst({
      where: { tenantId: input.tenantId, examResultId: decision.resultId },
      include: { assessments: true, proposals: true },
    });
    if (flowCase) {
      for (const assessment of flowCase.assessments) {
        participants.add(assessment.memberUserId);
      }
      for (const proposal of flowCase.proposals) {
        if (proposal.confirmedByUserId) {
          participants.add(proposal.confirmedByUserId);
        }
      }
    }
    assertIssuer({
      roles: input.actor.roles,
      issuerUserId: input.actor.userId,
      holderUserId,
      trainerOfCandidate: Boolean(trainer),
      decisionParticipantIds: [...participants],
    });
    const version = decision.result.session.form.blueprint.schemeVersion;
    const issuedAt = input.now;
    const expiresAt = addYears(issuedAt, PERSONNEL_VALIDITY_YEARS);
    const credentialId = randomUUID();
    const publicUid = await nextPublicUid(tx, issuedAt.getUTCFullYear());
    const index = await tx.examPersonnelCredentialLink.count();
    const claims: PersonnelVcClaims = {
      certificateNumber: publicUid,
      holderName: input.holderDisplayName,
      scheme: version.scheme.title,
      schemeVersion: version.versionLabel,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      statusListIndex: index,
      statusListUrl: statusListUrl(),
    };
    const signed = signPersonnelCredential(claims);
    await tx.credential.create({
      data: {
        id: credentialId,
        tenantId: input.tenantId,
        holderUserId,
        credentialType: 'PERSONNEL',
        lifecycle: 'ACTIVE',
        publicUid,
        payloadHash: signed.payloadHash,
        signature: signed.jwt,
        qrVerifyToken: randomBytes(24).toString('base64url'),
        scopeText: version.scopeDescription,
        cbName: 'CONFORA',
        cbIdentifier: 'CONFORA-CB',
        issuedAt,
        expiresAt,
      },
    });
    await tx.achievementRecord.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        credentialId,
        achievementTitle: version.scheme.title,
        holderName: input.holderDisplayName,
        awardingBodyName: 'CONFORA',
        awardingBodyIdentifier: 'CONFORA-CB',
        awardedAt: issuedAt,
        expiresAt,
        resultLabel: 'GRANT',
        criteriaSummary: 'Odluka komiteta nakon ispita.',
        language: 'bs',
      },
    });
    await tx.credentialLifecycleEvent.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        credentialId,
        toLifecycle: 'ACTIVE',
        reason: 'Izdavanje nakon odluke komiteta.',
        actorUserId: input.actor.userId,
        effectiveAt: issuedAt,
      },
    });
    const linkId = randomUUID();
    await tx.examPersonnelCredentialLink.create({
      data: {
        id: linkId,
        tenantId: input.tenantId,
        credentialId,
        examDecisionId: decision.id,
        schemeVersionId: version.id,
        holderDisplayName: input.holderDisplayName,
        registryListed: input.registryConsent,
        registryConsentAt: input.registryConsent ? issuedAt : null,
        statusListIndex: index,
      },
    });
    const reminders = [
      { kind: 'NINETY_DAYS' as const, dueAt: new Date(expiresAt.getTime() - 90 * 86_400_000) },
      { kind: 'THIRTY_DAYS' as const, dueAt: new Date(expiresAt.getTime() - 30 * 86_400_000) },
      { kind: 'ON_EXPIRY' as const, dueAt: expiresAt },
    ];
    await tx.recertificationReminder.createMany({
      data: reminders.map((reminder) => ({
        id: randomUUID(),
        tenantId: input.tenantId,
        linkId,
        kind: reminder.kind,
        dueAt: reminder.dueAt,
      })),
    });
    await includeFirstYear(tx, {
      tenantId: input.tenantId,
      credentialId,
      holderUserId,
      schemeVersionId: version.id,
      year: issuedAt.getUTCFullYear(),
    });
    return {
      credentialId,
      decisionId: decision.id,
      certificateNumber: publicUid,
      status: 'VALID' as const,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      registryListed: input.registryConsent,
      attendanceLinked: false,
    };
  });
}

async function loadIssued(
  tx: Tx,
  tenantId: string,
  credentialId: string,
): Promise<IssuedCredential> {
  const row = await tx.credential.findFirst({
    where: { tenantId, id: credentialId, credentialType: 'PERSONNEL' },
    include: includeIssued,
  });
  if (!row?.examPersonnelLink) {
    throw new PersonnelNotFoundError();
  }
  return row;
}

export async function changePersonnelStatus(
  client: PersonnelClient,
  input: {
    tenantId: string;
    actor: Actor;
    credentialId: string;
    toStatus: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
    reason: string;
    now: Date;
  },
) {
  assertIssuer({
    roles: input.actor.roles,
    issuerUserId: input.actor.userId,
    holderUserId: 'different-holder',
    trainerOfCandidate: false,
  });
  return client.$transaction(async (tx) => {
    const row = await loadIssued(tx, input.tenantId, input.credentialId);
    if (input.actor.userId === row.holderUserId) {
      throw new PersonnelRuleError('CANDIDATE_CANNOT_ISSUE');
    }
    const trainer = await tx.enrolmentTrainer.findFirst({
      where: {
        tenantId: input.tenantId,
        trainerUserId: input.actor.userId,
        enrolment: { userId: row.holderUserId },
      },
    });
    if (trainer) {
      throw new PersonnelRuleError('TRAINER_CANNOT_ISSUE');
    }
    const from = asLifecycle(row.lifecycle);
    assertStatusTransition(from, input.toStatus);
    await tx.credential.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: row.id } },
      data: { lifecycle: input.toStatus },
    });
    await tx.credentialLifecycleEvent.create({
      data: {
        id: randomUUID(),
        tenantId: input.tenantId,
        credentialId: row.id,
        fromLifecycle: from,
        toLifecycle: input.toStatus,
        reason: input.reason,
        actorUserId: input.actor.userId,
        effectiveAt: input.now,
      },
    });
    if (input.toStatus === 'SUSPENDED') {
      const proposal = await tx.amfSuspensionProposal.findFirst({
        where: {
          tenantId: input.tenantId,
          lifecycle: 'PROPOSED',
          membership: { userId: row.holderUserId },
        },
      });
      if (proposal) {
        await tx.amfSuspensionProposal.update({
          where: { tenantId_id: { tenantId: input.tenantId, id: proposal.id } },
          data: { lifecycle: 'CONFIRMED' },
        });
        await tx.amfSuspensionConfirmation.create({
          data: {
            id: randomUUID(),
            tenantId: input.tenantId,
            proposalId: proposal.id,
            confirmedByUserId: input.actor.userId,
            confirmedAt: input.now,
          },
        });
      }
    }
    const status = publicCertificateStatus(input.toStatus, row.expiresAt, input.now);
    return {
      credentialId: row.id,
      fromStatus: from,
      toStatus: input.toStatus,
      publicStatus: status,
    };
  });
}

export async function proposeAmfSuspension(
  client: PersonnelClient,
  input: {
    tenantId: string;
    actor: Actor;
    credentialId: string;
    reason: string;
    now: Date;
  },
) {
  assertIssuer({
    roles: input.actor.roles,
    issuerUserId: input.actor.userId,
    holderUserId: 'different-holder',
    trainerOfCandidate: false,
  });
  return client.$transaction(async (tx) => {
    const row = await loadIssued(tx, input.tenantId, input.credentialId);
    const year = input.now.getUTCFullYear();
    let membership = await tx.amfMembership.findFirst({
      where: { tenantId: input.tenantId, userId: row.holderUserId, periodYear: year },
    });
    if (membership?.lifecycle === 'PAID') {
      throw new PersonnelRuleError('AMF_ALREADY_PAID');
    }
    if (!membership) {
      membership = await tx.amfMembership.create({
        data: {
          id: randomUUID(),
          tenantId: input.tenantId,
          userId: row.holderUserId,
          periodYear: year,
          amount: 0,
          currency: 'BAM',
          lifecycle: 'DUE',
        },
      });
    }
    const proposalId = randomUUID();
    await tx.amfSuspensionProposal.create({
      data: {
        id: proposalId,
        tenantId: input.tenantId,
        membershipId: membership.id,
        proposedByUserId: input.actor.userId,
        proposedAt: input.now,
        reasonCode: 'UNPAID',
        lifecycle: 'PROPOSED',
      },
    });
    await tx.amfMembership.update({
      where: { tenantId_id: { tenantId: input.tenantId, id: membership.id } },
      data: { lifecycle: 'PROPOSAL_PENDING' },
    });
    return {
      proposalId,
      credentialId: row.id,
      credentialLifecycle: row.lifecycle,
      suspended: false,
    };
  });
}

export async function listHolderCertificates(
  client: PersonnelClient,
  input: { tenantId: string; userId: string; now: Date },
) {
  const rows = await client.credential.findMany({
    where: { tenantId: input.tenantId, holderUserId: input.userId, credentialType: 'PERSONNEL' },
    include: includeIssued,
    orderBy: { issuedAt: 'desc' },
  });
  return rows.filter((row) => row.examPersonnelLink).map((row) => walletItem(row, input.now));
}

function walletItem(row: IssuedCredential, now: Date) {
  const link = row.examPersonnelLink;
  if (!link) {
    throw new PersonnelNotFoundError();
  }
  const status = publicCertificateStatus(asLifecycle(row.lifecycle), row.expiresAt, now);
  const verifyPath = `/verify/${row.publicUid}`;
  const ticket = issueDownloadTicket(row.publicUid, now);
  return {
    certificateId: row.id,
    certificateKind: 'PERSONNEL',
    credentialWalletCategory: 'certification' as const,
    documentTypeLabel: 'Certifikat osoblja',
    title: link.schemeVersion.scheme.title,
    courseName: null,
    certificationLevel: link.schemeVersion.versionLabel,
    certificateNumber: row.publicUid,
    issueDate: row.issuedAt.toISOString(),
    expiryDate: row.expiresAt?.toISOString() ?? null,
    lifecycleStatus: status,
    qrHash: row.publicUid,
    pdfUrl: `${apiOrigin()}/v1/public/certificates/${row.publicUid}/pdf?ticket=${ticket}`,
    pdfDownloadAvailable: true,
    learnerVerifyPath: verifyPath,
    publicVerificationUrl: `${appOrigin()}${verifyPath}`,
    publicVerifyUrl: `${appOrigin()}${verifyPath}`,
    verifyHash: row.publicUid,
    supersededByCertificateId: null,
    schemeTitle: link.schemeVersion.scheme.title,
    issuedAt: row.issuedAt.toISOString(),
    validUntil: row.expiresAt?.toISOString() ?? null,
    publicNumber: row.publicUid,
    verifiableCredentialUrl: `${apiOrigin()}/v1/me/certificates/${row.id}/credential`,
    reminders: link.reminders.map((reminder) => ({
      kind: reminder.kind,
      dueAt: reminder.dueAt.toISOString(),
    })),
  };
}

export async function holderPdf(
  client: PersonnelClient,
  input: { tenantId: string; userId: string; credentialId: string; now: Date },
): Promise<{ filename: string; bytes: Uint8Array }> {
  const row = await client.credential.findFirst({
    where: {
      tenantId: input.tenantId,
      id: input.credentialId,
      holderUserId: input.userId,
      credentialType: 'PERSONNEL',
    },
    include: includeIssued,
  });
  if (!row?.examPersonnelLink || !row.expiresAt) {
    throw new PersonnelNotFoundError();
  }
  return renderPdf(row, input.now);
}

export async function publicPdf(
  client: PersonnelClient,
  input: { publicUid: string; ticket: string; now: Date },
): Promise<{ filename: string; bytes: Uint8Array }> {
  if (!verifyDownloadTicket(input.publicUid, input.ticket, input.now)) {
    throw new PersonnelRuleError('TICKET_INVALID');
  }
  const row = await client.credential.findFirst({
    where: { publicUid: input.publicUid, credentialType: 'PERSONNEL' },
    include: includeIssued,
  });
  if (!row?.examPersonnelLink || !row.expiresAt) {
    throw new PersonnelNotFoundError();
  }
  return renderPdf(row, input.now);
}

async function renderPdf(row: IssuedCredential, now: Date) {
  const link = row.examPersonnelLink;
  if (!link || !row.expiresAt) {
    throw new PersonnelNotFoundError();
  }
  const status = publicCertificateStatus(asLifecycle(row.lifecycle), row.expiresAt, now);
  const bytes = await buildCertificatePdf({
    holderName: link.holderDisplayName,
    scheme: link.schemeVersion.scheme.title,
    schemeVersion: link.schemeVersion.versionLabel,
    certificateNumber: row.publicUid,
    issuedAt: row.issuedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    status,
    verifyUrl: `${appOrigin()}/verify/${row.publicUid}`,
  });
  return { filename: `${row.publicUid}.pdf`, bytes };
}

export async function holderCredential(
  client: PersonnelClient,
  input: { tenantId: string; userId: string; credentialId: string },
) {
  const row = await client.credential.findFirst({
    where: {
      tenantId: input.tenantId,
      id: input.credentialId,
      holderUserId: input.userId,
    },
  });
  if (!row?.signature) {
    throw new PersonnelNotFoundError();
  }
  return { jwt: row.signature, payloadHash: row.payloadHash };
}

export async function addCpdRecord(
  client: PersonnelClient,
  input: {
    tenantId: string;
    userId: string;
    credentialId: string;
    title: string;
    hours: number;
    completedAt: Date;
  },
) {
  return client.$transaction(async (tx) => {
    const row = await loadIssued(tx, input.tenantId, input.credentialId);
    const link = row.examPersonnelLink;
    if (!link || row.holderUserId !== input.userId) {
      throw new PersonnelRuleError('NOT_HOLDER');
    }
    const id = randomUUID();
    await tx.cpdRecord.create({
      data: {
        id,
        tenantId: input.tenantId,
        linkId: link.id,
        holderUserId: input.userId,
        title: input.title,
        hours: input.hours,
        completedAt: input.completedAt,
      },
    });
    return { cpdRecordId: id, credentialId: row.id };
  });
}

export async function listReminders(
  client: PersonnelClient,
  input: { tenantId: string; userId: string; credentialId: string },
) {
  const row = await client.credential.findFirst({
    where: { tenantId: input.tenantId, id: input.credentialId, holderUserId: input.userId },
    include: { examPersonnelLink: { include: { reminders: true } } },
  });
  if (!row?.examPersonnelLink) {
    throw new PersonnelNotFoundError();
  }
  return row.examPersonnelLink.reminders.map((reminder) => ({
    kind: reminder.kind,
    dueAt: reminder.dueAt.toISOString(),
  }));
}

export async function publicCertificate(
  client: PersonnelClient,
  input: { publicUid: string; now: Date; sourceIp: string },
) {
  const row = await client.credential.findFirst({
    where: { publicUid: input.publicUid, credentialType: 'PERSONNEL' },
    include: includeIssued,
  });
  if (!row?.examPersonnelLink) {
    throw new PersonnelNotFoundError();
  }
  const status = publicCertificateStatus(asLifecycle(row.lifecycle), row.expiresAt, input.now);
  await client.verificationLog.create({
    data: {
      id: randomUUID(),
      tenantId: row.tenantId,
      credentialId: row.id,
      publicUid: row.publicUid,
      sourceIp: input.sourceIp.slice(0, 64),
      verifiedAt: input.now,
      result: verificationResult(status),
    },
  });
  return presentPublic(row, input.now, true);
}

function verificationResult(
  status: PublicCertificateStatus,
): 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'WITHDRAWN' | 'SCOPE_REDUCED' | 'NOT_FOUND' {
  if (status === 'VALID') {
    return 'ACTIVE';
  }
  return status;
}

export async function searchPublicRegistry(
  client: PersonnelClient,
  input: { number?: string; name?: string; now: Date },
) {
  if (input.number) {
    const row = await client.credential.findFirst({
      where: { publicUid: input.number, credentialType: 'PERSONNEL' },
      include: includeIssued,
    });
    if (!row?.examPersonnelLink) {
      return [];
    }
    return [presentPublic(row, input.now, true)];
  }
  const name = input.name?.trim() ?? '';
  if (name.length < 2) {
    throw new PersonnelRuleError('SEARCH_REQUIRED');
  }
  const rows = await client.examPersonnelCredentialLink.findMany({
    where: {
      registryListed: true,
      holderDisplayName: { contains: name, mode: 'insensitive' },
    },
    include: {
      credential: true,
      schemeVersion: { include: { scheme: true } },
    },
    take: 20,
  });
  return rows.map((link) => {
    const status = publicCertificateStatus(
      asLifecycle(link.credential.lifecycle),
      link.credential.expiresAt,
      input.now,
    );
    return {
      certificateNumber: link.credential.publicUid,
      holderName: link.holderDisplayName,
      scheme: link.schemeVersion.scheme.title,
      schemeVersion: link.schemeVersion.versionLabel,
      status,
      issuedAt: link.credential.issuedAt.toISOString(),
      expiresAt: link.credential.expiresAt?.toISOString() ?? null,
      listed: true,
    };
  });
}

export async function revocationStatusList(client: PersonnelClient) {
  const withdrawn = await client.examPersonnelCredentialLink.findMany({
    where: { credential: { lifecycle: 'WITHDRAWN' } },
    select: { statusListIndex: true },
  });
  const encodedList = encodedStatusList(withdrawn.map((row) => row.statusListIndex));
  return statusListCredential(encodedList, statusListUrl());
}
