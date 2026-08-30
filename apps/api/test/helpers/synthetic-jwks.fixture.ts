import { createServer, type Server } from 'node:http';
import {
  generateKeyPairSync,
  createPublicKey,
  randomUUID,
  type KeyObject,
  type JsonWebKey,
} from 'node:crypto';
import { sign, type SignOptions } from 'jsonwebtoken';

/**
 * Jest CJS-compatible jose subset for jwks-rsa retrieveSigningKeys.
 * Production Node loads real transitive jose; Jest maps `jose` here.
 */
export function importJWK(jwk: Record<string, unknown>, _alg?: string): Promise<KeyObject> {
  return Promise.resolve(createPublicKey({ key: jwk as JsonWebKey, format: 'jwk' }));
}

export function exportSPKI(key: KeyObject): Promise<string> {
  return Promise.resolve(key.export({ type: 'spki', format: 'pem' }) as string);
}

export type SyntheticJwksFixture = Readonly<{
  issuer: string;
  audience: string;
  kid: string;
  jwksUri: string;
  baseUrl: string;
  signAccessToken: (
    claims: Record<string, unknown>,
    options?: Omit<SignOptions, 'algorithm' | 'keyid'>,
  ) => string;
  signWithPrivateKey: (
    claims: Record<string, unknown>,
    privateKeyPem: string,
    options?: SignOptions,
  ) => string;
  rotateToUnknownKid: () => void;
  stop: () => Promise<void>;
  privateKeyPem: string;
}>;

function exportJwk(publicKeyPem: string, kid: string): Record<string, unknown> {
  const jwk = createPublicKey(publicKeyPem).export({ format: 'jwk' }) as Record<string, unknown>;
  return { ...jwk, kid, alg: 'RS256', use: 'sig' };
}

/**
 * Ephemeral RSA + loopback JWKS fixture for BAR-P03 tests.
 * Private key is runtime-only and never written to disk.
 */
export async function startSyntheticJwksFixture(options?: {
  issuer?: string;
  audience?: string;
}): Promise<SyntheticJwksFixture> {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const privateKeyPem = privateKey.export({
    type: 'pkcs8',
    format: 'pem',
  }) as string;
  const publicKeyPem = publicKey.export({
    type: 'spki',
    format: 'pem',
  }) as string;

  let kid = `bar-p03-${randomUUID()}`;
  let currentPublicPem = publicKeyPem;
  const audience = options?.audience ?? 'confora-web-test';

  let issuerPath = '/realms/confora';
  const server: Server = createServer((req, res) => {
    const jwksPath = `${issuerPath}/protocol/openid-connect/certs`;
    if (req.url === jwksPath || req.url?.startsWith(`${jwksPath}?`)) {
      const body = JSON.stringify({
        keys: [exportJwk(currentPublicPem, kid)],
      });
      res.writeHead(200, {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      });
      res.end(body);
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to bind synthetic JWKS loopback server.');
  }

  const baseUrl = `http://127.0.0.1:${String(address.port)}`;
  const issuer = options?.issuer ?? `${baseUrl}/realms/confora`;
  try {
    issuerPath = new URL(issuer).pathname.replace(/\/$/, '') || '/realms/confora';
  } catch {
    issuerPath = '/realms/confora';
  }
  const signAccessToken: SyntheticJwksFixture['signAccessToken'] = (claims, signOptions = {}) => {
    const now = Math.floor(Date.now() / 1000);
    return sign(
      {
        iss: issuer,
        aud: audience,
        iat: now,
        exp: now + 300,
        ...claims,
      },
      privateKeyPem,
      {
        algorithm: 'RS256',
        keyid: kid,
        ...signOptions,
      },
    );
  };

  return {
    issuer,
    audience,
    kid,
    jwksUri: `${issuer}/protocol/openid-connect/certs`,
    baseUrl,
    privateKeyPem,
    signAccessToken,
    signWithPrivateKey: (claims, keyPem, signOptions = {}) =>
      sign(claims, keyPem, { algorithm: 'RS256', ...signOptions }),
    rotateToUnknownKid: () => {
      const rotated = generateKeyPairSync('rsa', { modulusLength: 2048 });
      currentPublicPem = rotated.publicKey.export({
        type: 'spki',
        format: 'pem',
      }) as string;
      kid = `bar-p03-rotated-${randomUUID()}`;
    },
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      }),
  };
}
