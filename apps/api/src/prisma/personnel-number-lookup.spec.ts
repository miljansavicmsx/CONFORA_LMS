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
});
