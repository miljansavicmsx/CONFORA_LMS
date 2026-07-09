#!/usr/bin/env node
/**
 * TD-082-LIVE-SEED-VERIFY-1 — API probes for certificant wallet.
 */
const NEST = (process.env.NEST_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const PASSWORD = process.env.PILOT_USER_PASSWORD ?? 'PilotTest!2026';
const CERTIFICANT = 'pilot.learner2@confora.test';
const CANDIDATE = 'pilot.learner@confora.test';
const WRONG_TENANT = 'pilot.wrong-tenant@confora.test';

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

function record(id, pass, detail, extra = {}) {
  results.push({ id, pass, detail, ...extra });
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${id}: ${detail}`);
}

async function main() {
  const anon = await wallet('');
  record('anonymous_denied', anon.status === 401, `status=${anon.status}`);

  const certLogin = await login(CERTIFICANT);
  const certToken = certLogin.body?.access_token ?? certLogin.body?.accessToken;
  record('certificant_login', (certLogin.status === 200 || certLogin.status === 201) && Boolean(certToken), `status=${certLogin.status}`);

  const certWallet = await wallet(certToken);
  const items = Array.isArray(certWallet.body?.items) ? certWallet.body.items : [];
  const hit = items.find(
    (i) =>
      i.certificateId === 'CON-PILOT-000082' ||
      i.publicNumber === 'CON-PILOT-000082' ||
      i.certificateNumber === 'CON-PILOT-000082',
  );
  record(
    'certificant_non_empty_wallet',
    certWallet.status === 200 && items.length > 0,
    `items=${items.length}`,
  );
  record(
    'seed_certificate_present',
    Boolean(hit),
    hit ? `uid=${hit.certificateId}` : 'missing CON-PILOT-000082',
  );
  record(
    'selector_fields',
    Boolean(hit?.schemeTitle && hit?.issuedAt != null && hit?.publicNumber),
    hit
      ? `schemeTitle=${hit.schemeTitle} cpdEligible=${hit.cpdEligible} recertEligible=${hit.recertificationEligible}`
      : 'n/a',
  );
  record(
    'cpd_eligible',
    hit?.cpdEligible === true || hit?.recertificationEligible === true,
    `cpd=${hit?.cpdEligible} recert=${hit?.recertificationEligible}`,
  );
  record(
    'privacy_no_forbidden_keys',
    !FORBIDDEN.test(JSON.stringify(certWallet.body)),
    'forbidden pattern absent',
  );

  const candLogin = await login(CANDIDATE);
  const candToken = candLogin.body?.access_token ?? candLogin.body?.accessToken;
  const candWallet = await wallet(candToken);
  const candItems = Array.isArray(candWallet.body?.items) ? candWallet.body.items : [];
  const leak = candItems.some((i) => i.certificateId === 'CON-PILOT-000082' || i.publicNumber === 'CON-PILOT-000082');
  record(
    'other_candidate_scope',
    !leak,
    `learner items=${candItems.length} leak=${leak}`,
  );

  const wrongLogin = await login(WRONG_TENANT);
  const wrongToken = wrongLogin.body?.access_token ?? wrongLogin.body?.accessToken;
  const wrongWallet = await wallet(wrongToken);
  const wrongItems = Array.isArray(wrongWallet.body?.items) ? wrongWallet.body.items : [];
  const wrongLeak = wrongItems.some((i) => i.certificateId === 'CON-PILOT-000082');
  record(
    'wrong_tenant_scope',
    (wrongWallet.status === 403 || wrongWallet.status === 404 || (wrongWallet.status === 200 && !wrongLeak)) &&
      wrongWallet.status !== 500,
    `status=${wrongWallet.status} items=${wrongItems.length} leak=${wrongLeak}`,
  );

  const outPath = process.argv[2];
  if (outPath) {
    const fs = await import('node:fs');
    fs.writeFileSync(outPath, JSON.stringify({ results, certWallet: certWallet.body }, null, 2));
  }

  const failed = results.filter((r) => !r.pass);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
