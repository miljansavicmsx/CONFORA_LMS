import { inflateSync } from 'node:zlib';

import { encodedStatusList, statusListBits } from './personnel-status-list';
import {
  addYears,
  assertConsentRequestReceivedAt,
  assertDirectoryConsentAdministrator,
  assertDirectoryConsentFourEyes,
  assertDirectoryConsentVerifier,
  assertIssuer,
  assertPublicRateLimit,
  assertStatusTransition,
  claimDirectoryConsentRefusalWrite,
  directoryConsentActive,
  HIDDEN_PERSONNEL_VERIFICATION,
  PERSONNEL_VALIDITY_YEARS,
  presentPersonnelPublicVerification,
  publicCertificateStatus,
  releaseDirectoryConsentRefusalWrite,
  resetDirectoryConsentRefusalDedup,
  resetPublicRateLimit,
} from './personnel-rules';
import { signPersonnelCredential, verifyPersonnelCredential } from './personnel-vc';

describe('personnel certificate rules', () => {
  it('keeps a certificate valid for three years and maps ACTIVE to VALID', () => {
    const issued = new Date('2026-10-20T00:00:00.000Z');
    const expires = addYears(issued, PERSONNEL_VALIDITY_YEARS);
    expect(expires.toISOString()).toBe('2029-10-20T00:00:00.000Z');
    expect(publicCertificateStatus('ACTIVE', expires, issued)).toBe('VALID');
    expect(publicCertificateStatus('ACTIVE', expires, expires)).toBe('EXPIRED');
    expect(publicCertificateStatus('SUSPENDED', expires, issued)).toBe('SUSPENDED');
    expect(publicCertificateStatus('WITHDRAWN', expires, issued)).toBe('WITHDRAWN');
  });

  it('allows only human status transitions and keeps system administrators out', () => {
    expect(() => {
      assertStatusTransition('ACTIVE', 'SUSPENDED');
    }).not.toThrow();
    expect(() => {
      assertStatusTransition('WITHDRAWN', 'ACTIVE');
    }).toThrow('STATUS_TRANSITION');
    expect(() => {
      assertIssuer({
        roles: ['STAFF_SYSADM'],
        issuerUserId: 'admin',
        holderUserId: 'candidate',
        trainerOfCandidate: false,
      });
    }).toThrow('ROLE_SEPARATION');
    expect(() => {
      assertIssuer({
        roles: ['COM_CERT'],
        issuerUserId: 'trainer',
        holderUserId: 'candidate',
        trainerOfCandidate: true,
      });
    }).toThrow('TRAINER_CANNOT_ISSUE');
    expect(() => {
      assertIssuer({
        roles: ['COM_CERT'],
        issuerUserId: 'decider',
        holderUserId: 'candidate',
        trainerOfCandidate: false,
        decisionParticipantIds: ['decider'],
      });
    }).toThrow('FOUR_EYES');
  });

  it('signs an Open Badge and sets a revocation bit', () => {
    const signed = signPersonnelCredential({
      certificateNumber: 'CON-2026-0001',
      holderName: 'Demo Kandidat',
      scheme: 'Digitalna kompetencija',
      schemeVersion: '1',
      issuedAt: '2026-10-20T00:00:00.000Z',
      expiresAt: '2029-10-20T00:00:00.000Z',
      statusListIndex: 3,
      statusListUrl: 'http://127.0.0.1:4000/v1/public/certificates/status-list',
    });
    const body = verifyPersonnelCredential(signed.jwt);
    expect(body['sub']).toBe('CON-2026-0001');
    const bits = inflateSync(Buffer.from(encodedStatusList([3]), 'base64url'));
    expect(statusListBits([3]).equals(bits)).toBe(true);
    expect((bits[0] ?? 0) & (1 << 3)).toBeGreaterThan(0);
  });

  it('rate limits public lookups in this process only', () => {
    resetPublicRateLimit();
    expect(() => {
      assertPublicRateLimit('127.0.0.1', 1_000, 2, 60_000);
      assertPublicRateLimit('127.0.0.1', 1_100, 2, 60_000);
    }).not.toThrow();
    expect(() => {
      assertPublicRateLimit('127.0.0.1', 1_200, 2, 60_000);
    }).toThrow('RATE_LIMIT');
  });

  it('shows the holder name only while registry consent is active', () => {
    const issuedAt = new Date('2026-10-21T12:00:00.000Z');
    const active = {
      registryListed: true,
      registryConsentAt: issuedAt,
      registryConsentRevokedAt: null,
    };
    expect(directoryConsentActive(active)).toBe(true);
    const shown = presentPersonnelPublicVerification({
      status: 'VALID',
      issuedAt,
      ...active,
      holderName: 'Demo Kandidat',
    });
    expect(shown).toEqual({
      status: 'VALID',
      documentType: 'PERSONNEL_CERTIFICATE',
      issuedAt: '2026-10-21',
      holderName: 'Demo Kandidat',
    });
    const withdrawn = {
      registryListed: true,
      registryConsentAt: issuedAt,
      registryConsentRevokedAt: new Date('2026-10-23T00:00:00.000Z'),
    };
    expect(directoryConsentActive(withdrawn)).toBe(false);
    expect(
      presentPersonnelPublicVerification({
        status: 'VALID',
        issuedAt,
        ...withdrawn,
        holderName: 'Demo Kandidat',
      }).holderName,
    ).toBeNull();
    const missing = {
      registryListed: true,
      registryConsentAt: null,
      registryConsentRevokedAt: null,
    };
    expect(directoryConsentActive(missing)).toBe(false);
    const hidden = presentPersonnelPublicVerification({
      status: 'VALID',
      issuedAt,
      registryListed: false,
      registryConsentAt: null,
      registryConsentRevokedAt: null,
      holderName: 'Demo Kandidat',
    });
    expect(hidden.holderName).toBeNull();
    expect(hidden.status).toBe('VALID');
    expect(HIDDEN_PERSONNEL_VERIFICATION).toEqual({
      status: 'INVALID',
      documentType: null,
      issuedAt: null,
      holderName: null,
    });
  });

  it('lets only the existing system administrator execute a directory withdrawal', () => {
    expect(() => {
      assertDirectoryConsentAdministrator(['STAFF_SYSADM']);
    }).not.toThrow();
    for (const role of [
      'STAFF_DIR',
      'STAFF_ROLEADM',
      'COM_CERT',
      'QUALITY_MANAGER',
      'LIFECYCLE_OFFICER',
      'ISSUANCE_OFFICER',
      'USR_CAND',
      'USR_CERT',
    ]) {
      expect(() => {
        assertDirectoryConsentAdministrator([role]);
      }).toThrow('ROLE_SEPARATION');
    }
    const now = new Date('2026-10-23T12:00:00.000Z');
    expect(() => {
      assertConsentRequestReceivedAt(new Date('2026-10-23T11:00:00.000Z'), now);
    }).not.toThrow();
    expect(() => {
      assertConsentRequestReceivedAt(new Date('2026-10-23T12:30:00.000Z'), now);
    }).toThrow('RECEIVED_AT');
  });

  it('requires a different staff verifier from the holder and the executor', () => {
    expect(
      assertDirectoryConsentVerifier({
        verifierUserId: 'director',
        holderUserId: 'holder',
        roles: ['STAFF_DIR'],
      }),
    ).toBe('STAFF_DIR');
    expect(() => {
      assertDirectoryConsentVerifier({
        verifierUserId: 'holder',
        holderUserId: 'holder',
        roles: ['STAFF_SYSADM'],
      });
    }).toThrow('VERIFIER_IS_HOLDER');
    expect(() => {
      assertDirectoryConsentVerifier({
        verifierUserId: 'candidate',
        holderUserId: 'holder',
        roles: ['USR_CAND'],
      });
    }).toThrow('VERIFIER_NOT_STAFF');
    expect(
      assertDirectoryConsentVerifier({
        verifierUserId: 'role-admin',
        holderUserId: 'holder',
        roles: ['STAFF_ROLEADM'],
      }),
    ).toBe('STAFF_ROLEADM');
    expect(
      assertDirectoryConsentVerifier({
        verifierUserId: 'sysadmin-a',
        holderUserId: 'holder',
        roles: ['STAFF_SYSADM'],
      }),
    ).toBe('STAFF_SYSADM');
    for (const role of ['STAFF_TRAINADM', 'STAFF_AUD', 'USR_CAND', 'USR_CERT', 'QUALITY_MANAGER']) {
      expect(() => {
        assertDirectoryConsentVerifier({
          verifierUserId: 'caller',
          holderUserId: 'holder',
          roles: [role],
        });
      }).toThrow('VERIFIER_NOT_STAFF');
    }
    expect(() => {
      assertDirectoryConsentFourEyes('admin', 'admin');
    }).toThrow('FOUR_EYES');
    expect(() => {
      assertDirectoryConsentFourEyes('admin', 'director');
    }).not.toThrow();
    expect(() => {
      assertDirectoryConsentFourEyes('sysadmin-a', 'sysadmin-b');
    }).not.toThrow();
  });

  it('deduplicates a repeated directory-consent refusal write', () => {
    resetDirectoryConsentRefusalDedup();
    const key = 'tenant:user:credential:DIRECTORY_CONSENT_VERIFY:VERIFIER_NOT_STAFF';
    expect(claimDirectoryConsentRefusalWrite(key, 1_000)).toBe(true);
    expect(claimDirectoryConsentRefusalWrite(key, 1_500)).toBe(false);
    releaseDirectoryConsentRefusalWrite(key);
    expect(claimDirectoryConsentRefusalWrite(key, 1_600)).toBe(true);
    resetDirectoryConsentRefusalDedup();
  });
});
