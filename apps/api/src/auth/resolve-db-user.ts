import type { ConforaUser } from './types/confora-user';
import type { PrismaService } from '../prisma/prisma.service';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AuthUserResolutionMethod = 'sub' | 'email' | 'preferred_username' | 'none';

export type AuthUserResolutionResult = {
  userId: string | null;
  method: AuthUserResolutionMethod;
  tenantId?: string | null;
};

const USER_LOOKUP_SELECT = { id: true, tenantId: true } as const;

function toResolution(
  row: { id: string; tenantId: string } | null,
  method: AuthUserResolutionMethod,
): AuthUserResolutionResult {
  if (!row) {
    return { userId: null, method: 'none', tenantId: null };
  }
  return { userId: row.id, method, tenantId: row.tenantId };
}

function emailFromPayload(payload: Record<string, unknown>): string {
  const emailRaw = payload['email'];
  return typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';
}

function preferredUsernameFromUser(user: ConforaUser, payload: Record<string, unknown>): string {
  const fromPayload = payload['preferred_username'];
  if (typeof fromPayload === 'string' && fromPayload.includes('@')) {
    return fromPayload.trim().toLowerCase();
  }
  if (user.username?.includes('@')) {
    return user.username.trim().toLowerCase();
  }
  return '';
}

/** Map JWT/Cognito subject (or email claims) to ``auth.users.id`` for Prisma FKs. */
export async function resolveAuthUserIdWithMeta(
  db: PrismaService['db'],
  user: ConforaUser,
): Promise<AuthUserResolutionResult> {
  const sub = user.sub?.trim();
  if (sub && UUID_RE.test(sub)) {
    const row = await db.user.findUnique({ where: { id: sub }, select: USER_LOOKUP_SELECT });
    if (row) return toResolution(row, 'sub');
  }

  const payload = user.payload as Record<string, unknown>;
  const email = emailFromPayload(payload);
  if (email) {
    const row = await db.user.findUnique({ where: { email }, select: USER_LOOKUP_SELECT });
    if (row) return toResolution(row, 'email');
  }

  const preferredUsername = preferredUsernameFromUser(user, payload);
  if (preferredUsername) {
    const row = await db.user.findUnique({
      where: { email: preferredUsername },
      select: USER_LOOKUP_SELECT,
    });
    if (row) return toResolution(row, 'preferred_username');
  }

  return { userId: null, method: 'none', tenantId: null };
}

export async function resolveAuthUserId(
  db: PrismaService['db'],
  user: ConforaUser,
): Promise<string | null> {
  const resolved = await resolveAuthUserIdWithMeta(db, user);
  return resolved.userId;
}

export function safeAuthResolutionDiagnostics(user: ConforaUser): {
  subSuffix: string | null;
  email: string | null;
  preferredUsername: string | null;
  roles: string[];
  tenantId: string | null;
} {
  const payload = user.payload as Record<string, unknown>;
  const sub = user.sub?.trim() ?? '';
  const email = emailFromPayload(payload) || null;
  const preferredUsername = preferredUsernameFromUser(user, payload) || null;
  return {
    subSuffix: sub.length >= 6 ? sub.slice(-6) : sub || null,
    email,
    preferredUsername,
    roles: [...user.roles],
    tenantId: user.tenantContext?.tenantId ?? null,
  };
}

