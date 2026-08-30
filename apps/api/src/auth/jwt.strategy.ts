import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  deriveMfaVerified,
  parseRolesFromPayload,
  type ConforaJwtPayload,
} from '@confora/shared-types';
import { ExtractJwt, Strategy, type StrategyOptionsWithoutRequest } from 'passport-jwt';
import jwksRsa, { type SigningKey } from 'jwks-rsa';
import { decode as decodeJwt } from 'jsonwebtoken';

import { loadAuthConfig, type AuthConfig } from './auth-config';
import type { AuthenticatedActor } from './request-principal';
import { resolveCanonicalUser } from './resolve-db-user';
import { PrismaService } from '../prisma/prisma.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createJwksClient(jwksUri: string) {
  return jwksRsa({
    jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600_000,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    timeout: 5_000,
  });
}

function signingKeyToPem(key: SigningKey): string {
  return key.getPublicKey();
}

/**
 * Secret provider with OD-17 unknown-kid policy:
 * refresh/requery JWKS once, then fail closed if key still unavailable.
 */
function createSecretOrKeyProvider(jwksUri: string) {
  const cachedClient = createJwksClient(jwksUri);
  const refreshClient = jwksRsa({
    jwksUri,
    cache: false,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    timeout: 5_000,
  });

  return (
    _request: unknown,
    rawJwtToken: string,
    done: (err: Error | null, secretOrKey?: string | Buffer) => void,
  ): void => {
    let kid: string | undefined;
    try {
      const decoded = decodeJwt(rawJwtToken, { complete: true });
      if (decoded === null || typeof decoded === 'string') {
        done(null);
        return;
      }
      kid = decoded.header.kid;
      if (decoded.header.alg !== 'RS256') {
        done(null);
        return;
      }
    } catch {
      done(null);
      return;
    }

    cachedClient
      .getSigningKey(kid)
      .then((key) => {
        done(null, signingKeyToPem(key));
      })
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        if (error.name !== 'SigningKeyNotFoundError') {
          done(error);
          return;
        }
        refreshClient
          .getSigningKey(kid)
          .then((refreshed) => {
            done(null, signingKeyToPem(refreshed));
          })
          .catch((refreshErr: unknown) => {
            done(refreshErr instanceof Error ? refreshErr : new Error(String(refreshErr)));
          });
      });
  };
}

function buildStrategyOptions(config: AuthConfig): StrategyOptionsWithoutRequest {
  return {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKeyProvider: createSecretOrKeyProvider(config.jwksUri),
    algorithms: ['RS256'],
    issuer: config.oidcIssuerUrl,
    audience: config.oidcClientId,
    ignoreExpiration: false,
    passReqToCallback: false,
    jsonWebTokenOptions: {
      algorithms: ['RS256'],
      issuer: config.oidcIssuerUrl,
      audience: config.oidcClientId,
      ignoreExpiration: false,
      ignoreNotBefore: false,
      clockTolerance: 30,
    },
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly config: AuthConfig;

  constructor(private readonly prisma: PrismaService) {
    const config = loadAuthConfig();
    super(buildStrategyOptions(config));
    this.config = config;
  }

  async validate(payload: ConforaJwtPayload): Promise<AuthenticatedActor> {
    if (payload.iss !== this.config.oidcIssuerUrl) {
      throw new UnauthorizedException('Invalid issuer.');
    }

    const subject = typeof payload.sub === 'string' ? payload.sub.trim() : '';
    if (!subject) {
      throw new UnauthorizedException('Missing subject.');
    }

    if (typeof payload.exp !== 'number') {
      throw new UnauthorizedException('Missing exp.');
    }

    const tenantIdRaw = typeof payload.tenant_id === 'string' ? payload.tenant_id.trim() : '';
    if (!tenantIdRaw) {
      throw new UnauthorizedException('Missing tenant_id.');
    }
    if (!UUID_RE.test(tenantIdRaw)) {
      throw new UnauthorizedException('Invalid tenant_id.');
    }

    const user = await resolveCanonicalUser(this.prisma, {
      tenantId: tenantIdRaw,
      issuer: payload.iss,
      subject,
    });

    return {
      userId: user.userId,
      tenantId: user.tenantId,
      issuer: payload.iss,
      subject,
      email: user.email,
      roles: parseRolesFromPayload(payload),
      mfaVerified: deriveMfaVerified(payload),
    };
  }
}
