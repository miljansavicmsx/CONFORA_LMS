import { createHash } from 'node:crypto';

import { HIDDEN_PERSONNEL_VERIFICATION, PersonnelRuleError } from '../personnel/personnel-rules';
import { refusePublicNumberQuery, searchPublicRegistry } from './personnel-certificate-store';

describe('sequential certificate number lookup', () => {
  it('returns the invalid body and does not read a credential', async () => {
    const reads: string[] = [];
    const logs: Array<{ verificationKeyHash: string; outcome: string }> = [];
    const number = 'CON-2026-0001';
    const view = await refusePublicNumberQuery(
      {
        credential: {
          findFirst: () => {
            reads.push('credential');
            return Promise.reject(new Error('credential read'));
          },
        },
        publicDocumentAccessLog: {
          create: (args: { data: { verificationKeyHash: string; outcome: string } }) => {
            logs.push({
              verificationKeyHash: args.data.verificationKeyHash,
              outcome: args.data.outcome,
            });
            return Promise.resolve({});
          },
        },
      } as never,
      { number, sourceIp: '203.0.113.8', now: new Date('2026-10-22T00:00:00.000Z') },
    );
    expect(view).toEqual(HIDDEN_PERSONNEL_VERIFICATION);
    expect(reads).toEqual([]);
    expect(logs).toEqual([
      {
        verificationKeyHash: createHash('sha256').update(number).digest('hex'),
        outcome: 'INVALID',
      },
    ]);
  });

  it('does not treat a number argument as a registry search', async () => {
    const reads: string[] = [];
    const client = {
      credential: {
        findFirst: () => {
          reads.push('credential');
          return Promise.resolve(null);
        },
      },
      examPersonnelCredentialLink: {
        findMany: () => {
          reads.push('link');
          return Promise.resolve([]);
        },
      },
    };
    await expect(
      searchPublicRegistry(client as never, {
        tenantId: '11111111-1111-4111-8111-111111111111',
        now: new Date('2026-10-22T00:00:00.000Z'),
        ...{ number: 'CON-2026-0001' },
      }),
    ).rejects.toThrow(PersonnelRuleError);
    expect(reads).toEqual([]);
  });

  it('lists a holder only with active consent and omits the record number and expiry', async () => {
    const issuedAt = new Date('2026-10-21T00:00:00.000Z');
    const expiresAt = new Date('2029-10-21T00:00:00.000Z');
    const tenantId = '11111111-1111-4111-8111-111111111111';
    let captured: { where?: Record<string, unknown> } | undefined;
    const link = (
      holderDisplayName: string,
      registryConsentAt: Date | null,
      registryConsentRevokedAt: Date | null,
    ) => ({
      holderDisplayName,
      registryListed: true,
      registryConsentAt,
      registryConsentRevokedAt,
      credential: {
        lifecycle: 'ACTIVE',
        expiresAt,
        issuedAt,
        publicUid: 'CON-2026-0001',
      },
      schemeVersion: { versionLabel: '1', scheme: { title: 'Digitalna kompetencija' } },
    });
    const client = {
      examPersonnelCredentialLink: {
        findMany: (args: { where?: Record<string, unknown> }) => {
          captured = args;
          return Promise.resolve([
            link('Demo Kandidat', issuedAt, null),
            link('Povučen Pristanak', issuedAt, new Date('2026-10-23T00:00:00.000Z')),
            link('Bez Pristanka', null, null),
          ]);
        },
      },
    };
    const rows = await searchPublicRegistry(client as never, {
      tenantId,
      name: 'Demo',
      now: issuedAt,
    });
    expect(captured?.where).toEqual(
      expect.objectContaining({
        tenantId,
        registryListed: true,
        registryConsentAt: { not: null },
        registryConsentRevokedAt: null,
      }),
    );
    expect(rows).toEqual([
      {
        holderName: 'Demo Kandidat',
        scheme: 'Digitalna kompetencija',
        schemeVersion: '1',
        status: 'VALID',
        issuedAt: issuedAt.toISOString(),
        listed: true,
      },
    ]);
    const body = JSON.stringify(rows);
    expect(body).not.toContain('CON-2026-0001');
    expect(body).not.toContain('Povučen Pristanak');
    expect(body).not.toContain('Bez Pristanka');
    expect(body).not.toContain(expiresAt.toISOString());
    expect(rows[0]).not.toHaveProperty('certificateNumber');
    expect(rows[0]).not.toHaveProperty('expiresAt');
  });
});
