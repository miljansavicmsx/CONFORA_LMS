import {
  Controller,
  Get,
  Header,
  Headers,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PRIVILEGED_ROLES,
  deriveMfaVerified,
  parseRolesFromPayload,
  type ConforaJwtPayload,
} from '@confora/shared-types';
import type { Request, Response } from 'express';

import { PrismaService } from '../prisma/prisma.service';
import { Public } from './public.decorator';
import { getRequestPrincipal, type RequestWithPrincipal } from './request-principal';
import { resolveCanonicalUser } from './resolve-db-user';
import {
  SESSION_COOKIE_NAME,
  TRANSACTION_COOKIE_NAME,
  tryLoadOidcBrowserConfig,
  type OidcBrowserConfig,
} from './oidc-config';
import {
  createOpaqueId,
  createPkce,
  openJson,
  readCookie,
  safeReturnPath,
  sameString,
  sealJson,
  serializeCookie,
  signSessionId,
  verifySessionId,
} from './oidc-crypto';
import { OIDC_DISPLAY_NAME_KEY } from './oidc-session.middleware';
import { OidcSessionStore } from './oidc-session-store';
import {
  authorizeUrl,
  endSessionUrl,
  exchangeAuthorizationCode,
  refreshTokens,
  revokeRefreshToken,
  verifyOidcToken,
} from './oidc-token';

const TENANT_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TX_TTL_MS = 10 * 60 * 1000;

type OidcTransaction = {
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
  exp: number;
};

type DenialReason = 'denied' | 'session' | 'expired';

function webOrigin(config: OidcBrowserConfig): string {
  return config.webOrigins[0] ?? 'http://localhost:3001';
}

function denialRedirect(config: OidcBrowserConfig, reason: DenialReason): string {
  return `${webOrigin(config)}/login?reason=${reason}`;
}

function appendCookie(
  res: Response,
  name: string,
  value: string,
  config: OidcBrowserConfig,
  maxAge: number,
): void {
  res.append('Set-Cookie', serializeCookie(name, value, { maxAge, secure: config.cookieSecure }));
}

function clearBrowserCookies(res: Response, config: OidcBrowserConfig): void {
  appendCookie(res, SESSION_COOKIE_NAME, '', config, 0);
  appendCookie(res, TRANSACTION_COOKIE_NAME, '', config, 0);
}

function originAllowed(origin: string | undefined, config: OidcBrowserConfig): boolean {
  return typeof origin === 'string' && config.webOrigins.includes(origin);
}

function readTransaction(value: unknown): OidcTransaction | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const state = record['state'];
  const nonce = record['nonce'];
  const verifier = record['verifier'];
  const exp = record['exp'];
  if (
    typeof state !== 'string' ||
    typeof nonce !== 'string' ||
    typeof verifier !== 'string' ||
    typeof exp !== 'number'
  ) {
    return null;
  }
  const returnTo = record['returnTo'];
  return {
    state,
    nonce,
    verifier,
    returnTo: typeof returnTo === 'string' ? returnTo : '/dashboard',
    exp,
  };
}

function displayNameFrom(payload: Record<string, unknown>, email: string): string {
  for (const key of ['name', 'preferred_username'] as const) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim().slice(0, 200);
    }
  }
  return email;
}

function claimsOf(payload: Record<string, unknown>): ConforaJwtPayload {
  return payload as ConforaJwtPayload;
}

@Controller('auth')
export class OidcController {
  constructor(
    private readonly sessions: OidcSessionStore,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get('oidc/login')
  login(
    @Query('return_to') returnTo: unknown,
    @Query('prompt') prompt: unknown,
    @Res() res: Response,
  ): void {
    const config = tryLoadOidcBrowserConfig();
    if (!config) {
      res.status(503).json({ error: 'oidc.unavailable' });
      return;
    }
    const pkce = createPkce();
    const state = createOpaqueId();
    const nonce = createOpaqueId();
    const transaction: OidcTransaction = {
      state,
      nonce,
      verifier: pkce.verifier,
      returnTo: safeReturnPath(returnTo),
      exp: Date.now() + TX_TTL_MS,
    };
    appendCookie(
      res,
      TRANSACTION_COOKIE_NAME,
      sealJson(config.sessionSecret, transaction),
      config,
      600,
    );
    res.redirect(
      302,
      authorizeUrl(config, {
        state,
        nonce,
        challenge: pkce.challenge,
        promptLogin: prompt === 'login',
      }),
    );
  }

  @Public()
  @Get('oidc/callback')
  async callback(
    @Query('code') code: unknown,
    @Query('state') state: unknown,
    @Query('error') error: unknown,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const config = tryLoadOidcBrowserConfig();
    if (!config) {
      res.status(503).json({ error: 'oidc.unavailable' });
      return;
    }
    const fail = (reason: DenialReason): void => {
      clearBrowserCookies(res, config);
      res.redirect(302, denialRedirect(config, reason));
    };
    if (typeof error === 'string' || typeof code !== 'string' || typeof state !== 'string') {
      fail('denied');
      return;
    }
    const sealed = readCookie(req.headers.cookie, TRANSACTION_COOKIE_NAME);
    const transaction = sealed ? readTransaction(openJson(config.sessionSecret, sealed)) : null;
    if (!transaction || typeof transaction.exp !== 'number' || transaction.exp < Date.now()) {
      fail('session');
      return;
    }
    if (
      typeof transaction.state !== 'string' ||
      typeof transaction.nonce !== 'string' ||
      typeof transaction.verifier !== 'string' ||
      !sameString(transaction.state, state)
    ) {
      fail('denied');
      return;
    }
    try {
      const tokens = await exchangeAuthorizationCode(config, code, transaction.verifier);
      const access = await verifyOidcToken(tokens.accessToken, config);
      const id = await verifyOidcToken(tokens.idToken, config);
      if (typeof id['nonce'] !== 'string' || !sameString(id['nonce'], transaction.nonce)) {
        fail('denied');
        return;
      }
      if (access.sub !== id.sub) {
        fail('denied');
        return;
      }
      const tenantRaw = typeof access['tenant_id'] === 'string' ? access['tenant_id'].trim() : '';
      if (!TENANT_UUID.test(tenantRaw)) {
        fail('denied');
        return;
      }
      const user = await resolveCanonicalUser(this.prisma, {
        tenantId: tenantRaw,
        issuer: config.issuerUrl,
        subject: access.sub,
      });
      const roles = parseRolesFromPayload(claimsOf(access));
      const mfaVerified = deriveMfaVerified(claimsOf(access));
      if (roles.some((role) => PRIVILEGED_ROLES.includes(role)) && !mfaVerified) {
        fail('denied');
        return;
      }
      const now = Date.now();
      const record = this.sessions.create({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        idToken: tokens.idToken,
        accessExpiresAt: access.exp * 1000,
        displayName: displayNameFrom(id, user.email),
        now,
      });
      appendCookie(res, TRANSACTION_COOKIE_NAME, '', config, 0);
      appendCookie(
        res,
        SESSION_COOKIE_NAME,
        signSessionId(config.sessionSecret, record.id),
        config,
        config.absoluteSeconds,
      );
      const destination = safeReturnPath(transaction.returnTo);
      res.redirect(302, `${webOrigin(config)}${destination}`);
    } catch {
      fail('denied');
    }
  }

  @Public()
  @Post('oidc/refresh')
  @Header('Cache-Control', 'no-store')
  async refresh(
    @Headers('origin') origin: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const config = tryLoadOidcBrowserConfig();
    if (!config) {
      res.status(503).json({ error: 'oidc.unavailable' });
      return;
    }
    if (!originAllowed(origin, config)) {
      res.status(403).json({ error: 'oidc.origin.rejected' });
      return;
    }
    const ended = await this.endSession(config, req, res, false);
    if (ended === 'missing') {
      res.status(401).json({ error: 'oidc.session.missing' });
      return;
    }
    if (ended === 'expired') {
      res.status(401).json({ error: 'oidc.session.expired' });
      return;
    }
    try {
      const tokens = await refreshTokens(config, ended.refreshToken);
      const access = await verifyOidcToken(tokens.accessToken, config);
      let idToken = ended.idToken;
      if (tokens.idToken) {
        await verifyOidcToken(tokens.idToken, config);
        idToken = tokens.idToken;
      }
      const replaced = this.sessions.replaceTokens(
        ended.id,
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          idToken,
          accessExpiresAt: access.exp * 1000,
        },
        Date.now(),
      );
      if (!replaced) {
        res.status(401).json({ error: 'oidc.session.missing' });
        return;
      }
      res.status(204).send();
    } catch {
      this.sessions.delete(ended.id);
      await revokeRefreshToken(config, ended.refreshToken);
      appendCookie(res, SESSION_COOKIE_NAME, '', config, 0);
      res.status(401).json({ error: 'oidc.session.expired' });
    }
  }

  @Public()
  @Post('oidc/logout')
  @Header('Cache-Control', 'no-store')
  async logout(
    @Headers('origin') origin: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const config = tryLoadOidcBrowserConfig();
    if (!config) {
      res.status(503).json({ error: 'oidc.unavailable' });
      return;
    }
    if (!originAllowed(origin, config)) {
      res.status(403).json({ error: 'oidc.origin.rejected' });
      return;
    }
    const ended = await this.endSession(config, req, res, true);
    if (ended === 'missing' || ended === 'expired') {
      res.status(200).json({ endSessionUrl: null });
      return;
    }
    await revokeRefreshToken(config, ended.refreshToken);
    res.status(200).json({ endSessionUrl: endSessionUrl(config, ended.idToken) });
  }

  @Get('session')
  @Header('Cache-Control', 'no-store')
  session(@Req() req: Request & RequestWithPrincipal): {
    userId: string;
    email: string;
    displayName: string;
    roles: readonly string[];
    mfaVerified: boolean;
  } {
    const actor = getRequestPrincipal(req);
    if (!actor) {
      throw new UnauthorizedException();
    }
    const named = (req as Request & { [OIDC_DISPLAY_NAME_KEY]?: string })[OIDC_DISPLAY_NAME_KEY];
    return {
      userId: actor.userId,
      email: actor.email,
      displayName:
        typeof named === 'string' && named.trim().length > 0 ? named.trim() : actor.email,
      roles: actor.roles,
      mfaVerified: actor.mfaVerified,
    };
  }

  private async endSession(
    config: OidcBrowserConfig,
    req: Request,
    res: Response,
    destroy: boolean,
  ): Promise<'missing' | 'expired' | { id: string; refreshToken: string; idToken: string }> {
    const cookie = readCookie(req.headers.cookie, SESSION_COOKIE_NAME);
    const sessionId = cookie ? verifySessionId(config.sessionSecret, cookie) : null;
    if (!sessionId) {
      appendCookie(res, SESSION_COOKIE_NAME, '', config, 0);
      return 'missing';
    }
    const record = this.sessions.read(sessionId);
    if (!record) {
      appendCookie(res, SESSION_COOKIE_NAME, '', config, 0);
      return 'missing';
    }
    const expiry = this.sessions.expiry(
      record,
      Date.now(),
      config.idleSeconds,
      config.absoluteSeconds,
    );
    if (expiry) {
      const refreshToken = record.refreshToken;
      this.sessions.delete(sessionId);
      await revokeRefreshToken(config, refreshToken);
      res.setHeader('X-Confora-Session', 'expired');
      appendCookie(res, SESSION_COOKIE_NAME, '', config, 0);
      return 'expired';
    }
    if (destroy) {
      this.sessions.delete(sessionId);
      appendCookie(res, SESSION_COOKIE_NAME, '', config, 0);
    }
    return { id: record.id, refreshToken: record.refreshToken, idToken: record.idToken };
  }
}
