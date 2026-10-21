import { createPublicKey, generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  assertSigningKeyAllowed,
  BURNED_VC_SPKI_SHA256,
  issueDownloadTicket,
  signPersonnelCredential,
  verifyDownloadTicket,
  verifyPersonnelCredential,
  wasSignedWithBurnedKey,
} from './personnel-vc';

const claims = {
  certificateNumber: 'CON-2026-0001',
  holderName: 'Demo Kandidat',
  scheme: 'Digitalna kompetencija',
  schemeVersion: '1',
  issuedAt: '2026-10-20T00:00:00.000Z',
  expiresAt: '2029-10-20T00:00:00.000Z',
  statusListIndex: 3,
  statusListUrl: 'http://127.0.0.1:4000/v1/public/certificates/status-list',
};

describe('personnel credential signing key', () => {
  const priorNodeEnv = process.env['NODE_ENV'];
  const priorKey = process.env['PERSONNEL_VC_ED25519_PKCS8_PEM'];
  const priorTicket = process.env['PERSONNEL_PDF_TICKET_SECRET'];

  afterEach(() => {
    if (priorNodeEnv === undefined) {
      delete process.env['NODE_ENV'];
    } else {
      process.env['NODE_ENV'] = priorNodeEnv;
    }
    if (priorKey === undefined) {
      delete process.env['PERSONNEL_VC_ED25519_PKCS8_PEM'];
    } else {
      process.env['PERSONNEL_VC_ED25519_PKCS8_PEM'] = priorKey;
    }
    if (priorTicket === undefined) {
      delete process.env['PERSONNEL_PDF_TICKET_SECRET'];
    } else {
      process.env['PERSONNEL_PDF_TICKET_SECRET'] = priorTicket;
    }
  });

  it('does not keep the burned private key in source', () => {
    const source = readFileSync(join(__dirname, 'personnel-vc.ts'), 'utf8');
    expect(source).not.toContain('BEGIN PRIVATE KEY');
    expect(source).not.toContain('MC4CAQAw');
    expect(source).toContain(BURNED_VC_SPKI_SHA256);
  });

  it('refuses the burned public key and accepts a new test key', () => {
    const burned = createPublicKey({
      key: Buffer.from('MCowBQYDK2VwAyEA2LHAnDEy09zHGh3/YmfgWgJK7BqPM3tzz29XPFuGOfQ=', 'base64'),
      format: 'der',
      type: 'spki',
    });
    expect(() => {
      assertSigningKeyAllowed(burned);
    }).toThrow('VC_KEY_DENIED');
    const generated = generateKeyPairSync('ed25519').privateKey;
    expect(() => {
      assertSigningKeyAllowed(generated);
    }).not.toThrow();
  });

  it('signs with an ephemeral test key and does not match the burned key', () => {
    delete process.env['PERSONNEL_VC_ED25519_PKCS8_PEM'];
    process.env['NODE_ENV'] = 'test';
    const signed = signPersonnelCredential(claims);
    expect(verifyPersonnelCredential(signed.jwt)['sub']).toBe('CON-2026-0001');
    expect(wasSignedWithBurnedKey(signed.jwt)).toBe(false);
  });

  it('refuses to sign outside tests when the key is unset', () => {
    delete process.env['PERSONNEL_VC_ED25519_PKCS8_PEM'];
    process.env['NODE_ENV'] = 'production';
    expect(() => {
      signPersonnelCredential(claims);
    }).toThrow('VC_KEY_UNCONFIGURED');
  });

  it('uses a separate secret for PDF download tickets', () => {
    process.env['NODE_ENV'] = 'test';
    delete process.env['PERSONNEL_PDF_TICKET_SECRET'];
    const now = new Date('2026-10-21T00:00:00.000Z');
    const ticket = issueDownloadTicket('CON-2026-0001', now);
    expect(verifyDownloadTicket('CON-2026-0001', ticket, now)).toBe(true);
    process.env['PERSONNEL_PDF_TICKET_SECRET'] = 'pdf-ticket-secret-not-the-signing-key';
    expect(verifyDownloadTicket('CON-2026-0001', ticket, now)).toBe(false);
    const rebound = issueDownloadTicket('CON-2026-0001', now);
    expect(verifyDownloadTicket('CON-2026-0001', rebound, now)).toBe(true);
    process.env['NODE_ENV'] = 'production';
    delete process.env['PERSONNEL_PDF_TICKET_SECRET'];
    expect(() => {
      issueDownloadTicket('CON-2026-0001', now);
    }).toThrow('PDF_TICKET_SECRET_UNCONFIGURED');
  });

  it('scopes a public name search to the tenant and requires three characters', () => {
    const source = readFileSync(
      join(__dirname, '../prisma/personnel-certificate-store.ts'),
      'utf8',
    );
    const search = source.slice(
      source.indexOf('export async function searchPublicRegistry'),
      source.indexOf('export async function revocationStatusList'),
    );
    expect(search).toContain('tenantId: input.tenantId');
    expect(search).toContain('name.length < 3');
    expect(source).toContain('identityVerificationState');
    expect(source).not.toContain('holderName: input.holderDisplayName');
  });
});
