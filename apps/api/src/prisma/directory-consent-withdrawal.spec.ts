import { PersonnelRuleError } from '../personnel/personnel-rules';
import { PersonnelNotFoundError, withdrawDirectoryConsent } from './personnel-certificate-store';

const TENANT = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const OTHER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CREDENTIAL = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const HOLDER = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const ADMIN = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const VERIFIER = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const NOW = new Date('2026-10-23T12:00:00.000Z');
const RECEIVED = new Date('2026-10-23T09:00:00.000Z');

type Call = { name: string; data?: unknown };

function harness(revokedAt: Date | null = null) {
  const calls: Call[] = [];
  const state = {
    lifecycle: 'ACTIVE',
    payloadHash: 'abc',
    signature: 'signed-document',
    publicUid: 'CON-2026-0007',
    holderDisplayName: 'Demo Kandidat',
    registryListed: true,
    registryConsentAt: new Date('2026-10-21T12:00:00.000Z'),
    registryConsentRevokedAt: revokedAt,
    deleted: 0,
  };
  const tx = {
    credential: {
      findFirst: (args: { where: { tenantId: string; id: string } }) => {
        calls.push({ name: 'credential.findFirst' });
        if (args.where.tenantId !== TENANT || args.where.id !== CREDENTIAL) {
          return Promise.resolve(null);
        }
        return Promise.resolve({
          id: CREDENTIAL,
          tenantId: TENANT,
          holderUserId: HOLDER,
          lifecycle: state.lifecycle,
          expiresAt: new Date('2029-10-21T12:00:00.000Z'),
          payloadHash: state.payloadHash,
          signature: state.signature,
          publicUid: state.publicUid,
          examPersonnelLink: {
            registryListed: state.registryListed,
            registryConsentAt: state.registryConsentAt,
            registryConsentRevokedAt: state.registryConsentRevokedAt,
            holderDisplayName: state.holderDisplayName,
          },
          achievement: { id: 'achievement' },
        });
      },
      update: () => {
        calls.push({ name: 'credential.update' });
        return Promise.reject(new Error('credential update'));
      },
      delete: () => {
        state.deleted += 1;
        calls.push({ name: 'credential.delete' });
        return Promise.reject(new Error('credential delete'));
      },
    },
    user: {
      findFirst: (args: { where: { tenantId: string; id: string } }) => {
        calls.push({ name: 'user.findFirst' });
        if (args.where.tenantId === TENANT && args.where.id === VERIFIER) {
          return Promise.resolve({ id: VERIFIER });
        }
        return Promise.resolve(null);
      },
    },
    examPersonnelCredentialLink: {
      updateMany: (args: { data: { registryConsentRevokedAt: Date } }) => {
        calls.push({ name: 'link.updateMany', data: args.data });
        if (state.registryConsentRevokedAt) {
          return Promise.resolve({ count: 0 });
        }
        state.registryConsentRevokedAt = args.data.registryConsentRevokedAt;
        return Promise.resolve({ count: 1 });
      },
      findFirst: () => {
        calls.push({ name: 'link.findFirst' });
        return Promise.resolve({ registryConsentRevokedAt: state.registryConsentRevokedAt });
      },
      delete: () => {
        state.deleted += 1;
        calls.push({ name: 'link.delete' });
        return Promise.reject(new Error('link delete'));
      },
    },
  };
  const client = {
    ...tx,
    $transaction: (fn: (inner: typeof tx) => Promise<unknown>) => {
      calls.push({ name: 'transaction' });
      return fn(tx);
    },
  };
  return { client: client as never, calls, state };
}

function request(
  client: never,
  overrides: Partial<{
    tenantId: string;
    roles: string[];
    holderUserId: string;
    verifierUserId: string;
    receivedAt: Date;
  }> = {},
) {
  return withdrawDirectoryConsent(client, {
    tenantId: overrides.tenantId ?? TENANT,
    actor: { userId: ADMIN, roles: overrides.roles ?? ['STAFF_SYSADM'] },
    credentialId: CREDENTIAL,
    holderUserId: overrides.holderUserId ?? HOLDER,
    channel: 'EMAIL',
    receivedAt: overrides.receivedAt ?? RECEIVED,
    verifierUserId: overrides.verifierUserId ?? VERIFIER,
    verificationMethod: 'IN_PERSON_DOCUMENT_SIGHT',
    now: NOW,
  });
}

describe('directory consent withdrawal store', () => {
  it('refuses another role or a missing organization before any read', async () => {
    const denied = harness();
    await expect(request(denied.client, { roles: ['COM_CERT'] })).rejects.toThrow(
      PersonnelRuleError,
    );
    await expect(request(denied.client, { roles: ['STAFF_DIR'] })).rejects.toThrow(
      'ROLE_SEPARATION',
    );
    await expect(request(denied.client, { tenantId: '   ' })).rejects.toThrow('TENANT_REQUIRED');
    expect(denied.calls).toEqual([]);
    expect(denied.state.deleted).toBe(0);
    expect(denied.state.registryConsentRevokedAt).toBeNull();
  });

  it('withdraws once, keeps the certificate, and repeats without another write', async () => {
    const first = harness();
    const withdrawn = await request(first.client);
    expect(withdrawn.result).toBe('WITHDRAWN');
    expect(withdrawn.lifecycle).toBe('ACTIVE');
    expect(withdrawn.registryListed).toBe(true);
    expect(withdrawn.registryConsentAt?.toISOString()).toBe('2026-10-21T12:00:00.000Z');
    expect(withdrawn.registryConsentRevokedAt.toISOString()).toBe(NOW.toISOString());
    expect(withdrawn.verifierUserId).toBe(VERIFIER);
    expect(withdrawn.executorUserId).toBe(ADMIN);
    expect(first.state.lifecycle).toBe('ACTIVE');
    expect(first.state.payloadHash).toBe('abc');
    expect(first.state.signature).toBe('signed-document');
    expect(first.state.holderDisplayName).toBe('Demo Kandidat');
    expect(first.state.deleted).toBe(0);
    expect(first.calls.map((call) => call.name)).not.toContain('credential.update');
    expect(first.calls.map((call) => call.name)).not.toContain('credential.delete');
    expect(first.calls.map((call) => call.name)).not.toContain('link.delete');
    const write = first.calls.find((call) => call.name === 'link.updateMany');
    expect(write?.data).toEqual({ registryConsentRevokedAt: NOW });

    const repeat = harness(NOW);
    const again = await request(repeat.client);
    expect(again.result).toBe('ALREADY_WITHDRAWN');
    expect(again.registryConsentRevokedAt.toISOString()).toBe(NOW.toISOString());
    expect(again.lifecycle).toBe('ACTIVE');
    expect(repeat.calls.map((call) => call.name)).not.toContain('link.updateMany');
    expect(repeat.state.deleted).toBe(0);
    expect(repeat.state.registryConsentAt.toISOString()).toBe('2026-10-21T12:00:00.000Z');
  });

  it('hides another organization and a mismatched holder without writing', async () => {
    const foreign = harness();
    await expect(request(foreign.client, { tenantId: OTHER })).rejects.toBeInstanceOf(
      PersonnelNotFoundError,
    );
    expect(foreign.calls.map((call) => call.name)).toEqual(['transaction', 'credential.findFirst']);
    expect(foreign.state.registryConsentRevokedAt).toBeNull();

    const mismatch = harness();
    await expect(
      request(mismatch.client, { holderUserId: '99999999-9999-4999-8999-999999999999' }),
    ).rejects.toThrow('HOLDER_MISMATCH');
    expect(mismatch.calls.map((call) => call.name)).not.toContain('link.updateMany');

    const unknownVerifier = harness();
    await expect(
      request(unknownVerifier.client, {
        verifierUserId: '99999999-9999-4999-8999-999999999999',
      }),
    ).rejects.toThrow('VERIFIER_UNKNOWN');
    expect(unknownVerifier.state.registryConsentRevokedAt).toBeNull();
    expect(unknownVerifier.state.deleted).toBe(0);
  });
});
