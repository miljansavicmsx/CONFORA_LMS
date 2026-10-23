import type { AuthenticatedActor } from '../auth/request-principal';
import { PersonnelNotFoundError } from '../prisma/personnel-certificate-store';
import { PersonnelRuleError } from './personnel-rules';
import { PersonnelCertificateService } from './personnel.service';

const actor: AuthenticatedActor = {
  userId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  tenantId: '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a',
  issuer: 'https://issuer.test',
  subject: 'holder',
  email: 'holder@exam.test',
  roles: ['STAFF_SYSADM'],
  mfaVerified: true,
};

type Appended = {
  eventType: string;
  outcome: string;
  metadata: Record<string, string>;
};

function service(personnel: Record<string, unknown>) {
  const append = jest.fn().mockResolvedValue({ id: 'audit' });
  const executeInTransaction = jest.fn();
  const api = new PersonnelCertificateService(
    { personnel } as never,
    { append, executeInTransaction } as never,
  );
  const appended = (): Appended => {
    const calls = append.mock.calls as unknown as Array<[AuthenticatedActor, Appended]>;
    const row = calls[0]?.[1];
    if (!row) {
      throw new Error('refusal audit was not appended');
    }
    return row;
  };
  return { api, append, executeInTransaction, appended };
}

describe('directory consent refusal audit', () => {
  it('writes a holder refusal with append after the business call rejects', async () => {
    const verifyDirectoryConsent = jest
      .fn()
      .mockRejectedValue(new PersonnelRuleError('VERIFIER_IS_HOLDER'));
    const { api, append, executeInTransaction, appended } = service({ verifyDirectoryConsent });
    await expect(
      api.verifyDirectoryConsent(actor, 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', {
        verificationMethod: 'IN_PERSON_DOCUMENT_SIGHT',
        evidenceRef: 'RB02-EVIDENCE-001',
      }),
    ).rejects.toThrow();
    expect(executeInTransaction).not.toHaveBeenCalled();
    expect(append).toHaveBeenCalledTimes(1);
    const row = appended();
    expect(row.eventType).toBe('DIRECTORY_CONSENT_VERIFIED');
    expect(row.outcome).toBe('DENIED');
    expect(row.metadata['result']).toBe('VERIFIER_IS_HOLDER');
    expect(row.metadata['procedure']).toBe('RB-02');
    expect(row.metadata['procedureSection']).toBe('Identity check');
    expect(row.metadata['procedureRef']).toBe(
      'docs/operations/RB-02-consent-withdrawal.md#identity-check',
    );
    expect(row.metadata['verifierUserId']).toBe(actor.userId);
    expect(row.metadata['evidenceRef']).toBe('RB02-EVIDENCE-001');
  });

  it('writes not-found for another organization without a success audit', async () => {
    const withdrawDirectoryConsent = jest.fn().mockRejectedValue(new PersonnelNotFoundError());
    const { api, executeInTransaction, appended } = service({ withdrawDirectoryConsent });
    await expect(
      api.withdrawDirectoryConsent(actor, 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
    ).rejects.toThrow();
    expect(executeInTransaction).not.toHaveBeenCalled();
    const row = appended();
    expect(row.outcome).toBe('DENIED');
    expect(row.eventType).toBe('DIRECTORY_CONSENT_WITHDRAWN');
    expect(row.metadata['result']).toBe('NOT_FOUND');
    expect(row.metadata['procedureSection']).toBe('Execution');
    const metadata = row.metadata;
    expect(JSON.stringify(metadata)).not.toContain('Demo');
    expect(metadata).not.toHaveProperty('holderDisplayName');
  });
});
