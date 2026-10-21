# INCIDENT-2026-10-21 — Personnel VC signing key

**Status:** key declared compromised. Do not use it again.

## What happened

An Ed25519 PKCS#8 private key was committed in `apps/api/src/personnel/personnel-vc.ts` and used as the fallback signer for personnel verifiable credentials and as the HMAC secret for PDF download tickets. A private key in the repository is burned. The source no longer contains that key.

Public SPKI SHA-256 of the burned key:

`d2670e69c07fdf187aed6ebefc513bb4ca582cd1a5d2fcc50ff1f441c50b3b76`

The signer refuses any configured key whose public SPKI hash matches that value (`VC_KEY_DENIED`). The same refusal applies if the PDF ticket secret hashes to the burned PEM. The private bytes are not stored in the denylist.

## Replacement

`PERSONNEL_VC_ED25519_PKCS8_PEM` is required outside tests. Generate it only in the environment or a secret store. Do not commit it.

`PERSONNEL_PDF_TICKET_SECRET` is a separate secret for PDF download links. It is not the signing key.

Tests generate an ephemeral Ed25519 key and an ephemeral ticket secret at runtime when those variables are unset. That ephemeral key is not a trust anchor and must not be copied into an environment.

## Where the burned key was used

Repository search after removal:

- The only committed copy was the development fallback in `personnel-vc.ts`.
- `scripts/ops/seed-exam-demo.ts` calls the signer for a local demo credential. It now refuses to run unless `PERSONNEL_VC_ED25519_PKCS8_PEM` is set, and the denylist still rejects the burned key.
- No tracked environment file, workflow, or seed contains the private key.
- No production issuance path is connected. Credentials signed with the fallback exist only if someone ran tests or the local demo seed before this change.

Treat every credential and PDF ticket produced before this change as signed or authenticated with the burned key.

## Re-issue and re-verification

1. Load each personnel credential JWT.
2. If `wasSignedWithBurnedKey` verifies the signature against the burned public key, the credential is in scope.
3. Revoke it on the status list: transition the credential to `WITHDRAWN` through the existing lifecycle path so the status-list bit is set. Revocation does not rewrite history.
4. Re-issue a new credential with a new key from the secret store, a new credential id, and the holder name from the verified identity record. Do not reuse the burned key.
5. Tell the holder that the previous document is withdrawn and give them the replacement. Public verification of the old number must show withdrawn, not valid.
6. PDF download tickets issued with the old secret are invalid. Issue a new ticket from `PERSONNEL_PDF_TICKET_SECRET`.

A signature that does not verify under the burned public key was not produced by that key. Do not revoke it for this incident.
