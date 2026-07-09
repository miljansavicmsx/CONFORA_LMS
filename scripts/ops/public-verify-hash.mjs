/**
 * TD-083 — Resolve a public verification hash for local ops runners.
 * Prefers PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH when API-valid; otherwise probes DB candidates.
 */

export const PRECONDITION_FAILED_FIXTURE_MISSING = 'PRECONDITION_FAILED_FIXTURE_MISSING';

const HASH_RE = /^[0-9a-f]{64}$/i;

export function isPublicVerifyHash(value) {
  return typeof value === 'string' && HASH_RE.test(value.trim());
}

export async function probePublicVerifyHash(nestApiUrl, hash) {
  const trimmed = hash?.trim();
  if (!isPublicVerifyHash(trimmed)) {
    return { ok: false, status: 0, valid: false };
  }
  const base = (nestApiUrl ?? 'http://localhost:4000').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/public/verify/${trimmed}`, {
      signal: AbortSignal.timeout(15_000),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, valid: body?.valid === true };
  } catch {
    return { ok: false, status: 0, valid: false };
  }
}

export function listDbVerificationHashes(runPsql) {
  const sql = `SELECT verification_hash
FROM cert.certificates
WHERE verification_hash IS NOT NULL
  AND status IN ('ACTIVE', 'ISSUED')
ORDER BY CASE status WHEN 'ACTIVE' THEN 0 ELSE 1 END,
         issued_at DESC NULLS LAST
LIMIT 20;`;
  const raw = runPsql(sql);
  if (!raw) return [];
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => isPublicVerifyHash(line));
}

/**
 * @returns {{ hash: string, source: 'env'|'db' } | { error: string, detail: string }}
 */
export async function resolvePublicVerifyHash({
  nestApiUrl = process.env.NEST_API_URL ?? 'http://localhost:4000',
  envHash = process.env.PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH,
  runPsql,
  probeFn = probePublicVerifyHash,
} = {}) {
  const fromEnv = envHash?.trim();
  if (fromEnv) {
    if (!isPublicVerifyHash(fromEnv)) {
      return {
        error: PRECONDITION_FAILED_FIXTURE_MISSING,
        detail: 'PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH is not a 64-char hex hash',
      };
    }
    const probe = await probeFn(nestApiUrl, fromEnv);
    if (probe.valid) {
      return { hash: fromEnv, source: 'env' };
    }
    return {
      error: PRECONDITION_FAILED_FIXTURE_MISSING,
      detail: `Configured verify hash failed API probe (status=${probe.status})`,
    };
  }

  if (!runPsql) {
    return {
      error: PRECONDITION_FAILED_FIXTURE_MISSING,
      detail: 'No PLAYWRIGHT_PUBLIC_UX_1_VERIFY_HASH and no DB probe available',
    };
  }

  const candidates = listDbVerificationHashes(runPsql);
  for (const candidate of candidates) {
    const probe = await probeFn(nestApiUrl, candidate);
    if (probe.valid) {
      return { hash: candidate, source: 'db' };
    }
  }

  return {
    error: PRECONDITION_FAILED_FIXTURE_MISSING,
    detail:
      candidates.length === 0
        ? 'No verification_hash rows in cert.certificates'
        : `No DB verification hash returned valid=true (${candidates.length} probed)`,
  };
}
