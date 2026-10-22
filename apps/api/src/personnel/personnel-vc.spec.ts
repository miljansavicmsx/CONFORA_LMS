import { execFileSync } from 'node:child_process';
import { createHash, createPublicKey, generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { statusListCredential } from './personnel-status-list';
import {
  assertSigningKeyAllowed,
  BURNED_VC_SPKI_SHA256,
  importVerificationJwk,
  importVerificationSpki,
  issueDownloadTicket,
  publicJwk,
  publishStatusList,
  signPersonnelCredential,
  verifyDownloadTicket,
  verifyPersonnelCredential,
  verifyPublishedStatusList,
  verifyStatusList,
  wasSignedWithBurnedKey,
} from './personnel-vc';

const BURNED_VC_JWT =
  'eyJhbGciOiJFZERTQSIsInR5cCI6InZjK2p3dCIsImtpZCI6ImNvbmZvcmEtcGVyc29ubmVsLWVkMjU1MTkifQ.eyJpc3MiOiJodHRwczovL2NvbmZvcmEuZXhhbXBsZS9pc3N1ZXJzL2RldmVsb3BtZW50Iiwic3ViIjoiQ09OLUJVUk5FRCIsInZjIjp7InR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXX19.UQt501t-z1MraLh8v3vA16qytoYetfCJTBdtK7z3nkUYNjRwvIa8j_ZtsUzyhjoHawjJcIFFRgLqUvfESzKOBw';

const BURNED_PDF_TICKET = '1792541100000.WgM83b6ZosXwQh6LstrOfu4tKMo9NxrQf06XR5ie3LY';

const BURNED_PUBLIC_SPKI = Buffer.from(
  'MCowBQYDK2VwAyEA2LHAnDEy09zHGh3/YmfgWgJK7BqPM3tzz29XPFuGOfQ=',
  'base64',
);

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
      key: BURNED_PUBLIC_SPKI,
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
    expect(search).not.toContain('input.number');
    expect(search).not.toContain('publicUid: input.number');
    expect(source).toContain('identityVerificationState');
    expect(source).not.toContain('holderName: input.holderDisplayName');
    expect(source).toContain('publishStatusList(statusListCredential');
  });

  it('rejects the burned key on every active verification path', () => {
    delete process.env['PERSONNEL_VC_ED25519_PKCS8_PEM'];
    delete process.env['PERSONNEL_PDF_TICKET_SECRET'];
    process.env['NODE_ENV'] = 'test';

    expect(wasSignedWithBurnedKey(BURNED_VC_JWT)).toBe(true);
    expect(() => {
      verifyPersonnelCredential(BURNED_VC_JWT);
    }).toThrow('VC_KEY_DENIED');
    expect(() => {
      verifyStatusList(BURNED_VC_JWT);
    }).toThrow('VC_KEY_DENIED');
    expect(() => {
      importVerificationSpki(BURNED_PUBLIC_SPKI);
    }).toThrow('VC_KEY_DENIED');
    const burnedJwk = createPublicKey({
      key: BURNED_PUBLIC_SPKI,
      format: 'der',
      type: 'spki',
    }).export({ format: 'jwk' }) as Record<string, unknown>;
    expect(() => {
      importVerificationJwk(burnedJwk);
    }).toThrow('VC_KEY_DENIED');

    const credential = statusListCredential(
      'eA',
      'http://127.0.0.1:4000/v1/public/certificates/status-list',
    );
    const published = publishStatusList(credential);
    expect(verifyPublishedStatusList(published)['type']).toEqual([
      'VerifiableCredential',
      'BitstringStatusListCredential',
    ]);
    expect(() => {
      verifyPublishedStatusList({
        ...published,
        proof: { type: 'Ed25519Signature2020', jwt: BURNED_VC_JWT },
      });
    }).toThrow('VC_KEY_DENIED');

    const jwk = publicJwk();
    const imported = importVerificationJwk(jwk);
    const fingerprint = createHash('sha256')
      .update(imported.export({ type: 'spki', format: 'der' }))
      .digest('hex');
    expect(fingerprint).not.toBe(BURNED_VC_SPKI_SHA256);
    expect(jwk['x']).not.toBe(burnedJwk['x']);

    const now = new Date('2026-10-21T00:00:00.000Z');
    const exp = Number(BURNED_PDF_TICKET.split('.')[0]);
    expect(exp).toBeGreaterThan(now.getTime());
    expect(verifyDownloadTicket('CON-2026-0001', BURNED_PDF_TICKET, now)).toBe(false);
    process.env['PERSONNEL_PDF_TICKET_SECRET'] = 'pdf-ticket-secret-not-the-signing-key';
    expect(verifyDownloadTicket('CON-2026-0001', BURNED_PDF_TICKET, now)).toBe(false);
  });

  it('publishes the verification key on the public JWKS route and scans the tree', () => {
    const controller = readFileSync(join(__dirname, 'personnel.controller.ts'), 'utf8');
    const statusAt = controller.indexOf("@Get('status-list')");
    const jwksAt = controller.indexOf("@Get('jwks')");
    const oneAt = controller.indexOf("@Get(':publicUid')");
    expect(jwksAt).toBeGreaterThan(statusAt);
    expect(oneAt).toBeGreaterThan(jwksAt);
    const service = readFileSync(join(__dirname, 'personnel.service.ts'), 'utf8');
    expect(service).toContain('importVerificationJwk(jwk)');
    const root = join(__dirname, '../../../..');
    const incident = readFileSync(
      join(root, 'docs/security/INCIDENT-2026-10-21-VC-KEY.md'),
      'utf8',
    );
    expect(incident).toContain('remains in git history');
    expect(incident).toContain('permanently burned');
    expect(incident).toContain('not rewritten');
    const inventory = readFileSync(
      join(__dirname, '../../test/production-route-inventory.ts'),
      'utf8',
    );
    const statusRoute = inventory.indexOf("'GET /v1/public/certificates/status-list'");
    const jwksRoute = inventory.indexOf("'GET /v1/public/certificates/jwks'");
    const listRoute = inventory.indexOf("'GET /v1/public/certificates'");
    expect(jwksRoute).toBeGreaterThan(statusRoute);
    expect(listRoute).toBeGreaterThan(jwksRoute);
    execFileSync(process.execPath, ['scripts/ci/scan-burned-vc-key.mjs'], {
      cwd: root,
      stdio: 'pipe',
    });
  });
});
