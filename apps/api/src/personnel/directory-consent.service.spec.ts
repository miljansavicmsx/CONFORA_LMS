import { BadRequestException, Logger } from '@nestjs/common';

import type { AuthenticatedActor } from '../auth/request-principal';
import { PersonnelNotFoundError } from '../prisma/personnel-certificate-store';
import { AccessDeniedError } from '../tenant/tenant-errors';
import { PersonnelRuleError, resetDirectoryConsentRefusalDedup } from './personnel-rules';
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
  const credentialId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  const verification = {
    verificationMethod: 'IN_PERSON_DOCUMENT_SIGHT' as const,
    evidenceRef: 'RB02-EVIDENCE-001',
  };

  beforeEach(() => {
    resetDirectoryConsentRefusalDedup();
  });

  it('writes a holder refusal with append after the business call rejects', async () => {
    const verifyDirectoryConsent = jest
      .fn()
      .mockRejectedValue(new PersonnelRuleError('VERIFIER_IS_HOLDER'));
    const { api, append, executeInTransaction, appended } = service({ verifyDirectoryConsent });
    await expect(api.verifyDirectoryConsent(actor, credentialId, verification)).rejects.toThrow();
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

  it('refuses a non-staff caller before reading the certificate and deduplicates the audit', async () => {
    const verifyDirectoryConsent = jest.fn();
    const candidate: AuthenticatedActor = { ...actor, roles: ['USR_CAND'] };
    const missingId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const { api, append, executeInTransaction } = service({ verifyDirectoryConsent });
    const first = api.verifyDirectoryConsent(candidate, credentialId, {
      ...verification,
      evidenceRef: 'RB02-NONSTAFF-PROBE',
    });
    const second = api.verifyDirectoryConsent(candidate, missingId, {
      ...verification,
      evidenceRef: 'RB02-NONSTAFF-PROBE',
    });
    await expect(first).rejects.toBeInstanceOf(AccessDeniedError);
    await expect(second).rejects.toBeInstanceOf(AccessDeniedError);
    expect(verifyDirectoryConsent).not.toHaveBeenCalled();
    expect(executeInTransaction).not.toHaveBeenCalled();
    expect(append).toHaveBeenCalledTimes(2);
    const calls = append.mock.calls as unknown as Array<[AuthenticatedActor, Appended]>;
    for (const [, row] of calls) {
      expect(row.eventType).toBe('DIRECTORY_CONSENT_VERIFIED');
      expect(row.outcome).toBe('DENIED');
      expect(row.metadata['action']).toBe('DIRECTORY_CONSENT_VERIFY');
      expect(row.metadata['result']).toBe('VERIFIER_NOT_STAFF');
      expect(row.metadata).not.toHaveProperty('evidenceRef');
      expect(JSON.stringify(row.metadata)).not.toContain('RB02-NONSTAFF-PROBE');
    }
    expect(calls[0]?.[0].userId).toBe(candidate.userId);
    expect(calls[0]?.[1].metadata).not.toEqual(calls[1]?.[1].metadata);
    await expect(
      api.verifyDirectoryConsent(candidate, credentialId, {
        ...verification,
        evidenceRef: 'RB02-NONSTAFF-REPEAT',
      }),
    ).rejects.toBeInstanceOf(AccessDeniedError);
    await expect(
      api.verifyDirectoryConsent(candidate, missingId, verification),
    ).rejects.toBeInstanceOf(AccessDeniedError);
    expect(append).toHaveBeenCalledTimes(2);
    expect(verifyDirectoryConsent).not.toHaveBeenCalled();
  });

  it('returns the original refusal when the refusal audit cannot be written', async () => {
    const verifyDirectoryConsent = jest
      .fn()
      .mockRejectedValue(new PersonnelRuleError('VERIFIER_IS_HOLDER'));
    const append = jest.fn().mockRejectedValue(new Error('audit store unavailable'));
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const api = new PersonnelCertificateService(
      { personnel: { verifyDirectoryConsent } } as never,
      { append, executeInTransaction: jest.fn() } as never,
    );
    const attempt = api.verifyDirectoryConsent(actor, credentialId, verification);
    await expect(attempt).rejects.toBeInstanceOf(BadRequestException);
    await expect(attempt).rejects.toThrow('VERIFIER_IS_HOLDER');
    await expect(attempt).rejects.not.toThrow('audit store unavailable');
    expect(String(warn.mock.calls[0]?.[0])).toContain('result=VERIFIER_IS_HOLDER');
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('RB02-EVIDENCE-001');
    expect(String(warn.mock.calls[0]?.[0])).not.toContain(actor.email);
    warn.mockRestore();
  });
});
