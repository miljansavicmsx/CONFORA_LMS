import { Injectable } from '@nestjs/common';

import { createOpaqueId, sessionExpiryReason, type SessionExpiry } from './oidc-crypto';

export type OidcSessionRecord = {
  id: string;
  csrfToken: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  accessExpiresAt: number;
  displayName: string;
  createdAt: number;
  lastSeenAt: number;
};

@Injectable()
export class OidcSessionStore {
  private readonly sessions = new Map<string, OidcSessionRecord>();

  create(
    input: Omit<OidcSessionRecord, 'id' | 'csrfToken' | 'createdAt' | 'lastSeenAt'> & {
      readonly now: number;
    },
  ): OidcSessionRecord {
    const record: OidcSessionRecord = {
      id: createOpaqueId(),
      csrfToken: createOpaqueId(),
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      idToken: input.idToken,
      accessExpiresAt: input.accessExpiresAt,
      displayName: input.displayName,
      createdAt: input.now,
      lastSeenAt: input.now,
    };
    this.sessions.set(record.id, record);
    return record;
  }

  read(id: string): OidcSessionRecord | null {
    return this.sessions.get(id) ?? null;
  }

  expiry(
    record: OidcSessionRecord,
    now: number,
    idleSeconds: number,
    absoluteSeconds: number,
  ): SessionExpiry | null {
    return sessionExpiryReason(record, now, idleSeconds, absoluteSeconds);
  }

  touch(id: string, now: number): void {
    const record = this.sessions.get(id);
    if (record) {
      record.lastSeenAt = now;
    }
  }

  replaceTokens(
    id: string,
    tokens: Pick<OidcSessionRecord, 'accessToken' | 'refreshToken' | 'idToken' | 'accessExpiresAt'>,
    now: number,
  ): OidcSessionRecord | null {
    const record = this.sessions.get(id);
    if (!record) {
      return null;
    }
    record.accessToken = tokens.accessToken;
    record.refreshToken = tokens.refreshToken;
    record.idToken = tokens.idToken;
    record.accessExpiresAt = tokens.accessExpiresAt;
    record.lastSeenAt = now;
    return record;
  }

  delete(id: string): void {
    this.sessions.delete(id);
  }
}
