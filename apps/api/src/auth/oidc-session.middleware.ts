import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import {
  SESSION_COOKIE_NAME,
  tryLoadOidcBrowserConfig,
  type OidcBrowserConfig,
} from './oidc-config';
import { readCookie, sameSecret, serializeCookie, verifySessionId } from './oidc-crypto';
import { OidcSessionStore, type OidcSessionRecord } from './oidc-session-store';
import { refreshTokens, revokeRefreshToken, verifyOidcToken } from './oidc-token';

export const OIDC_DISPLAY_NAME_KEY = 'conforaDisplayName';
export const OIDC_CSRF_KEY = 'conforaCsrfToken';

const SKIP_SUFFIXES = [
  '/v1/auth/oidc/login',
  '/v1/auth/oidc/callback',
  '/v1/auth/oidc/refresh',
  '/v1/auth/oidc/logout',
];

function requestPath(req: Request): string {
  const raw = req.originalUrl || req.url || '';
  const query = raw.indexOf('?');
  return query === -1 ? raw : raw.slice(0, query);
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function clearSessionCookie(res: Response, config: OidcBrowserConfig): void {
  res.append(
    'Set-Cookie',
    serializeCookie(SESSION_COOKIE_NAME, '', { maxAge: 0, secure: config.cookieSecure }),
  );
}

function singleHeader(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function browserOrigin(req: Request): string | null {
  const origin = singleHeader(req.headers.origin);
  if (origin) {
    return origin;
  }
  const referer = singleHeader(req.headers.referer);
  if (!referer) {
    return null;
  }
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function originAccepted(req: Request, config: OidcBrowserConfig): boolean {
  const origin = browserOrigin(req);
  return origin !== null && config.webOrigins.includes(origin);
}

export function presentedCsrfToken(req: Request): string | null {
  const raw = singleHeader(req.headers['x-csrf-token']);
  if (!raw || raw.length > 128 || /[^A-Za-z0-9_-]/.test(raw)) {
    return null;
  }
  return raw;
}

export function sessionCsrfMatches(expected: string, presented: string | null): boolean {
  if (!presented) {
    return false;
  }
  return sameSecret(expected, presented);
}

function mutatingOriginAllowed(req: Request, config: OidcBrowserConfig): boolean {
  if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
    return true;
  }
  return originAccepted(req, config);
}

@Injectable()
export class OidcSessionMiddleware implements NestMiddleware {
  constructor(private readonly sessions: OidcSessionStore) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const path = requestPath(req);
    if (SKIP_SUFFIXES.some((suffix) => path === suffix || path.endsWith(suffix))) {
      next();
      return;
    }
    const config = tryLoadOidcBrowserConfig();
    if (!config) {
      next();
      return;
    }
    const cookie = readCookie(req.headers.cookie, SESSION_COOKIE_NAME);
    if (!cookie) {
      next();
      return;
    }
    const sessionId = verifySessionId(config.sessionSecret, cookie);
    if (!sessionId) {
      clearSessionCookie(res, config);
      next();
      return;
    }
    const now = Date.now();
    let record = this.sessions.read(sessionId);
    const expiry = record
      ? this.sessions.expiry(record, now, config.idleSeconds, config.absoluteSeconds)
      : null;
    if (!record || expiry) {
      if (record) {
        const refreshToken = record.refreshToken;
        this.sessions.delete(sessionId);
        await revokeRefreshToken(config, refreshToken);
      }
      if (expiry) {
        res.setHeader('X-Confora-Session', 'expired');
      }
      clearSessionCookie(res, config);
      next();
      return;
    }
    if (!mutatingOriginAllowed(req, config)) {
      res.status(403).json({ error: 'oidc.origin.rejected' });
      return;
    }
    if (
      MUTATING_METHODS.has(req.method.toUpperCase()) &&
      !sessionCsrfMatches(record.csrfToken, presentedCsrfToken(req))
    ) {
      res.status(403).json({ error: 'oidc.csrf.rejected' });
      return;
    }
    if (record.accessExpiresAt <= now + 20_000) {
      const refreshed = await this.refresh(config, record, now);
      if (!refreshed) {
        clearSessionCookie(res, config);
        next();
        return;
      }
      record = refreshed;
    }
    this.sessions.touch(sessionId, now);
    const requestWithName = req as Request & {
      [OIDC_DISPLAY_NAME_KEY]?: string;
      [OIDC_CSRF_KEY]?: string;
    };
    requestWithName[OIDC_DISPLAY_NAME_KEY] = record.displayName;
    requestWithName[OIDC_CSRF_KEY] = record.csrfToken;
    if (!req.headers.authorization) {
      req.headers.authorization = `Bearer ${record.accessToken}`;
    }
    next();
  }

  private async refresh(
    config: OidcBrowserConfig,
    record: OidcSessionRecord,
    now: number,
  ): Promise<OidcSessionRecord | null> {
    try {
      const tokens = await refreshTokens(config, record.refreshToken);
      const access = await verifyOidcToken(tokens.accessToken, config);
      let idToken = record.idToken;
      if (tokens.idToken) {
        await verifyOidcToken(tokens.idToken, config);
        idToken = tokens.idToken;
      }
      return this.sessions.replaceTokens(
        record.id,
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          idToken,
          accessExpiresAt: access.exp * 1000,
        },
        now,
      );
    } catch {
      const refreshToken = record.refreshToken;
      this.sessions.delete(record.id);
      await revokeRefreshToken(config, refreshToken);
      return null;
    }
  }
}
