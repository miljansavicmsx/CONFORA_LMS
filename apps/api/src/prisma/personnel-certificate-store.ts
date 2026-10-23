import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Prisma } from '@confora/database';

import { liveBallotCounts, voteResult } from '../certification-flow/certification-flow-rules';
import { buildCertificatePdf, buildPersonnelVerificationPdf } from '../personnel/personnel-pdf';
import {
  addYears,
  assertConsentRequestReceivedAt,
  assertDirectoryConsentAdministrator,
  assertIssuer,
  assertStatusTransition,
  directoryConsentActive,
  HIDDEN_PERSONNEL_VERIFICATION,
  PERSONNEL_VALIDITY_YEARS,
  PersonnelRuleError,
  presentPersonnelPublicVerification,
  publicCertificateStatus,
  type DirectoryConsentChannel,
  type DirectoryConsentVerificationMethod,
  type PersonnelPublicVerification,
  type PublicCertificateStatus,
  type StoredLifecycle,
} from '../personnel/personnel-rules';
import { includeFirstYear } from '../annual-fee/annual-fee-store';
import { encodedStatusList, statusListCredential } from '../personnel/personnel-status-list';
import {
  publishStatusList,
  signPersonnelCredential,
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
  | 'userProfile'
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

function configuredOrigin(
  name: 'PUBLIC_APP_ORIGIN' | 'API_PUBLIC_ORIGIN',
  devFallback: string,
): string {
  const configured = process.env[name]?.trim() ?? '';
  if (configured.length > 0) {
    return configured;
  }
  const env = process.env['NODE_ENV'];
  if (env === 'development' || env === 'test') {
    return devFallback;
  }
  throw new PersonnelRuleError('ORIGIN_UNCONFIGURED');
}

function statusListUrl(): string {
  return `${configuredOrigin('API_PUBLIC_ORIGIN', 'http://127.0.0.1:4000')}/v1/public/certificates/status-list`;
}

function appOrigin(): string {
  return configuredOrigin('PUBLIC_APP_ORIGIN', 'http://127.0.0.1:3001');
}

function apiOrigin(): string {
  return configuredOrigin('API_PUBLIC_ORIGIN', 'http://127.0.0.1:4000');
}

async function nextPublicUid(tx: Tx, year: number): Promise<string> {
  const prefix = `CON-${String(year)}-`;
  const count = await tx.credential.count({
    where: { credentialType: 'PERSONNEL', publicUid: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

async function lockIssuanceCase(tx: Tx, tenantId: string, caseId: string): Promise<void> {
  const key = `${tenantId}:${caseId}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, ${1n}))`;
}

export type IssuedCertificate = {
  credentialId: string;
  decisionId: string;
  certificateNumber: string;
  status: 'VALID';
  issuedAt: string;
  expiresAt: string;
  registryListed: boolean;
  attendanceLinked: false;
};

export type CertificateAudit = (tx: Tx, result: IssuedCertificate) => Promise<void>;

export async function issuePersonnelCertificate(
  client: PersonnelClient,
  input: {
    tenantId: string;
    actor: Actor;
    decisionId: string;
    holderDisplayName: string;
    registryConsent: boolean;
    now: Date;
    writeCertificateAudit?: CertificateAudit | undefined;
  },
) {
  return client.$transaction((tx) => issuePersonnelCertificateInTransaction(tx, input, false));
}

/**
 * Signing and activation stay in this transaction, after the case lock and the
 * case-version check. A voided decision therefore never receives an active credential.
 * Callers that already hold the case lock pass lockHeld so the lock is not taken twice.
 */
export async function issuePersonnelCertificateInTransaction(
  tx: Tx,
  input: {
    tenantId: string;
    actor: Actor;
    decisionId: string;
    holderDisplayName: string;
    registryConsent: boolean;
    now: Date;
    writeCertificateAudit?: CertificateAudit | undefined;
  },
  lockHeld: boolean,
): Promise<IssuedCertificate> {
  const located = await tx.examCertificationDecision.findFirst({
    where: { tenantId: input.tenantId, id: input.decisionId },
    select: { resultId: true },
  });
  if (!located) {
    throw new PersonnelNotFoundError();
  }
  const linked = await tx.professionalCase.findFirst({
    where: { tenantId: input.tenantId, examResultId: located.resultId },
    select: { id: true },
  });
  if (linked && !lockHeld) {
    await lockIssuanceCase(tx, input.tenantId, linked.id);
  }
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
  if (decision.supersededAt) {
    throw new PersonnelRuleError('DECISION_SUPERSEDED');
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
  const flowCase = linked
    ? await tx.professionalCase.findFirst({
        where: { tenantId: input.tenantId, id: linked.id },
        include: {
          assessments: true,
          proposals: true,
          schemeVersion: { include: { caseRule: true } },
        },
      })
    : null;
  const participants = new Set<string>([decision.decidedByUserId]);
  if (flowCase) {
    for (const assessment of flowCase.assessments) {
      if (
        assessment.voidedAt === null &&
        assessment.compositionVersion === flowCase.compositionVersion
      ) {
        participants.add(assessment.memberUserId);
      }
    }
    for (const proposal of flowCase.proposals) {
      if (
        proposal.confirmedByUserId &&
        proposal.state === 'CONFIRMED' &&
        proposal.compositionVersion === flowCase.compositionVersion
      ) {
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
  if (!flowCase || flowCase.phase !== 'APPROVED_FOR_ISSUANCE') {
    throw new PersonnelRuleError('CASE_NOT_ISSUABLE');
  }
  const counts = liveBallotCounts(flowCase.assessments, flowCase.compositionVersion);
  if (
    voteResult({
      grants: counts.grants,
      denies: counts.denies,
      quorum: flowCase.schemeVersion.caseRule?.votingQuorum ?? 2,
    }) !== 'GRANT'
  ) {
    throw new PersonnelRuleError('CASE_NOT_ISSUABLE');
  }
  const profile = await tx.userProfile.findUnique({
    where: { tenantId_userId: { tenantId: input.tenantId, userId: holderUserId } },
  });
  if (!profile || profile.identityVerificationState !== 'VERIFIED') {
    throw new PersonnelRuleError('IDENTITY_UNVERIFIED');
  }
  const holderName = `${profile.givenName} ${profile.familyName}`.replace(/\s+/g, ' ').trim();
  if (holderName.length < 2) {
    throw new PersonnelRuleError('IDENTITY_UNVERIFIED');
  }
  const activated = await tx.professionalCase.updateMany({
    where: {
      tenantId: input.tenantId,
      id: flowCase.id,
      phase: 'APPROVED_FOR_ISSUANCE',
      caseVersion: flowCase.caseVersion,
      compositionVersion: flowCase.compositionVersion,
    },
    data: { phase: 'ISSUED', caseVersion: { increment: 1 } },
  });
  if (activated.count !== 1) {
    throw new PersonnelRuleError('CASE_NOT_ISSUABLE');
  }
  const stillLive = await tx.examCertificationDecision.findFirst({
    where: {
      tenantId: input.tenantId,
      id: decision.id,
      supersededAt: null,
      outcome: 'GRANT',
    },
    select: { id: true },
  });
  if (!stillLive) {
    throw new PersonnelRuleError('DECISION_SUPERSEDED');
  }
  const version = decision.result.session.form.blueprint.schemeVersion;
  const issuedAt = input.now;
  const expiresAt = addYears(issuedAt, PERSONNEL_VALIDITY_YEARS);
  const credentialId = randomUUID();
  const publicUid = await nextPublicUid(tx, issuedAt.getUTCFullYear());
  const index = await tx.examPersonnelCredentialLink.count();
  const claims: PersonnelVcClaims = {
    certificateNumber: publicUid,
    holderName,
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
      holderName,
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
      holderDisplayName: holderName,
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
  const issued: IssuedCertificate = {
    credentialId,
    decisionId: decision.id,
    certificateNumber: publicUid,
    status: 'VALID',
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    registryListed: input.registryConsent,
    attendanceLinked: false,
  };
  if (input.writeCertificateAudit) {
    await input.writeCertificateAudit(tx, issued);
  }
  return issued;
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
  const verifyPath = `/verify/${row.qrVerifyToken}`;
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
    qrHash: row.qrVerifyToken,
    pdfUrl: `${apiOrigin()}/v1/public/certificates/${row.qrVerifyToken}/pdf`,
    pdfDownloadAvailable: true,
    learnerVerifyPath: verifyPath,
    publicVerificationUrl: `${appOrigin()}${verifyPath}`,
    publicVerifyUrl: `${appOrigin()}${verifyPath}`,
    verifyHash: row.qrVerifyToken,
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
  client: PersonnelClient & AccessLogClient,
  input: { publicUid: string; now: Date; sourceIp: string },
): Promise<{ filename: string; bytes: Uint8Array }> {
  const view = await publicCertificate(client, input);
  const verifyUrl =
    view.documentType === null
      ? `${appOrigin()}/verify`
      : `${appOrigin()}/verify/${input.publicUid.trim()}`;
  const bytes = await buildPersonnelVerificationPdf(view, verifyUrl);
  return { filename: 'verification.pdf', bytes };
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
    verifyUrl: `${appOrigin()}/verify/${row.qrVerifyToken}`,
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

const SEQUENTIAL_CERTIFICATE_NUMBER = /^CON-\d{4}-\d{4}$/i;

type AccessLogClient = {
  publicDocumentAccessLog: {
    create(args: {
      data: {
        id: string;
        tenantId: string | null;
        verificationKeyHash: string;
        sourceIp: string;
        outcome: string;
        recordedAt: Date;
      };
    }): Promise<unknown>;
  };
};

async function logPublicCertificateLookup(
  client: AccessLogClient,
  input: {
    tenantId: string | null;
    verificationKey: string;
    sourceIp: string;
    outcome: string;
    now: Date;
  },
): Promise<void> {
  await client.publicDocumentAccessLog.create({
    data: {
      id: randomUUID(),
      tenantId: input.tenantId,
      verificationKeyHash: createHash('sha256').update(input.verificationKey).digest('hex'),
      sourceIp: input.sourceIp.slice(0, 64) || 'unknown',
      outcome: input.outcome.slice(0, 16),
      recordedAt: input.now,
    },
  });
}

/**
 * OD-PP-30. A sequential record number does not open a public record.
 * Every number receives the same invalid body. The credential row is not read.
 * The random qrVerifyToken route is the public view. The holder name is on that
 * view only while registry consent is active. Full holder data stays on the
 * holder wallet and the role-guarded committee actions.
 */
export async function refusePublicNumberQuery(
  client: AccessLogClient,
  input: { number: string; sourceIp: string; now: Date },
): Promise<PersonnelPublicVerification> {
  const key = input.number.trim();
  await logPublicCertificateLookup(client, {
    tenantId: null,
    verificationKey: key.length > 0 ? key : 'empty',
    sourceIp: input.sourceIp,
    outcome: 'INVALID',
    now: input.now,
  });
  return HIDDEN_PERSONNEL_VERIFICATION;
}

/**
 * Public personnel verification. The sequential record number does not open the
 * record. The random qrVerifyToken does. Unknown and sequential keys share one body.
 */
export async function publicCertificate(
  client: PersonnelClient & AccessLogClient,
  input: { publicUid: string; now: Date; sourceIp: string },
): Promise<PersonnelPublicVerification> {
  const key = input.publicUid.trim();
  if (key.length === 0 || SEQUENTIAL_CERTIFICATE_NUMBER.test(key)) {
    await logPublicCertificateLookup(client, {
      tenantId: null,
      verificationKey: key || 'empty',
      sourceIp: input.sourceIp,
      outcome: 'INVALID',
      now: input.now,
    });
    return HIDDEN_PERSONNEL_VERIFICATION;
  }
  const row = await client.credential.findFirst({
    where: { qrVerifyToken: key, credentialType: 'PERSONNEL' },
    include: includeIssued,
  });
  if (!row?.examPersonnelLink) {
    await logPublicCertificateLookup(client, {
      tenantId: null,
      verificationKey: key,
      sourceIp: input.sourceIp,
      outcome: 'INVALID',
      now: input.now,
    });
    return HIDDEN_PERSONNEL_VERIFICATION;
  }
  const status = publicCertificateStatus(asLifecycle(row.lifecycle), row.expiresAt, input.now);
  const view = presentPersonnelPublicVerification({
    status,
    issuedAt: row.issuedAt,
    registryListed: row.examPersonnelLink.registryListed,
    registryConsentAt: row.examPersonnelLink.registryConsentAt,
    registryConsentRevokedAt: row.examPersonnelLink.registryConsentRevokedAt,
    holderName: row.examPersonnelLink.holderDisplayName,
  });
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
  await logPublicCertificateLookup(client, {
    tenantId: row.tenantId,
    verificationKey: key,
    sourceIp: input.sourceIp,
    outcome: view.status,
    now: input.now,
  });
  return view;
}

function verificationResult(
  status: PublicCertificateStatus,
): 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'WITHDRAWN' | 'SCOPE_REDUCED' | 'NOT_FOUND' {
  if (status === 'VALID') {
    return 'ACTIVE';
  }
  return status;
}

export type DirectoryConsentWithdrawal = {
  credentialId: string;
  holderUserId: string;
  lifecycle: StoredLifecycle;
  expiresAt: Date | null;
  registryListed: boolean;
  registryConsentAt: Date | null;
  registryConsentRevokedAt: Date;
  result: 'WITHDRAWN' | 'ALREADY_WITHDRAWN';
  channel: DirectoryConsentChannel;
  receivedAt: string;
  verifierUserId: string;
  verificationMethod: DirectoryConsentVerificationMethod;
  executorUserId: string;
};

export type DirectoryConsentAudit = (tx: Tx, result: DirectoryConsentWithdrawal) => Promise<void>;

/**
 * Interim directory-name withdrawal (OD-DIR-33, RB-02).
 * Sets registryConsentRevokedAt once. Does not delete the registry row, the
 * credential, or the original consent timestamp, and does not change lifecycle.
 * A second call keeps the first timestamp. Another tenant's row is not visible.
 */
export async function withdrawDirectoryConsent(
  client: PersonnelClient,
  input: {
    tenantId: string;
    actor: Actor;
    credentialId: string;
    holderUserId: string;
    channel: DirectoryConsentChannel;
    receivedAt: Date;
    verifierUserId: string;
    verificationMethod: DirectoryConsentVerificationMethod;
    now: Date;
    writeWithdrawalAudit?: DirectoryConsentAudit | undefined;
  },
): Promise<DirectoryConsentWithdrawal> {
  assertDirectoryConsentAdministrator(input.actor.roles);
  if (input.tenantId.trim().length === 0) {
    throw new PersonnelRuleError('TENANT_REQUIRED');
  }
  assertConsentRequestReceivedAt(input.receivedAt, input.now);
  return client.$transaction(async (tx) => {
    const row = await loadIssued(tx, input.tenantId, input.credentialId);
    if (row.holderUserId !== input.holderUserId) {
      throw new PersonnelRuleError('HOLDER_MISMATCH');
    }
    const verifier = await tx.user.findFirst({
      where: { tenantId: input.tenantId, id: input.verifierUserId, isActive: true },
      select: { id: true },
    });
    if (!verifier) {
      throw new PersonnelRuleError('VERIFIER_UNKNOWN');
    }
    const link = row.examPersonnelLink;
    if (!link) {
      throw new PersonnelNotFoundError();
    }
    let revokedAt = link.registryConsentRevokedAt;
    let outcome: DirectoryConsentWithdrawal['result'] = revokedAt
      ? 'ALREADY_WITHDRAWN'
      : 'WITHDRAWN';
    if (!revokedAt) {
      const updated = await tx.examPersonnelCredentialLink.updateMany({
        where: {
          tenantId: input.tenantId,
          credentialId: row.id,
          registryConsentRevokedAt: null,
        },
        data: { registryConsentRevokedAt: input.now },
      });
      if (updated.count === 1) {
        revokedAt = input.now;
        outcome = 'WITHDRAWN';
      } else {
        const again = await tx.examPersonnelCredentialLink.findFirst({
          where: { tenantId: input.tenantId, credentialId: row.id },
          select: { registryConsentRevokedAt: true },
        });
        if (!again?.registryConsentRevokedAt) {
          throw new PersonnelRuleError('WITHDRAWAL_FAILED');
        }
        revokedAt = again.registryConsentRevokedAt;
        outcome = 'ALREADY_WITHDRAWN';
      }
    }
    const withdrawal: DirectoryConsentWithdrawal = {
      credentialId: row.id,
      holderUserId: row.holderUserId,
      lifecycle: asLifecycle(row.lifecycle),
      expiresAt: row.expiresAt,
      registryListed: link.registryListed,
      registryConsentAt: link.registryConsentAt,
      registryConsentRevokedAt: revokedAt,
      result: outcome,
      channel: input.channel,
      receivedAt: input.receivedAt.toISOString(),
      verifierUserId: verifier.id,
      verificationMethod: input.verificationMethod,
      executorUserId: input.actor.userId,
    };
    if (input.writeWithdrawalAudit) {
      await input.writeWithdrawalAudit(tx, withdrawal);
    }
    return withdrawal;
  });
}

export async function searchPublicRegistry(
  client: PersonnelClient,
  input: { tenantId: string; name?: string; now: Date },
) {
  if (input.tenantId.trim().length === 0) {
    throw new PersonnelRuleError('TENANT_REQUIRED');
  }
  const name = input.name?.trim() ?? '';
  if (name.length < 3) {
    throw new PersonnelRuleError('SEARCH_REQUIRED');
  }
  const rows = await client.examPersonnelCredentialLink.findMany({
    where: {
      tenantId: input.tenantId,
      registryListed: true,
      registryConsentAt: { not: null },
      registryConsentRevokedAt: null,
      holderDisplayName: { contains: name, mode: 'insensitive' },
    },
    include: {
      credential: true,
      schemeVersion: { include: { scheme: true } },
    },
    take: 20,
  });
  return rows.flatMap((link) => {
    if (
      !directoryConsentActive({
        registryListed: link.registryListed,
        registryConsentAt: link.registryConsentAt,
        registryConsentRevokedAt: link.registryConsentRevokedAt,
      })
    ) {
      return [];
    }
    const status = publicCertificateStatus(
      asLifecycle(link.credential.lifecycle),
      link.credential.expiresAt,
      input.now,
    );
    return [
      {
        holderName: link.holderDisplayName,
        scheme: link.schemeVersion.scheme.title,
        schemeVersion: link.schemeVersion.versionLabel,
        status,
        issuedAt: link.credential.issuedAt.toISOString(),
        listed: true as const,
      },
    ];
  });
}

export async function revocationStatusList(client: PersonnelClient) {
  const withdrawn = await client.examPersonnelCredentialLink.findMany({
    where: { credential: { lifecycle: 'WITHDRAWN' } },
    select: { statusListIndex: true },
  });
  const encodedList = encodedStatusList(withdrawn.map((row) => row.statusListIndex));
  return publishStatusList(statusListCredential(encodedList, statusListUrl()));
}
