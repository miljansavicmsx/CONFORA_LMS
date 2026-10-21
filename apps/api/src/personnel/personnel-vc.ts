import {
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomBytes,
  sign,
  timingSafeEqual,
  verify,
  type KeyObject,
} from 'node:crypto';

/**
 * The Ed25519 private key that used to live in this file is compromised.
 * Only its public SPKI fingerprint is retained, so a configuration that
 * presents that key is refused. See docs/security/INCIDENT-2026-10-21-VC-KEY.md.
 */
export const BURNED_VC_SPKI_SHA256 =
  'd2670e69c07fdf187aed6ebefc513bb4ca582cd1a5d2fcc50ff1f441c50b3b76';

const BURNED_VC_PUBLIC_SPKI = Buffer.from(
  'MCowBQYDK2VwAyEA2LHAnDEy09zHGh3/YmfgWgJK7BqPM3tzz29XPFuGOfQ=',
  'base64',
);

/** SHA-256 of the burned private PEM and of its raw PKCS8 body. The secret bytes are not stored. */
const BURNED_SECRET_SHA256 = new Set([
  '2a4eaf859abddd4661d35638db9d76c10886fb9a9491551fb07694c187ca1156',
  'fbc68ca291c2b57d1a67327b22afba6bcf107e014e58d46358c95f92e9bfb9ff',
  'cdbb9295635ec5ca2e0827b3a83631df04671b8fdf6d0fe67b5f4a3195582d9a',
]);

export const VC_KEY_ID = 'confora-personnel-ed25519';

export type PersonnelVcClaims = {
  certificateNumber: string;
  holderName: string;
  scheme: string;
  schemeVersion: string;
  issuedAt: string;
  expiresAt: string;
  statusListIndex: number;
  statusListUrl: string;
};

function spkiSha256(key: KeyObject): string {
  const publicKey = key.type === 'public' ? key : createPublicKey(key);
  const der = publicKey.export({ type: 'spki', format: 'der' });
  return createHash('sha256').update(der).digest('hex');
}

export function assertSigningKeyAllowed(key: KeyObject): void {
  if (spkiSha256(key) === BURNED_VC_SPKI_SHA256) {
    throw new Error('VC_KEY_DENIED');
  }
}

function secretIsBurned(value: string): boolean {
  const digest = createHash('sha256').update(value).digest('hex');
  return BURNED_SECRET_SHA256.has(digest);
}

let ephemeralTestKey: KeyObject | undefined;
let ephemeralTicketSecret: string | undefined;

function testRuntime(): boolean {
  return process.env['NODE_ENV'] === 'test';
}

function privateKey(): KeyObject {
  const pem = process.env['PERSONNEL_VC_ED25519_PKCS8_PEM']?.trim() ?? '';
  if (pem.length === 0) {
    if (!testRuntime()) {
      throw new Error('VC_KEY_UNCONFIGURED');
    }
    ephemeralTestKey ??= generateKeyPairSync('ed25519').privateKey;
    return ephemeralTestKey;
  }
  if (secretIsBurned(pem) || secretIsBurned(`${pem}\n`)) {
    throw new Error('VC_KEY_DENIED');
  }
  const key = createPrivateKey(pem);
  assertSigningKeyAllowed(key);
  return key;
}

export function signingTrust(): 'CONFIGURED' | 'TEST' {
  const pem = process.env['PERSONNEL_VC_ED25519_PKCS8_PEM']?.trim() ?? '';
  if (pem.length > 0) {
    return 'CONFIGURED';
  }
  if (!testRuntime()) {
    throw new Error('VC_KEY_UNCONFIGURED');
  }
  return 'TEST';
}

export function publicJwk(): Record<string, unknown> {
  const jwk = createPublicKey(privateKey()).export({ format: 'jwk' }) as Record<string, unknown>;
  return { ...jwk, kid: VC_KEY_ID, alg: 'EdDSA' };
}

export function importVerificationJwk(jwk: Record<string, unknown>): KeyObject {
  const kty = jwk['kty'];
  const crv = jwk['crv'];
  const x = jwk['x'];
  if (kty !== 'OKP' || crv !== 'Ed25519' || typeof x !== 'string' || x.length === 0) {
    throw new Error('VC_MALFORMED');
  }
  const key = createPublicKey({
    key: { kty, crv, x },
    format: 'jwk',
  });
  assertSigningKeyAllowed(key);
  return key;
}

export function importVerificationSpki(der: Buffer): KeyObject {
  const key = createPublicKey({ key: der, format: 'der', type: 'spki' });
  assertSigningKeyAllowed(key);
  return key;
}

function b64url(value: Buffer | string): string {
  const buffer = typeof value === 'string' ? Buffer.from(value) : value;
  return buffer.toString('base64url');
}

export function credentialPayload(claims: PersonnelVcClaims): Record<string, unknown> {
  return {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
    ],
    type: ['VerifiableCredential', 'OpenBadgeCredential'],
    issuer: {
      id: 'https://confora.example/issuers/development',
      name: 'CONFORA',
      trust: signingTrust(),
    },
    validFrom: claims.issuedAt,
    validUntil: claims.expiresAt,
    credentialSubject: {
      type: ['AchievementSubject'],
      name: claims.holderName,
      achievement: {
        type: ['Achievement'],
        name: claims.scheme,
        description: `Certifikat osoblja, verzija šeme ${claims.schemeVersion}.`,
        achievementType: 'PersonnelCertification',
      },
    },
    credentialStatus: {
      type: 'BitstringStatusListEntry',
      statusPurpose: 'revocation',
      statusListIndex: String(claims.statusListIndex),
      statusListCredential: claims.statusListUrl,
    },
    credentialSchema: {
      id: 'https://purl.imsglobal.org/spec/ob/v3p0/schema/json/ob_v3p0_achievementcredential_schema.json',
      type: 'JsonSchema',
    },
  };
}

export function payloadHash(payload: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export function signPersonnelCredential(claims: PersonnelVcClaims): {
  jwt: string;
  payloadHash: string;
  payload: Record<string, unknown>;
} {
  const payload = credentialPayload(claims);
  const now = Math.floor(Date.parse(claims.issuedAt) / 1000);
  const exp = Math.floor(Date.parse(claims.expiresAt) / 1000);
  const body = {
    iss: 'https://confora.example/issuers/development',
    sub: claims.certificateNumber,
    nbf: now,
    exp,
    vc: payload,
  };
  const header = b64url(JSON.stringify({ alg: 'EdDSA', typ: 'vc+jwt', kid: VC_KEY_ID }));
  const encodedBody = b64url(JSON.stringify(body));
  const signingInput = Buffer.from(`${header}.${encodedBody}`);
  const signature = sign(null, signingInput, privateKey());
  return {
    jwt: `${header}.${encodedBody}.${b64url(signature)}`,
    payloadHash: payloadHash(payload),
    payload,
  };
}

export function wasSignedWithBurnedKey(jwt: string): boolean {
  const parts = jwt.split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return false;
  }
  const signingInput = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signature = Buffer.from(parts[2], 'base64url');
  try {
    return verify(
      null,
      signingInput,
      createPublicKey({ key: BURNED_VC_PUBLIC_SPKI, format: 'der', type: 'spki' }),
      signature,
    );
  } catch {
    return false;
  }
}

function verifyEd25519Jwt(jwt: string): Record<string, unknown> {
  if (wasSignedWithBurnedKey(jwt)) {
    throw new Error('VC_KEY_DENIED');
  }
  const parts = jwt.split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    throw new Error('VC_MALFORMED');
  }
  const signingInput = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signature = Buffer.from(parts[2], 'base64url');
  const ok = verify(null, signingInput, createPublicKey(privateKey()), signature);
  if (!ok) {
    throw new Error('VC_SIGNATURE');
  }
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Record<string, unknown>;
}

export function verifyPersonnelCredential(jwt: string): Record<string, unknown> {
  return verifyEd25519Jwt(jwt);
}

export function signStatusList(credential: Record<string, unknown>): string {
  const header = b64url(JSON.stringify({ alg: 'EdDSA', typ: 'vc+jwt', kid: VC_KEY_ID }));
  const encodedBody = b64url(
    JSON.stringify({
      iss: 'https://confora.example/issuers/development',
      vc: credential,
    }),
  );
  const signingInput = Buffer.from(`${header}.${encodedBody}`);
  const signature = sign(null, signingInput, privateKey());
  return `${header}.${encodedBody}.${b64url(signature)}`;
}

export function verifyStatusList(jwt: string): Record<string, unknown> {
  const body = verifyEd25519Jwt(jwt);
  const vc = body['vc'];
  if (!vc || typeof vc !== 'object') {
    throw new Error('VC_MALFORMED');
  }
  return vc as Record<string, unknown>;
}

export function publishStatusList(credential: Record<string, unknown>): Record<string, unknown> {
  return {
    ...credential,
    proof: {
      type: 'Ed25519Signature2020',
      jwt: signStatusList(credential),
    },
  };
}

export function verifyPublishedStatusList(
  document: Record<string, unknown>,
): Record<string, unknown> {
  const proof = document['proof'];
  if (!proof || typeof proof !== 'object' || Array.isArray(proof)) {
    throw new Error('VC_MALFORMED');
  }
  const jwt = (proof as Record<string, unknown>)['jwt'];
  if (typeof jwt !== 'string') {
    throw new Error('VC_MALFORMED');
  }
  return verifyStatusList(jwt);
}

function ticketSecret(): string {
  const secret = process.env['PERSONNEL_PDF_TICKET_SECRET']?.trim() ?? '';
  if (secret.length === 0) {
    if (!testRuntime()) {
      throw new Error('PDF_TICKET_SECRET_UNCONFIGURED');
    }
    ephemeralTicketSecret ??= randomBytes(32).toString('base64url');
    return ephemeralTicketSecret;
  }
  if (secretIsBurned(secret) || secretIsBurned(`${secret}\n`)) {
    throw new Error('PDF_TICKET_SECRET_DENIED');
  }
  return secret;
}

export function issueDownloadTicket(publicUid: string, now: Date): string {
  const exp = now.getTime() + 5 * 60_000;
  const mac = createHmac('sha256', ticketSecret())
    .update(`${publicUid}.${String(exp)}`)
    .digest('base64url');
  return `${String(exp)}.${mac}`;
}

export function verifyDownloadTicket(publicUid: string, ticket: string, now: Date): boolean {
  const parts = ticket.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }
  const exp = Number(parts[0]);
  if (!Number.isFinite(exp) || exp < now.getTime()) {
    return false;
  }
  const expected = createHmac('sha256', ticketSecret())
    .update(`${publicUid}.${String(exp)}`)
    .digest('base64url');
  const given = Buffer.from(parts[1]);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length) {
    return false;
  }
  return timingSafeEqual(given, wanted);
}
