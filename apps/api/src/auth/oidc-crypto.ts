import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

export type SessionExpiry = 'idle' | 'absolute';

export type SessionTimestamps = Readonly<{
  createdAt: number;
  lastSeenAt: number;
}>;

export function sessionExpiryReason(
  session: SessionTimestamps,
  now: number,
  idleSeconds: number,
  absoluteSeconds: number,
): SessionExpiry | null {
  if (now - session.createdAt >= absoluteSeconds * 1000) {
    return 'absolute';
  }
  if (now - session.lastSeenAt >= idleSeconds * 1000) {
    return 'idle';
  }
  return null;
}

export function createPkce(): { readonly verifier: string; readonly challenge: string } {
  const verifier = randomBytes(32).toString('base64url');
  return { verifier, challenge: s256(verifier) };
}

export function s256(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

export function createOpaqueId(): string {
  return randomBytes(32).toString('base64url');
}

export function sameString(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

/** Relative in-app path only. Rejects scheme, host and protocol-relative values. */
export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string') {
    return '/dashboard';
  }
  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > 200 ||
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    trimmed.includes('://') ||
    trimmed.includes('\0')
  ) {
    return '/dashboard';
  }
  return trimmed;
}

function secretKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}

export function sealJson(secret: string, payload: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', secretKey(secret), iv);
  const body = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(payload), 'utf8')),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, body]).toString('base64url');
}

export function openJson(secret: string, token: string): unknown {
  try {
    const buf = Buffer.from(token, 'base64url');
    if (buf.length < 28) {
      return null;
    }
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const body = buf.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', secretKey(secret), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(body), decipher.final()]);
    return JSON.parse(plain.toString('utf8')) as unknown;
  } catch {
    return null;
  }
}

export function signSessionId(secret: string, sessionId: string): string {
  const mac = createHmac('sha256', secret).update(sessionId).digest('base64url');
  return `${sessionId}.${mac}`;
}

export function verifySessionId(secret: string, cookieValue: string): string | null {
  const dot = cookieValue.lastIndexOf('.');
  if (dot <= 0) {
    return null;
  }
  const sessionId = cookieValue.slice(0, dot);
  const mac = cookieValue.slice(dot + 1);
  if (!/^[A-Za-z0-9_-]{43}$/.test(sessionId)) {
    return null;
  }
  const expected = createHmac('sha256', secret).update(sessionId).digest('base64url');
  if (!sameString(mac, expected)) {
    return null;
  }
  return sessionId;
}

export function readCookie(header: string | undefined, name: string): string | null {
  if (!header) {
    return null;
  }
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator <= 0) {
      continue;
    }
    if (part.slice(0, separator).trim() !== name) {
      continue;
    }
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

export function serializeCookie(
  name: string,
  value: string,
  options: { readonly maxAge: number; readonly secure: boolean },
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/v1',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${String(options.maxAge)}`,
  ];
  if (options.secure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}
