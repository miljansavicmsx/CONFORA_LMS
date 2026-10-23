import { PersonnelRuleError } from '../personnel/personnel-rules';
import {
  openDirectoryConsentRequest,
  verifyDirectoryConsent,
  withdrawDirectoryConsent,
} from './directory-consent-withdrawal';
import { PersonnelNotFoundError } from './personnel-certificate-store';

const TENANT = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const OTHER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CREDENTIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const HOLDER = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const ADMIN = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const DIRECTOR = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const CANDIDATE = '99999999-9999-4999-8999-999999999999';
const SECOND_ADMIN = '12121212-1212-4121-8121-121212121212';
const NOW = new Date('2026-10-23T12:00:00.000Z');
const RECEIVED = new Date('2026-10-23T09:00:00.000Z');

type AuditRow = {
  eventType: string;
  outcome: 'SUCCESS' | 'DENIED';
  metadata: Record<string, string>;
  sequence: bigint;
};

function harness(revokedAt: Date | null = null) {
  const calls: string[] = [];
  const audits: AuditRow[] = [];
  let sequence = 0n;
  const state = {
    lifecycle: 'ACTIVE',
    registryListed: true,
    registryConsentAt: new Date('2026-10-21T12:00:00.000Z'),
    registryConsentRevokedAt: revokedAt,
    holderDisplayName: 'Demo Kandidat',
    payloadHash: 'abc',
    signature: 'signed-document',
    deleted: 0,
    active: new Set([HOLDER, ADMIN, DIRECTOR, CANDIDATE, SECOND_ADMIN]),
  };
  const tx = {
    credential: {
      findFirst: (args: { where: { tenantId: string; id: string } }) => {
        calls.push('credential.findFirst');
        if (args.where.tenantId !== TENANT || args.where.id !== CREDENTIAL) {
          return Promise.resolve(null);
        }
        return Promise.resolve({
          id: CREDENTIAL,
          holderUserId: HOLDER,
          lifecycle: state.lifecycle,
          expiresAt: new Date('2029-10-21T12:00:00.000Z'),
          payloadHash: state.payloadHash,
          signature: state.signature,
          examPersonnelLink: {
            registryListed: state.registryListed,
            registryConsentAt: state.registryConsentAt,
            registryConsentRevokedAt: state.registryConsentRevokedAt,
            holderDisplayName: state.holderDisplayName,
          },
        });
      },
      update: () => {
        calls.push('credential.update');
        return Promise.reject(new Error('credential update'));
      },
      delete: () => {
        state.deleted += 1;
        calls.push('credential.delete');
        return Promise.reject(new Error('credential delete'));
      },
    },
    user: {
      findFirst: (args: { where: { tenantId: string; id: string; isActive: boolean } }) => {
        calls.push('user.findFirst');
        if (
          args.where.tenantId === TENANT &&
          args.where.isActive &&
          state.active.has(args.where.id)
        ) {
          return Promise.resolve({ id: args.where.id });
        }
        return Promise.resolve(null);
      },
    },
    examPersonnelCredentialLink: {
      updateMany: (args: { data: { registryConsentRevokedAt: Date } }) => {
        calls.push('link.updateMany');
        if (state.registryConsentRevokedAt) {
          return Promise.resolve({ count: 0 });
        }
        state.registryConsentRevokedAt = args.data.registryConsentRevokedAt;
        return Promise.resolve({ count: 1 });
      },
      findFirst: () => {
        calls.push('link.findFirst');
        return Promise.resolve({ registryConsentRevokedAt: state.registryConsentRevokedAt });
      },
      delete: () => {
        state.deleted += 1;
        calls.push('link.delete');
        return Promise.reject(new Error('link delete'));
      },
    },
    auditEvent: {
      findMany: () => {
        calls.push('audit.findMany');
        return Promise.resolve(audits.filter((row) => row.outcome === 'SUCCESS'));
      },
      update: () => {
        calls.push('audit.update');
        return Promise.reject(new Error('audit update'));
      },
      delete: () => {
        calls.push('audit.delete');
        return Promise.reject(new Error('audit delete'));
      },
    },
  };
  const remember = (eventType: string, metadata: Record<string, string>) => {
    sequence += 1n;
    audits.push({ eventType, outcome: 'SUCCESS', metadata, sequence });
  };
  const client = {
    ...tx,
    $transaction: (fn: (inner: typeof tx) => Promise<unknown>) => {
      calls.push('transaction');
      return fn(tx);
    },
  };
  return { client: client as never, calls, state, audits, remember };
}

function open(flow: ReturnType<typeof harness>, holderUserId = HOLDER) {
  return openDirectoryConsentRequest(flow.client, {
    tenantId: TENANT,
    actor: { userId: ADMIN, roles: ['STAFF_SYSADM'] },
    credentialId: CREDENTIAL,
    holderUserId,
    channel: 'EMAIL',
    receivedAt: RECEIVED,
    now: NOW,
    writeAudit: (_tx, result) => {
      flow.remember('DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED', {
        holderUserId: result.holderUserId,
        channel: result.channel,
        receivedAt: result.receivedAt,
        requesterUserId: result.requesterUserId,
        procedure: result.procedure,
      });
      return Promise.resolve();
    },
  });
}

describe('directory consent withdrawal store', () => {
  it('refuses another role or a missing organization before any read', async () => {
    const denied = harness();
    await expect(
      openDirectoryConsentRequest(denied.client, {
        tenantId: TENANT,
        actor: { userId: ADMIN, roles: ['COM_CERT'] },
        credentialId: CREDENTIAL,
        holderUserId: HOLDER,
        channel: 'EMAIL',
        receivedAt: RECEIVED,
        now: NOW,
      }),
    ).rejects.toThrow(PersonnelRuleError);
    await expect(
      openDirectoryConsentRequest(denied.client, {
        tenantId: '   ',
        actor: { userId: ADMIN, roles: ['STAFF_SYSADM'] },
        credentialId: CREDENTIAL,
        holderUserId: HOLDER,
        channel: 'EMAIL',
        receivedAt: RECEIVED,
        now: NOW,
      }),
    ).rejects.toThrow('TENANT_REQUIRED');
    expect(denied.calls).toEqual([]);
    expect(denied.state.registryConsentRevokedAt).toBeNull();
  });

  it('rejects the holder, a non-staff user, and another organization before writing', async () => {
    const holder = harness();
    await open(holder);
    await expect(
      verifyDirectoryConsent(holder.client, {
        tenantId: TENANT,
        actor: { userId: HOLDER, roles: ['STAFF_SYSADM'] },
        credentialId: CREDENTIAL,
        verificationMethod: 'IN_PERSON_DOCUMENT_SIGHT',
        evidenceRef: 'RB02-EVIDENCE-001',
        now: NOW,
      }),
    ).rejects.toThrow('VERIFIER_IS_HOLDER');
    expect(holder.calls).not.toContain('link.updateMany');
    expect(holder.audits.filter((row) => row.eventType === 'DIRECTORY_CONSENT_VERIFIED')).toEqual(
      [],
    );

    const candidate = harness();
    await open(candidate);
    await expect(
      verifyDirectoryConsent(candidate.client, {
        tenantId: TENANT,
        actor: { userId: CANDIDATE, roles: ['USR_CAND'] },
        credentialId: CREDENTIAL,
        verificationMethod: 'IN_PERSON_DOCUMENT_SIGHT',
        evidenceRef: 'RB02-EVIDENCE-001',
        now: NOW,
      }),
    ).rejects.toThrow('VERIFIER_NOT_STAFF');
    for (const role of ['STAFF_TRAINADM', 'STAFF_AUD', 'USR_CERT'] as const) {
      await expect(
        verifyDirectoryConsent(candidate.client, {
          tenantId: TENANT,
          actor: { userId: CANDIDATE, roles: [role] },
          credentialId: CREDENTIAL,
          verificationMethod: 'IN_PERSON_DOCUMENT_SIGHT',
          evidenceRef: 'RB02-EVIDENCE-001',
          now: NOW,
        }),
      ).rejects.toThrow('VERIFIER_NOT_STAFF');
    }
    expect(candidate.state.deleted).toBe(0);

    const foreign = harness();
    await expect(
      verifyDirectoryConsent(foreign.client, {
        tenantId: OTHER,
        actor: { userId: DIRECTOR, roles: ['STAFF_DIR'] },
        credentialId: CREDENTIAL,
        verificationMethod: 'IN_PERSON_DOCUMENT_SIGHT',
        evidenceRef: 'RB02-EVIDENCE-001',
        now: NOW,
      }),
    ).rejects.toBeInstanceOf(PersonnelNotFoundError);
    await expect(
      withdrawDirectoryConsent(foreign.client, {
        tenantId: OTHER,
        actor: { userId: DIRECTOR, roles: ['STAFF_SYSADM'] },
        credentialId: CREDENTIAL,
        now: NOW,
      }),
    ).rejects.toBeInstanceOf(PersonnelNotFoundError);
    expect(foreign.calls).not.toContain('user.findFirst');
    expect(foreign.state.registryConsentRevokedAt).toBeNull();
  });

  it('does not execute without a verification or when the executor verified', async () => {
    const pending = harness();
    await open(pending);
    await expect(
      withdrawDirectoryConsent(pending.client, {
        tenantId: TENANT,
        actor: { userId: ADMIN, roles: ['STAFF_SYSADM'] },
        credentialId: CREDENTIAL,
        now: NOW,
      }),
    ).rejects.toThrow('NOT_VERIFIED');
    expect(pending.calls).not.toContain('link.updateMany');

    const samePerson = harness();
    await open(samePerson);
    await verifyDirectoryConsent(samePerson.client, {
      tenantId: TENANT,
      actor: { userId: ADMIN, roles: ['STAFF_SYSADM'] },
      credentialId: CREDENTIAL,
      verificationMethod: 'VIDEO_DOCUMENT_SIGHT',
      evidenceRef: 'RB02-EVIDENCE-002',
      now: NOW,
      writeAudit: (_tx, result) => {
        samePerson.remember('DIRECTORY_CONSENT_VERIFIED', {
          verifierUserId: result.verifierUserId,
          verifierRole: result.verifierRole,
          verificationMethod: result.verificationMethod,
          evidenceRef: result.evidenceRef,
          verifiedAt: result.verifiedAt,
          procedure: result.procedure,
        });
        return Promise.resolve();
      },
    });
    await expect(
      withdrawDirectoryConsent(samePerson.client, {
        tenantId: TENANT,
        actor: { userId: ADMIN, roles: ['STAFF_SYSADM'] },
        credentialId: CREDENTIAL,
        now: NOW,
      }),
    ).rejects.toThrow('FOUR_EYES');
    expect(samePerson.calls).not.toContain('link.updateMany');
    expect(samePerson.state.deleted).toBe(0);
    expect(samePerson.state.registryConsentRevokedAt).toBeNull();
  });

  it('withdraws once after a different staff user verifies, and repeats without another write', async () => {
    const flow = harness();
    const opened = await open(flow);
    expect(opened.result).toBe('REQUESTED');
    const verified = await verifyDirectoryConsent(flow.client, {
      tenantId: TENANT,
      actor: { userId: DIRECTOR, roles: ['STAFF_DIR'] },
      credentialId: CREDENTIAL,
      verificationMethod: 'IN_PERSON_DOCUMENT_SIGHT',
      evidenceRef: 'RB02-EVIDENCE-001',
      now: NOW,
      writeAudit: (_tx, result) => {
        flow.remember('DIRECTORY_CONSENT_VERIFIED', {
          verifierUserId: result.verifierUserId,
          verifierRole: result.verifierRole,
          verificationMethod: result.verificationMethod,
          evidenceRef: result.evidenceRef,
          verifiedAt: result.verifiedAt,
          procedure: result.procedure,
        });
        return Promise.resolve();
      },
    });
    expect(verified.result).toBe('VERIFIED');
    expect(verified.verifierUserId).toBe(DIRECTOR);
    expect(verified.verifierRole).toBe('STAFF_DIR');
    expect(verified.procedure).toBe('RB-02');
    expect(verified.procedureSection).toBe('Identity check');
    expect(verified.evidenceRef).toBe('RB02-EVIDENCE-001');

    const withdrawn = await withdrawDirectoryConsent(flow.client, {
      tenantId: TENANT,
      actor: { userId: ADMIN, roles: ['STAFF_SYSADM'] },
      credentialId: CREDENTIAL,
      now: NOW,
      writeAudit: () => Promise.resolve(),
    });
    expect(withdrawn.result).toBe('WITHDRAWN');
    expect(withdrawn.lifecycle).toBe('ACTIVE');
    expect(withdrawn.executorUserId).toBe(ADMIN);
    expect(withdrawn.verifierUserId).toBe(DIRECTOR);
    expect(withdrawn.procedureRef).toBe('docs/operations/RB-02-consent-withdrawal.md#execution');
    expect(flow.state.payloadHash).toBe('abc');
    expect(flow.state.signature).toBe('signed-document');
    expect(flow.state.holderDisplayName).toBe('Demo Kandidat');
    expect(flow.state.deleted).toBe(0);
    expect(flow.calls).not.toContain('credential.update');
    expect(flow.calls).not.toContain('credential.delete');
    expect(flow.calls).not.toContain('link.delete');
    expect(flow.calls).not.toContain('audit.update');
    expect(flow.calls).not.toContain('audit.delete');

    const writes = flow.calls.filter((name) => name === 'link.updateMany');
    const again = await withdrawDirectoryConsent(flow.client, {
      tenantId: TENANT,
      actor: { userId: ADMIN, roles: ['STAFF_SYSADM'] },
      credentialId: CREDENTIAL,
      now: NOW,
    });
    expect(again.result).toBe('ALREADY_WITHDRAWN');
    expect(again.registryConsentRevokedAt.toISOString()).toBe(NOW.toISOString());
    expect(flow.calls.filter((name) => name === 'link.updateMany')).toEqual(writes);
  });

  it('lets a second STAFF_SYSADM verify for a different STAFF_SYSADM executor', async () => {
    const flow = harness();
    await open(flow);
    const verified = await verifyDirectoryConsent(flow.client, {
      tenantId: TENANT,
      actor: { userId: SECOND_ADMIN, roles: ['STAFF_SYSADM'] },
      credentialId: CREDENTIAL,
      verificationMethod: 'IN_PERSON_DOCUMENT_SIGHT',
      evidenceRef: 'RB02-EVIDENCE-003',
      now: NOW,
      writeAudit: (_tx, result) => {
        flow.remember('DIRECTORY_CONSENT_VERIFIED', {
          verifierUserId: result.verifierUserId,
          verifierRole: result.verifierRole,
          verificationMethod: result.verificationMethod,
          evidenceRef: result.evidenceRef,
          verifiedAt: result.verifiedAt,
          procedure: result.procedure,
        });
        return Promise.resolve();
      },
    });
    expect(verified.verifierUserId).toBe(SECOND_ADMIN);
    expect(verified.verifierRole).toBe('STAFF_SYSADM');
    const withdrawn = await withdrawDirectoryConsent(flow.client, {
      tenantId: TENANT,
      actor: { userId: ADMIN, roles: ['STAFF_SYSADM'] },
      credentialId: CREDENTIAL,
      now: NOW,
      writeAudit: () => Promise.resolve(),
    });
    expect(withdrawn.result).toBe('WITHDRAWN');
    expect(withdrawn.executorUserId).toBe(ADMIN);
    expect(withdrawn.verifierUserId).toBe(SECOND_ADMIN);
    expect(withdrawn.lifecycle).toBe('ACTIVE');
    expect(flow.state.deleted).toBe(0);
  });
});
