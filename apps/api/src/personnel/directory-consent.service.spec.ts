import { BadRequestException, HttpException, Logger } from '@nestjs/common';

import type { AuthenticatedActor } from '../auth/request-principal';
import { PersonnelNotFoundError } from '../prisma/personnel-certificate-store';
import { AccessDeniedError } from '../tenant/tenant-errors';
import {
  DIRECTORY_CONSENT_UNAUTHORIZED_LIMIT,
  PersonnelRuleError,
  resetDirectoryConsentRefusalDedup,
  resetPublicRateLimit,
} from './personnel-rules';
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
  occurredAt: Date;
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
    resetPublicRateLimit();
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
    expect(row.metadata['action']).toBe('DIRECTORY_CONSENT_VERIFY');
    expect(row.metadata['verifierUserId']).toBe(actor.userId);
    expect(row.occurredAt).toBeInstanceOf(Date);
    expect(row.metadata).not.toHaveProperty('evidenceRef');
    expect(JSON.stringify(row.metadata)).not.toContain('RB02-EVIDENCE-001');
  });

  it('omits the evidence reference when allowed staff verify and no request exists', async () => {
    const verifyDirectoryConsent = jest
      .fn()
      .mockRejectedValue(new PersonnelRuleError('NOT_REQUESTED'));
    const director: AuthenticatedActor = {
      ...actor,
      userId: '18181818-1818-4181-8181-181818181818',
      roles: ['STAFF_DIR'],
      email: 'exam-director@demo.confora.test',
    };
    const { api, append, executeInTransaction, appended } = service({ verifyDirectoryConsent });
    await expect(
      api.verifyDirectoryConsent(director, credentialId, {
        ...verification,
        evidenceRef: 'RB02-STAFF-NOT-REQUESTED',
      }),
    ).rejects.toThrow('NOT_REQUESTED');
    expect(executeInTransaction).not.toHaveBeenCalled();
    expect(append).toHaveBeenCalledTimes(1);
    const calls = append.mock.calls as unknown as Array<[AuthenticatedActor, Appended]>;
    expect(calls[0]?.[0].userId).toBe(director.userId);
    const row = appended();
    expect(row.eventType).toBe('DIRECTORY_CONSENT_VERIFIED');
    expect(row.outcome).toBe('DENIED');
    expect(row.occurredAt).toBeInstanceOf(Date);
    expect(row.metadata['action']).toBe('DIRECTORY_CONSENT_VERIFY');
    expect(row.metadata['result']).toBe('NOT_REQUESTED');
    expect(row.metadata['procedure']).toBe('RB-02');
    expect(row.metadata['procedureSection']).toBe('Identity check');
    expect(row.metadata['procedureRef']).toBe(
      'docs/operations/RB-02-consent-withdrawal.md#identity-check',
    );
    expect(row.metadata).not.toHaveProperty('evidenceRef');
    expect(JSON.stringify(row.metadata)).not.toContain('RB02-STAFF-NOT-REQUESTED');
  });

  it('omits the evidence reference when a request is refused', async () => {
    const openDirectoryConsentRequest = jest
      .fn()
      .mockRejectedValue(new PersonnelRuleError('HOLDER_MISMATCH'));
    const { api, executeInTransaction, appended } = service({ openDirectoryConsentRequest });
    await expect(
      api.openDirectoryConsentRequest(actor, credentialId, {
        holderUserId: '1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c',
        channel: 'EMAIL',
        receivedAt: '2026-10-23T12:00:00.000Z',
      }),
    ).rejects.toThrow('HOLDER_MISMATCH');
    expect(executeInTransaction).not.toHaveBeenCalled();
    const row = appended();
    expect(row.eventType).toBe('DIRECTORY_CONSENT_WITHDRAWAL_REQUESTED');
    expect(row.outcome).toBe('DENIED');
    expect(row.occurredAt).toBeInstanceOf(Date);
    expect(row.metadata['action']).toBe('DIRECTORY_CONSENT_REQUEST');
    expect(row.metadata['result']).toBe('HOLDER_MISMATCH');
    expect(row.metadata['procedure']).toBe('RB-02');
    expect(row.metadata['procedureSection']).toBe('Request');
    expect(row.metadata).not.toHaveProperty('evidenceRef');
  });

  it('omits the evidence reference when the executor is the verifier', async () => {
    const withdrawDirectoryConsent = jest
      .fn()
      .mockRejectedValue(new PersonnelRuleError('FOUR_EYES'));
    const { api, append, executeInTransaction, appended } = service({ withdrawDirectoryConsent });
    await expect(api.withdrawDirectoryConsent(actor, credentialId)).rejects.toThrow();
    expect(executeInTransaction).not.toHaveBeenCalled();
    const calls = append.mock.calls as unknown as Array<[AuthenticatedActor, Appended]>;
    expect(calls[0]?.[0].userId).toBe(actor.userId);
    const row = appended();
    expect(row.eventType).toBe('DIRECTORY_CONSENT_WITHDRAWN');
    expect(row.outcome).toBe('DENIED');
    expect(row.occurredAt).toBeInstanceOf(Date);
    expect(row.metadata['action']).toBe('DIRECTORY_CONSENT_WITHDRAW');
    expect(row.metadata['result']).toBe('FOUR_EYES');
    expect(row.metadata['executorUserId']).toBe(actor.userId);
    expect(row.metadata['procedure']).toBe('RB-02');
    expect(row.metadata['procedureSection']).toBe('Execution');
    expect(row.metadata['procedureRef']).toBe(
      'docs/operations/RB-02-consent-withdrawal.md#execution',
    );
    expect(row.metadata).not.toHaveProperty('evidenceRef');
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
    expect(row.metadata['action']).toBe('DIRECTORY_CONSENT_WITHDRAW');
    expect(row.metadata['procedureSection']).toBe('Execution');
    expect(row.metadata).not.toHaveProperty('evidenceRef');
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
    for (let attempt = 2; attempt < DIRECTORY_CONSENT_UNAUTHORIZED_LIMIT; attempt += 1) {
      await expect(
        api.verifyDirectoryConsent(candidate, credentialId, {
          ...verification,
          evidenceRef: 'RB02-NONSTAFF-REPEAT',
        }),
      ).rejects.toBeInstanceOf(AccessDeniedError);
    }
    const limitedExisting = api.verifyDirectoryConsent(candidate, credentialId, verification);
    const limitedMissing = api.verifyDirectoryConsent(candidate, missingId, verification);
    await expect(limitedExisting).rejects.toBeInstanceOf(HttpException);
    await expect(limitedMissing).rejects.toBeInstanceOf(HttpException);
    await expect(limitedExisting).rejects.toMatchObject({ status: 429 });
    await expect(limitedMissing).rejects.toMatchObject({ status: 429 });
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
