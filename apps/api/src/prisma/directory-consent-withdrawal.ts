import type { Prisma } from '@confora/database';

import { PersonnelNotFoundError } from './personnel-certificate-store';
import {
  assertConsentRequestReceivedAt,
  assertDirectoryConsentAdministrator,
  assertDirectoryConsentEvidenceRef,
  assertDirectoryConsentFourEyes,
  assertDirectoryConsentVerifier,
  directoryConsentVerifierRole,
  DIRECTORY_CONSENT_PROCEDURE,
  DIRECTORY_CONSENT_PROCEDURE_REF,
  DIRECTORY_CONSENT_SECTIONS,
  PersonnelRuleError,
  type DirectoryConsentChannel,
  type DirectoryConsentVerificationMethod,
  type StoredLifecycle,
} from '../personnel/personnel-rules';

const REQUEST_EVENT = 'DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED';
const VERIFY_EVENT = 'DIRECTORY_CONSENT_VERIFIED';

type ConsentTx = Pick<
  Prisma.TransactionClient,
  'credential' | 'user' | 'examPersonnelCredentialLink' | 'auditEvent'
>;

export type DirectoryConsentClient = {
  $transaction<T>(fn: (tx: ConsentTx) => Promise<T>): Promise<T>;
} & ConsentTx;

type Actor = { userId: string; roles: readonly string[] };

export type DirectoryConsentAudit<T> = (tx: ConsentTx, result: T) => Promise<void>;

type StoredRequest = {
  holderUserId: string;
  channel: string;
  receivedAt: string;
  requesterUserId: string;
};

type StoredVerification = {
  verifierUserId: string;
  verifierRole: string;
  verificationMethod: string;
  evidenceRef: string;
  verifiedAt: string;
};

export type DirectoryConsentRequestResult = StoredRequest & {
  credentialId: string;
  result: 'REQUESTED' | 'ALREADY_REQUESTED';
  procedure: typeof DIRECTORY_CONSENT_PROCEDURE;
  procedureRef: string;
  procedureSection: string;
};

export type DirectoryConsentVerificationResult = StoredVerification & {
  credentialId: string;
  holderUserId: string;
  result: 'VERIFIED' | 'ALREADY_VERIFIED';
  procedure: typeof DIRECTORY_CONSENT_PROCEDURE;
  procedureRef: string;
  procedureSection: string;
};

export type DirectoryConsentWithdrawal = {
  credentialId: string;
  holderUserId: string;
  lifecycle: StoredLifecycle;
  expiresAt: Date | null;
  registryListed: boolean;
  registryConsentAt: Date | null;
  registryConsentRevokedAt: Date;
  result: 'WITHDRAWN' | 'ALREADY_WITHDRAWN';
  channel: string;
  receivedAt: string;
  verifierUserId: string;
  verifierRole: string;
  verificationMethod: string;
  evidenceRef: string;
  verifiedAt: string;
  executorUserId: string;
  procedure: typeof DIRECTORY_CONSENT_PROCEDURE;
  procedureRef: string;
  procedureSection: string;
};

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

function textMeta(value: Prisma.JsonValue): Record<string, string> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string') {
      out[key] = item;
    }
  }
  return out;
}

function procedureFields(section: string) {
  return {
    procedure: DIRECTORY_CONSENT_PROCEDURE,
    procedureRef: `${DIRECTORY_CONSENT_PROCEDURE_REF}#${section === DIRECTORY_CONSENT_SECTIONS.identity ? 'identity-check' : section === DIRECTORY_CONSENT_SECTIONS.execution ? 'execution' : 'request'}`,
    procedureSection: section,
  };
}

async function loadCredential(tx: ConsentTx, tenantId: string, credentialId: string) {
  const row = await tx.credential.findFirst({
    where: { tenantId, id: credentialId, credentialType: 'PERSONNEL' },
    select: {
      id: true,
      holderUserId: true,
      lifecycle: true,
      expiresAt: true,
      examPersonnelLink: {
        select: {
          registryListed: true,
          registryConsentAt: true,
          registryConsentRevokedAt: true,
        },
      },
    },
  });
  if (!row?.examPersonnelLink) {
    throw new PersonnelNotFoundError();
  }
  return row;
}

async function successEvents(tx: ConsentTx, tenantId: string, credentialId: string) {
  return tx.auditEvent.findMany({
    where: {
      tenantId,
      resourceId: credentialId,
      outcome: 'SUCCESS',
      eventType: { in: [REQUEST_EVENT, VERIFY_EVENT] },
    },
    orderBy: { sequence: 'asc' },
    select: { eventType: true, metadata: true, sequence: true },
  });
}

function readRequest(
  rows: Array<{ eventType: string; metadata: Prisma.JsonValue }>,
): StoredRequest | null {
  const row = rows.find((item) => item.eventType === REQUEST_EVENT);
  if (!row) {
    return null;
  }
  const meta = textMeta(row.metadata);
  if (
    !meta['holderUserId'] ||
    !meta['channel'] ||
    !meta['receivedAt'] ||
    !meta['requesterUserId']
  ) {
    return null;
  }
  return {
    holderUserId: meta['holderUserId'],
    channel: meta['channel'],
    receivedAt: meta['receivedAt'],
    requesterUserId: meta['requesterUserId'],
  };
}

function readVerification(
  rows: Array<{ eventType: string; metadata: Prisma.JsonValue }>,
): StoredVerification | null {
  const row = rows.find((item) => item.eventType === VERIFY_EVENT);
  if (!row) {
    return null;
  }
  const meta = textMeta(row.metadata);
  const role = meta['verifierRole'];
  if (
    !meta['verifierUserId'] ||
    !role ||
    !directoryConsentVerifierRole([role]) ||
    !meta['verificationMethod'] ||
    !meta['evidenceRef'] ||
    !meta['verifiedAt'] ||
    meta['procedure'] !== DIRECTORY_CONSENT_PROCEDURE
  ) {
    return null;
  }
  try {
    assertDirectoryConsentEvidenceRef(meta['evidenceRef']);
  } catch {
    return null;
  }
  return {
    verifierUserId: meta['verifierUserId'],
    verifierRole: role,
    verificationMethod: meta['verificationMethod'],
    evidenceRef: meta['evidenceRef'],
    verifiedAt: meta['verifiedAt'],
  };
}

function requireTenant(tenantId: string): void {
  if (tenantId.trim().length === 0) {
    throw new PersonnelRuleError('TENANT_REQUIRED');
  }
}

export async function openDirectoryConsentRequest(
  client: DirectoryConsentClient,
  input: {
    tenantId: string;
    actor: Actor;
    credentialId: string;
    holderUserId: string;
    channel: DirectoryConsentChannel;
    receivedAt: Date;
    now: Date;
    writeAudit?: DirectoryConsentAudit<DirectoryConsentRequestResult> | undefined;
  },
): Promise<DirectoryConsentRequestResult> {
  assertDirectoryConsentAdministrator(input.actor.roles);
  requireTenant(input.tenantId);
  return client.$transaction(async (tx) => {
    const row = await loadCredential(tx, input.tenantId, input.credentialId);
    if (row.holderUserId !== input.holderUserId) {
      throw new PersonnelRuleError('HOLDER_MISMATCH');
    }
    assertConsentRequestReceivedAt(input.receivedAt, input.now);
    const existing = readRequest(await successEvents(tx, input.tenantId, row.id));
    const procedure = procedureFields(DIRECTORY_CONSENT_SECTIONS.request);
    if (existing) {
      return {
        credentialId: row.id,
        ...existing,
        result: 'ALREADY_REQUESTED' as const,
        ...procedure,
      };
    }
    const created: DirectoryConsentRequestResult = {
      credentialId: row.id,
      holderUserId: row.holderUserId,
      channel: input.channel,
      receivedAt: input.receivedAt.toISOString(),
      requesterUserId: input.actor.userId,
      result: 'REQUESTED',
      ...procedure,
    };
    if (input.writeAudit) {
      await input.writeAudit(tx, created);
    }
    return created;
  });
}

export async function verifyDirectoryConsent(
  client: DirectoryConsentClient,
  input: {
    tenantId: string;
    actor: Actor;
    credentialId: string;
    verificationMethod: DirectoryConsentVerificationMethod;
    evidenceRef: string;
    now: Date;
    writeAudit?: DirectoryConsentAudit<DirectoryConsentVerificationResult> | undefined;
  },
): Promise<DirectoryConsentVerificationResult> {
  requireTenant(input.tenantId);
  return client.$transaction(async (tx) => {
    const row = await loadCredential(tx, input.tenantId, input.credentialId);
    const events = await successEvents(tx, input.tenantId, row.id);
    if (!readRequest(events)) {
      throw new PersonnelRuleError('NOT_REQUESTED');
    }
    if (input.actor.userId === row.holderUserId) {
      throw new PersonnelRuleError('VERIFIER_IS_HOLDER');
    }
    const verifier = await tx.user.findFirst({
      where: { tenantId: input.tenantId, id: input.actor.userId, isActive: true },
      select: { id: true },
    });
    if (!verifier) {
      throw new PersonnelRuleError('VERIFIER_NOT_ACTIVE');
    }
    assertDirectoryConsentEvidenceRef(input.evidenceRef);
    const verifierRole = assertDirectoryConsentVerifier({
      verifierUserId: verifier.id,
      holderUserId: row.holderUserId,
      roles: input.actor.roles,
    });
    const procedure = procedureFields(DIRECTORY_CONSENT_SECTIONS.identity);
    const existing = readVerification(events);
    if (existing) {
      return {
        credentialId: row.id,
        holderUserId: row.holderUserId,
        ...existing,
        result: 'ALREADY_VERIFIED' as const,
        ...procedure,
      };
    }
    const created: DirectoryConsentVerificationResult = {
      credentialId: row.id,
      holderUserId: row.holderUserId,
      verifierUserId: verifier.id,
      verifierRole,
      verificationMethod: input.verificationMethod,
      evidenceRef: input.evidenceRef,
      verifiedAt: input.now.toISOString(),
      result: 'VERIFIED',
      ...procedure,
    };
    if (input.writeAudit) {
      await input.writeAudit(tx, created);
    }
    return created;
  });
}

export async function withdrawDirectoryConsent(
  client: DirectoryConsentClient,
  input: {
    tenantId: string;
    actor: Actor;
    credentialId: string;
    now: Date;
    writeAudit?: DirectoryConsentAudit<DirectoryConsentWithdrawal> | undefined;
  },
): Promise<DirectoryConsentWithdrawal> {
  assertDirectoryConsentAdministrator(input.actor.roles);
  requireTenant(input.tenantId);
  return client.$transaction(async (tx) => {
    const row = await loadCredential(tx, input.tenantId, input.credentialId);
    const events = await successEvents(tx, input.tenantId, row.id);
    const request = readRequest(events);
    const verification = readVerification(events);
    if (!request || !verification) {
      throw new PersonnelRuleError('NOT_VERIFIED');
    }
    if (verification.verifierUserId === row.holderUserId) {
      throw new PersonnelRuleError('VERIFIER_IS_HOLDER');
    }
    assertDirectoryConsentFourEyes(input.actor.userId, verification.verifierUserId);
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
      channel: request.channel,
      receivedAt: request.receivedAt,
      verifierUserId: verification.verifierUserId,
      verifierRole: verification.verifierRole,
      verificationMethod: verification.verificationMethod,
      evidenceRef: verification.evidenceRef,
      verifiedAt: verification.verifiedAt,
      executorUserId: input.actor.userId,
      ...procedureFields(DIRECTORY_CONSENT_SECTIONS.execution),
    };
    if (input.writeAudit) {
      await input.writeAudit(tx, withdrawal);
    }
    return withdrawal;
  });
}
