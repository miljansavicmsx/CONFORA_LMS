#!/usr/bin/env node
/**
 * TD-083 — tenant negative API probes for learner certificate wallet.
 */
import { writeFileSync } from 'node:fs';

const NEST = (process.env.NEST_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const PASSWORD = process.env.PILOT_USER_PASSWORD ?? 'PilotTest!2026';
const CERTIFICANT = 'pilot.learner2@confora.test';
const CANDIDATE = 'pilot.learner@confora.test';
const WRONG_TENANT = 'pilot.wrong-tenant@confora.test';
const NO_TENANT = 'pilot.no-tenant@confora.test';
const SEED_UID = 'CON-PILOT-000082';

const FORBIDDEN = /tenantId|userId|applicationId|pdfStorageKey|withdrawnReason|digitalSignature|nationalId|jmbg|committee/i;

async function login(email) {
  const res = await fetch(`${NEST}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username: email, password: PASSWORD }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function wallet(token) {
  const res = await fetch(`${NEST}/v1/me/certificates`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

const results = [];

function record(id, pass, detail) {
  results.push({ id, pass, detail });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`);
}

async function main() {
  const anon = await wallet('');
  record('anonymous_denied', anon.status === 401, `status=${anon.status}`);

  const noTenantLogin = await login(NO_TENANT);
  const noTenantToken = noTenantLogin.body?.access_token ?? noTenantLogin.body?.accessToken;
  const noTenantWallet = await wallet(noTenantToken);
  record(
    'no_tenant_denied',
    noTenantWallet.status === 403,
    `status=${noTenantWallet.status}`,
  );

  const wrongLogin = await login(WRONG_TENANT);
  const wrongToken = wrongLogin.body?.access_token ?? wrongLogin.body?.accessToken;
  const wrongWallet = await wallet(wrongToken);
  const wrongItems = Array.isArray(wrongWallet.body?.items) ? wrongWallet.body.items : [];
  const wrongLeak = wrongItems.some((i) => i.certificateId === SEED_UID || i.publicNumber === SEED_UID);
  record(
    'wrong_tenant_safe_response',
    wrongWallet.status !== 500 && (wrongWallet.status === 403 || wrongWallet.status === 404 || wrongItems.length === 0),
    `status=${wrongWallet.status} items=${wrongItems.length}`,
  );
  record('wrong_tenant_no_leakage', !wrongLeak, `leak=${wrongLeak}`);

  const candLogin = await login(CANDIDATE);
  const candToken = candLogin.body?.access_token ?? candLogin.body?.accessToken;
  const candWallet = await wallet(candToken);
  const candItems = Array.isArray(candWallet.body?.items) ? candWallet.body.items : [];
  const candLeak = candItems.some((i) => i.certificateId === SEED_UID || i.publicNumber === SEED_UID);
  record('other_candidate_scope', !candLeak, `items=${candItems.length} leak=${candLeak}`);

  const certLogin = await login(CERTIFICANT);
  const certToken = certLogin.body?.access_token ?? certLogin.body?.accessToken;
  const certWallet = await wallet(certToken);
  record(
    'privacy_no_forbidden_keys',
    !FORBIDDEN.test(JSON.stringify(certWallet.body)),
    'wallet payload clean',
  );

  const outPath = process.argv[2];
  if (outPath) {
    writeFileSync(outPath, JSON.stringify({ results }, null, 2));
  }

  const failed = results.filter((r) => !r.pass);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
