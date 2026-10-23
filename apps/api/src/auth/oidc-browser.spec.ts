import { generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Server } from 'node:http';
import { join } from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { ExamCommitteeRolesGuard } from '../exam/exam-roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { MfaAssuranceGuard } from './mfa-assurance.guard';
import { OidcController } from './oidc.controller';
import { CanonicalUserResolver } from './resolve-db-user';
import { openJson, s256 } from './oidc-crypto';
import { OidcSessionMiddleware } from './oidc-session.middleware';
import { OidcSessionStore } from './oidc-session-store';
import { getRequestPrincipal, type RequestWithPrincipal } from './request-principal';

const jwksState: { publicPem: string } = { publicPem: '' };

jest.mock('jwks-rsa', () => {
  const factory = () => ({
    getSigningKey: () => Promise.resolve({ getPublicKey: () => jwksState.publicPem }),
  });
  return factory;
});

const SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef';
const ISSUER = 'http://issuer.test/realms/confora';
const CLIENT = 'confora-web';
const TENANT = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const OTHER_TENANT = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const SUBJECT = '11111111-1111-4111-8111-111111111111';
const ORIGIN = 'http://localhost:3001';

type Link = { userId: string; userTenantId: string; email: string };
const links = new Map<string, Link>();

@Controller('probe')
class ProbeController {
  @Get('me')
  me(@Req() req: RequestWithPrincipal) {
    const actor = getRequestPrincipal(req);
    return {
      userId: actor?.userId ?? null,
      roles: actor?.roles ?? [],
      mfaVerified: actor?.mfaVerified ?? false,
    };
  }

  @Get('committee')
  @UseGuards(ExamCommitteeRolesGuard)
  committee() {
    return { ok: true };
  }

  @Post('mutate')
  mutate() {
    return { ok: true };
  }
}

type SealedTransaction = {
  state: string;
  nonce: string;
  verifier: string;
};

function cookieValue(header: string | string[] | undefined, name: string): string | null {
  const lines = header === undefined ? [] : Array.isArray(header) ? header : [header];
  for (const line of lines) {
    const first = line.split(';')[0] ?? '';
    const eq = first.indexOf('=');
    if (eq > 0 && first.slice(0, eq) === name) {
      return decodeURIComponent(first.slice(eq + 1));
    }
  }
  return null;
}

function requestUrl(input: Parameters<typeof fetch>[0]): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

function requestBody(init: RequestInit | undefined): string {
  const body = init?.body;
  if (typeof body === 'string') {
    return body;
  }
  if (body instanceof URLSearchParams) {
    return body.toString();
  }
  return '';
}

function sealedTransaction(value: unknown): SealedTransaction | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const state = record['state'];
  const nonce = record['nonce'];
  const verifier = record['verifier'];
  if (typeof state !== 'string' || typeof nonce !== 'string' || typeof verifier !== 'string') {
    return null;
  }
  return { state, nonce, verifier };
}

function headerText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function sidCookie(sid: string | null): string {
  return `confora_sid=${sid ?? ''}`;
}

function parseRecord(text: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(text) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {};
  }
  return parsed as Record<string, unknown>;
}

describe('global middleware registration', () => {
  it('keeps the browser session and tenant rejection on every route', () => {
    const source = readFileSync(join(__dirname, '../app.module.ts'), 'utf8');
    expect(source).toContain("consumer.apply(OidcSessionMiddleware).forRoutes('*')");
    expect(source).toContain("consumer.apply(ClientTenantRejectionMiddleware).forRoutes('*')");
    expect(source).not.toContain("forRoutes('auth')");
  });
});

describe('OIDC browser session', () => {
  let app: INestApplication;
  let privatePem: string;
  let tokenBodies: string[] = [];
  let revokeBodies: string[] = [];
  const originalFetch = globalThis.fetch;
  const previousEnv = { ...process.env };

  function signToken(claims: Record<string, unknown>): string {
    const now = Math.floor(Date.now() / 1000);
    return sign(
      {
        iss: ISSUER,
        aud: CLIENT,
        sub: SUBJECT,
        iat: now,
        exp: now + 300,
        ...claims,
      },
      privatePem,
      { algorithm: 'RS256', keyid: 'unit-kid' },
    );
  }

  function tokenSet(accessClaims: Record<string, unknown>, nonce: string): Record<string, unknown> {
    return {
      access_token: signToken(accessClaims),
      refresh_token: 'refresh-not-a-jwt',
      id_token: signToken({ nonce, name: 'Demo Kandidat' }),
      expires_in: 120,
    };
  }

  function http(): Server {
    return app.getHttpServer() as Server;
  }

  beforeAll(async () => {
    const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
    privatePem = keys.privateKey.export({ type: 'pkcs8', format: 'pem' });
    jwksState.publicPem = keys.publicKey.export({ type: 'spki', format: 'pem' });
    process.env['OIDC_ISSUER_URL'] = ISSUER;
    process.env['OIDC_CLIENT_ID'] = CLIENT;
    process.env['OIDC_SESSION_SECRET'] = SECRET;
    process.env['OIDC_SESSION_IDLE_SECONDS'] = '1';
    process.env['OIDC_SESSION_ABSOLUTE_SECONDS'] = '3600';
    process.env['SESSION_COOKIE_SECURE'] = 'false';
    process.env['OIDC_WEB_ORIGINS'] = ORIGIN;
    process.env['OIDC_REDIRECT_URI'] = 'http://localhost:4000/v1/auth/oidc/callback';
    process.env['OIDC_POST_LOGOUT_REDIRECT_URI'] = `${ORIGIN}/login`;

    const prisma = {
      externalIdentityLink: {
        findUnique: jest.fn(
          (args: {
            where: {
              tenantId_issuer_subject: { tenantId: string; issuer: string; subject: string };
            };
          }) => {
            const key = args.where.tenantId_issuer_subject;
            const found = links.get(`${key.tenantId}|${key.issuer}|${key.subject}`);
            if (!found) return null;
            return { user: { id: found.userId, tenantId: found.userTenantId, email: found.email } };
          },
        ),
      },
    };
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [OidcController, ProbeController],
      providers: [
        JwtStrategy,
        CanonicalUserResolver,
        OidcSessionStore,
        OidcSessionMiddleware,
        ExamCommitteeRolesGuard,
        { provide: PrismaService, useValue: prisma },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: MfaAssuranceGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    const middleware = app.get(OidcSessionMiddleware);
    app.use((req: Request, res: Response, next: NextFunction) => {
      void middleware.use(req, res, next).catch((error: unknown) => {
        next(error instanceof Error ? error : new Error('session middleware failed'));
      });
    });
    await app.init();
  });

  afterAll(async () => {
    globalThis.fetch = originalFetch;
    process.env = previousEnv;
    await app.close();
  });

  beforeEach(() => {
    tokenBodies = [];
    revokeBodies = [];
    links.clear();
    links.set(`${TENANT}|${ISSUER}|${SUBJECT}`, {
      userId: '1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c',
      userTenantId: TENANT,
      email: 'exam-candidate@demo.confora.test',
    });
    globalThis.fetch = (input, init) => {
      const href = requestUrl(input);
      const body = requestBody(init);
      if (href.endsWith('/protocol/openid-connect/token')) {
        tokenBodies.push(body);
        if (body.includes('grant_type=authorization_code') && !body.includes('code_verifier=')) {
          return Promise.resolve(new Response('{}', { status: 400 }));
        }
        const payload = pendingTokens;
        if (!payload) return Promise.resolve(new Response('{}', { status: 400 }));
        return Promise.resolve(
          new Response(JSON.stringify(payload), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        );
      }
      if (href.endsWith('/protocol/openid-connect/revoke')) {
        revokeBodies.push(body);
        return Promise.resolve(new Response('', { status: 200 }));
      }
      return Promise.resolve(new Response('{}', { status: 500 }));
    };
  });

  let pendingTokens: Record<string, unknown> | null = null;

  function setCookie(headers: request.Response['headers'], name: string): string | null {
    return cookieValue(headers['set-cookie'], name);
  }

  async function start(prompt = false) {
    const query = prompt
      ? '?prompt=login&return_to=/dashboard/profil'
      : '?return_to=/dashboard/profil';
    const response = await request(http()).get(`/v1/auth/oidc/login${query}`).redirects(0);
    const locationHeader = headerText(response.headers.location);
    const location = new URL(locationHeader);
    const sealed = setCookie(response.headers, 'confora_oidc_tx');
    const transaction = sealedTransaction(openJson(SECRET, sealed ?? ''));
    return { response, location, transaction, sealed };
  }

  async function finish(state: string, txCookie: string) {
    return request(http())
      .get(`/v1/auth/oidc/callback?code=synthetic-code&state=${encodeURIComponent(state)}`)
      .set('Cookie', `confora_oidc_tx=${encodeURIComponent(txCookie)}`)
      .redirects(0);
  }

  async function candidateSession(): Promise<string> {
    const started = await start();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } },
      started.transaction?.nonce ?? '',
    );
    const callback = await finish(started.transaction?.state ?? '', started.sealed ?? '');
    const sid = setCookie(callback.headers, 'confora_sid');
    if (sid === null || sid.length < 20) {
      throw new Error('missing session cookie');
    }
    return sid;
  }

  async function sessionCsrf(sid: string): Promise<string> {
    const response = await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid));
    const token = parseRecord(JSON.stringify(response.body))['csrfToken'];
    if (typeof token !== 'string' || token.length < 20) {
      throw new Error('missing csrf token');
    }
    return token;
  }

  it('sends S256 PKCE and stores the verifier only in the sealed cookie', async () => {
    const started = await start();
    expect(started.response.status).toBe(302);
    expect(started.location.searchParams.get('code_challenge_method')).toBe('S256');
    expect(started.transaction).not.toBeNull();
    expect(started.location.searchParams.get('code_challenge')).toBe(
      s256(started.transaction?.verifier ?? ''),
    );
    expect(started.location.searchParams.get('state')).toBe(started.transaction?.state);
    expect(started.location.searchParams.has('prompt')).toBe(false);
    const forced = await start(true);
    expect(forced.location.searchParams.get('prompt')).toBe('login');
  });

  it('rejects a callback whose state does not match and does not exchange the code', async () => {
    const started = await start();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } },
      started.transaction?.nonce ?? '',
    );
    const response = await finish('different-state', started.sealed ?? '');
    expect(response.status).toBe(302);
    expect(headerText(response.headers.location)).toContain('reason=denied');
    expect(tokenBodies).toHaveLength(0);
    expect(setCookie(response.headers, 'confora_sid')).toBe('');
  });

  it('rejects a callback whose nonce does not match', async () => {
    const started = await start();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } },
      'wrong-nonce',
    );
    const response = await finish(started.transaction?.state ?? '', started.sealed ?? '');
    expect(response.status).toBe(302);
    expect(headerText(response.headers.location)).toContain('reason=denied');
    const verifier = started.transaction?.verifier ?? '';
    expect(tokenBodies[0] ?? '').toContain(`code_verifier=${verifier}`);
    expect(setCookie(response.headers, 'confora_sid')).toBe('');
  });

  it('creates a cookie session for a candidate and keeps tokens out of the session response', async () => {
    const started = await start();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } },
      started.transaction?.nonce ?? '',
    );
    const callback = await finish(started.transaction?.state ?? '', started.sealed ?? '');
    expect(callback.status).toBe(302);
    expect(headerText(callback.headers.location)).toBe(`${ORIGIN}/dashboard/profil`);
    expect(tokenBodies[0] ?? '').toContain('code_verifier=');
    const sid = setCookie(callback.headers, 'confora_sid');
    expect(sid !== null && sid.length > 20).toBe(true);
    const session = await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid));
    expect(session.status).toBe(200);
    const sessionBody = parseRecord(JSON.stringify(session.body));
    expect(sessionBody['roles']).toEqual(['USR_CAND']);
    expect(sessionBody['email']).toBe('exam-candidate@demo.confora.test');
    const serialized = JSON.stringify(sessionBody);
    expect(serialized.includes('access_token')).toBe(false);
    expect(serialized.includes('refresh_token')).toBe(false);
    expect(serialized.includes('id_token')).toBe(false);
    expect(serialized.includes('eyJ')).toBe(false);
    const committee = await request(http())
      .get('/v1/probe/committee')
      .set('Cookie', sidCookie(sid));
    expect(committee.status).toBe(403);
  });

  it('denies a privileged role that has no authenticator reference', async () => {
    const started = await start();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['COM_CERT'] } },
      started.transaction?.nonce ?? '',
    );
    const callback = await finish(started.transaction?.state ?? '', started.sealed ?? '');
    expect(headerText(callback.headers.location)).toContain('reason=denied');
    expect(setCookie(callback.headers, 'confora_sid')).toBe('');
  });

  it('accepts a committee session only when amr contains otp', async () => {
    const started = await start();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['COM_CERT'] }, amr: ['pwd', 'otp'] },
      started.transaction?.nonce ?? '',
    );
    const callback = await finish(started.transaction?.state ?? '', started.sealed ?? '');
    const sid = setCookie(callback.headers, 'confora_sid');
    const committee = await request(http())
      .get('/v1/probe/committee')
      .set('Cookie', sidCookie(sid));
    expect(committee.status).toBe(200);
  });

  it('denies an invalid organization claim, a missing membership, and a tenant mismatch', async () => {
    const missingTenant = await start();
    pendingTokens = tokenSet(
      { realm_access: { roles: ['USR_CAND'] } },
      missingTenant.transaction?.nonce ?? '',
    );
    expect(
      headerText(
        (await finish(missingTenant.transaction?.state ?? '', missingTenant.sealed ?? '')).headers
          .location,
      ),
    ).toContain('reason=denied');

    const unlinked = await start();
    links.clear();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } },
      unlinked.transaction?.nonce ?? '',
    );
    expect(
      headerText(
        (await finish(unlinked.transaction?.state ?? '', unlinked.sealed ?? '')).headers.location,
      ),
    ).toContain('reason=denied');

    const mismatch = await start();
    links.set(`${TENANT}|${ISSUER}|${SUBJECT}`, {
      userId: '1c1c1c1c-1c1c-4c1c-8c1c-1c1c1c1c1c1c',
      userTenantId: OTHER_TENANT,
      email: 'exam-candidate@demo.confora.test',
    });
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } },
      mismatch.transaction?.nonce ?? '',
    );
    expect(
      headerText(
        (await finish(mismatch.transaction?.state ?? '', mismatch.sealed ?? '')).headers.location,
      ),
    ).toContain('reason=denied');

    const bearer = signToken({ tenant_id: 'not-a-uuid', realm_access: { roles: ['USR_CAND'] } });
    expect(
      (await request(http()).get('/v1/probe/me').set('Authorization', `Bearer ${bearer}`)).status,
    ).toBe(401);
    const unlinkedBearer = signToken({ tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } });
    links.clear();
    expect(
      (await request(http()).get('/v1/probe/me').set('Authorization', `Bearer ${unlinkedBearer}`))
        .status,
    ).toBe(403);
  });

  it('rejects a missing cookie, a forged bearer, and an expired bearer', async () => {
    expect((await request(http()).get('/v1/probe/me')).status).toBe(401);
    const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const forged = sign(
      {
        iss: ISSUER,
        aud: CLIENT,
        sub: SUBJECT,
        tenant_id: TENANT,
        exp: Math.floor(Date.now() / 1000) + 60,
      },
      other.privateKey.export({ type: 'pkcs8', format: 'pem' }),
      { algorithm: 'RS256', keyid: 'unit-kid' },
    );
    expect(
      (await request(http()).get('/v1/probe/me').set('Authorization', `Bearer ${forged}`)).status,
    ).toBe(401);
    const expired = signToken({
      tenant_id: TENANT,
      exp: Math.floor(Date.now() / 1000) - 120,
      realm_access: { roles: ['USR_CAND'] },
    });
    expect(
      (await request(http()).get('/v1/probe/me').set('Authorization', `Bearer ${expired}`)).status,
    ).toBe(401);
  });

  it('drops an idle session and requires a new login', async () => {
    const started = await start();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } },
      started.transaction?.nonce ?? '',
    );
    const callback = await finish(started.transaction?.state ?? '', started.sealed ?? '');
    const sid = setCookie(callback.headers, 'confora_sid');
    expect(
      (await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid))).status,
    ).toBe(200);
    await new Promise((resolve) => setTimeout(resolve, 1_100));
    const expired = await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid));
    expect(expired.status).toBe(401);
    expect(headerText(expired.headers['x-confora-session'])).toBe('expired');
  });

  it('logout revokes the server session and returns an end-session url without an access token field', async () => {
    const started = await start();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } },
      started.transaction?.nonce ?? '',
    );
    const callback = await finish(started.transaction?.state ?? '', started.sealed ?? '');
    const sid = setCookie(callback.headers, 'confora_sid');
    const logout = await request(http())
      .post('/v1/auth/oidc/logout')
      .set('Origin', ORIGIN)
      .set('X-CSRF-Token', await sessionCsrf(sid))
      .set('Cookie', sidCookie(sid));
    expect(logout.status).toBe(200);
    const logoutBody = parseRecord(JSON.stringify(logout.body));
    expect(Object.keys(logoutBody)).toEqual(['endSessionUrl']);
    const endSessionUrl = logoutBody['endSessionUrl'];
    expect(typeof endSessionUrl).toBe('string');
    if (typeof endSessionUrl !== 'string') {
      throw new Error('missing end-session url');
    }
    expect(endSessionUrl.startsWith(`${ISSUER}/protocol/openid-connect/logout?`)).toBe(true);
    expect(endSessionUrl.includes('access_token=')).toBe(false);
    expect(
      (await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid))).status,
    ).toBe(401);
  });

  it('revokes the previous session when sign-in starts', async () => {
    const sid = await candidateSession();
    revokeBodies = [];
    const again = await request(http())
      .get('/v1/auth/oidc/login?return_to=/dashboard/profil')
      .set('Cookie', sidCookie(sid))
      .redirects(0);
    expect(again.status).toBe(302);
    expect(revokeBodies).toHaveLength(1);
    expect(revokeBodies[0] ?? '').toContain('token_type_hint=refresh_token');
    expect(revokeBodies[0] ?? '').not.toContain('access_token=');
    expect(
      (await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid))).status,
    ).toBe(401);
  });

  it('revokes a session cookie still presented to the callback', async () => {
    const sid = await candidateSession();
    const started = await start();
    pendingTokens = tokenSet(
      { tenant_id: TENANT, realm_access: { roles: ['USR_CAND'] } },
      started.transaction?.nonce ?? '',
    );
    revokeBodies = [];
    const callback = await request(http())
      .get(
        `/v1/auth/oidc/callback?code=synthetic-code&state=${encodeURIComponent(started.transaction?.state ?? '')}`,
      )
      .set(
        'Cookie',
        `confora_oidc_tx=${encodeURIComponent(started.sealed ?? '')}; ${sidCookie(sid)}`,
      )
      .redirects(0);
    expect(callback.status).toBe(302);
    expect(revokeBodies).toHaveLength(1);
    expect(
      (await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid))).status,
    ).toBe(401);
    const nextSid = setCookie(callback.headers, 'confora_sid');
    expect(
      (await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(nextSid))).status,
    ).toBe(200);
  });

  it('rejects a form post from a foreign same-site origin and a post with no origin', async () => {
    const sid = await candidateSession();
    const csrf = await sessionCsrf(sid);
    const foreign = await request(http())
      .post('/v1/probe/mutate')
      .set('Cookie', sidCookie(sid))
      .set('Origin', 'http://localhost:3999')
      .set('X-CSRF-Token', csrf)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('a=1');
    expect(foreign.status).toBe(403);
    expect(headerText(parseRecord(JSON.stringify(foreign.body))['error'])).toBe(
      'oidc.origin.rejected',
    );
    const missing = await request(http())
      .post('/v1/probe/mutate')
      .set('Cookie', sidCookie(sid))
      .set('X-CSRF-Token', csrf);
    expect(missing.status).toBe(403);
    expect(headerText(parseRecord(JSON.stringify(missing.body))['error'])).toBe(
      'oidc.origin.rejected',
    );
    expect(
      (await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid))).status,
    ).toBe(200);
    const allowed = await request(http())
      .post('/v1/probe/mutate')
      .set('Cookie', sidCookie(sid))
      .set('Origin', ORIGIN)
      .set('X-CSRF-Token', csrf);
    expect(allowed.status).toBe(201);
    const referer = await request(http())
      .post('/v1/probe/mutate')
      .set('Cookie', sidCookie(sid))
      .set('Referer', `${ORIGIN}/dashboard/profil`)
      .set('X-CSRF-Token', csrf);
    expect(referer.status).toBe(201);
  });

  it('requires the session CSRF token on a cookie-authenticated directory withdrawal', async () => {
    const sid = await candidateSession();
    const credentialId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const path = `/v1/staff/certificates/${credentialId}/directory-consent-withdrawal`;
    const missing = await request(http())
      .post(path)
      .set('Cookie', sidCookie(sid))
      .set('Origin', ORIGIN)
      .send({ holderUserId: credentialId });
    expect(missing.status).toBe(403);
    expect(headerText(parseRecord(JSON.stringify(missing.body))['error'])).toBe(
      'oidc.csrf.rejected',
    );
    const csrf = await sessionCsrf(sid);
    const presented = await request(http())
      .post(path)
      .set('Cookie', sidCookie(sid))
      .set('Origin', ORIGIN)
      .set('X-CSRF-Token', csrf)
      .send({ holderUserId: credentialId });
    expect(presented.status).not.toBe(403);
    expect(headerText(parseRecord(JSON.stringify(presented.body))['error'])).not.toBe(
      'oidc.csrf.rejected',
    );
    expect(
      (await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid))).status,
    ).toBe(200);
  });

  it('rejects a missing, wrong, or other-session csrf token without dropping the session', async () => {
    process.env['OIDC_SESSION_IDLE_SECONDS'] = '30';
    try {
      const sid = await candidateSession();
      const csrf = await sessionCsrf(sid);
      const missing = await request(http())
        .post('/v1/probe/mutate')
        .set('Cookie', sidCookie(sid))
        .set('Origin', ORIGIN);
      expect(missing.status).toBe(403);
      expect(headerText(parseRecord(JSON.stringify(missing.body))['error'])).toBe(
        'oidc.csrf.rejected',
      );
      const wrong = await request(http())
        .post('/v1/probe/mutate')
        .set('Cookie', sidCookie(sid))
        .set('Origin', ORIGIN)
        .set('X-CSRF-Token', 'not-the-session-token');
      expect(wrong.status).toBe(403);
      expect(headerText(parseRecord(JSON.stringify(wrong.body))['error'])).toBe(
        'oidc.csrf.rejected',
      );
      const other = app.get(OidcSessionStore).create({
        accessToken: 'other-access',
        refreshToken: 'other-refresh',
        idToken: 'other-id',
        accessExpiresAt: Date.now() + 60_000,
        displayName: 'Other',
        now: Date.now(),
      });
      const crossed = await request(http())
        .post('/v1/probe/mutate')
        .set('Cookie', sidCookie(sid))
        .set('Origin', ORIGIN)
        .set('X-CSRF-Token', other.csrfToken);
      expect(crossed.status).toBe(403);
      expect(headerText(parseRecord(JSON.stringify(crossed.body))['error'])).toBe(
        'oidc.csrf.rejected',
      );
      const logout = await request(http())
        .post('/v1/auth/oidc/logout')
        .set('Origin', ORIGIN)
        .set('X-CSRF-Token', other.csrfToken)
        .set('Cookie', sidCookie(sid));
      expect(logout.status).toBe(403);
      const still = await request(http()).get('/v1/auth/session').set('Cookie', sidCookie(sid));
      expect(still.status).toBe(200);
      expect(parseRecord(JSON.stringify(still.body))['csrfToken']).toBe(csrf);
      expect(JSON.stringify(still.body)).not.toContain('accessToken');
    } finally {
      process.env['OIDC_SESSION_IDLE_SECONDS'] = '1';
    }
  });

  it('does not start the browser flow when the session secret is missing', async () => {
    const saved = process.env['OIDC_SESSION_SECRET'];
    delete process.env['OIDC_SESSION_SECRET'];
    const response = await request(http()).get('/v1/auth/oidc/login');
    process.env['OIDC_SESSION_SECRET'] = saved;
    expect(response.status).toBe(503);
  });
});
