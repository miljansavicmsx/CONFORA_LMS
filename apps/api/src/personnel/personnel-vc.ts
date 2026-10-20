import {
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  sign,
  timingSafeEqual,
  verify,
  type KeyObject,
} from 'node:crypto';

/**
 * Development Ed25519 key. It is not an accredited trust anchor.
 * Set PERSONNEL_VC_ED25519_PKCS8_PEM before any production signature.
 */
const DEVELOPMENT_PKCS8_PEM = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIDoZYGpPrYBceE7laSBxBFzPYsXMhqXJNRQd/oMCUefH
-----END PRIVATE KEY-----
`;

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

function privateKey(): KeyObject {
  const pem = process.env['PERSONNEL_VC_ED25519_PKCS8_PEM'] ?? DEVELOPMENT_PKCS8_PEM;
  return createPrivateKey(pem);
}

export function signingTrust(): 'CONFIGURED' | 'DEVELOPMENT' {
  return process.env['PERSONNEL_VC_ED25519_PKCS8_PEM'] ? 'CONFIGURED' : 'DEVELOPMENT';
}

export function publicJwk(): Record<string, unknown> {
  const jwk = createPublicKey(privateKey()).export({ format: 'jwk' }) as Record<string, unknown>;
  return { ...jwk, kid: VC_KEY_ID, alg: 'EdDSA' };
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

export function verifyPersonnelCredential(jwt: string): Record<string, unknown> {
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

function ticketSecret(): string {
  return process.env['PERSONNEL_VC_ED25519_PKCS8_PEM'] ?? DEVELOPMENT_PKCS8_PEM;
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
