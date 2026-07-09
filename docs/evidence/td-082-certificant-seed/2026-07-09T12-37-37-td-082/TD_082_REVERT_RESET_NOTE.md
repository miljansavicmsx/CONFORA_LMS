# TD-082 Revert / Reset Note

## Preferred — idempotent reset script

```powershell
pnpm exec tsx scripts/ops/seed-pilot-certificant-wallet.ts --reset
```

Deletes:

- `cert.recertification_cases` row `r8200001-0000-4000-8000-000000000001`
- `cert.certificates` row `b8200001-0000-4000-8000-000000000001`

Does **not** remove pilot users or `USR_CERT` role assignment.

## Full local refresh

1. Restore DB snapshot or `prisma migrate deploy` on clean DB
2. `pnpm exec prisma db seed`
3. `pnpm exec tsx scripts/ops/seed-pilot-auth-users.ts`
4. (Optional) `pnpm exec tsx scripts/ops/seed-pilot-certificant-wallet.ts`

## Manual SQL (if script unavailable)

```sql
DELETE FROM cert.recertification_cases WHERE id = 'r8200001-0000-4000-8000-000000000001';
DELETE FROM cert.certificates WHERE id = 'b8200001-0000-4000-8000-000000000001';
-- or: WHERE uid = 'CON-PILOT-000082';
```

Do not delete decided production certificates or audit rows without governance approval.

## Pre-TD-082 manual USR_CERT grant

If a manual `user_roles` insert was applied to `pilot.learner` for testing, revert with:

```sql
DELETE FROM auth.user_roles
WHERE user_id = 'b2000000-0000-4000-8000-000000000001'
  AND role_id = (SELECT id FROM auth.roles WHERE code = 'USR_CERT');
```

TD-082 does not require this — certificant role belongs on `pilot.learner2` only.

## Secrets

No passwords, tokens, or credentials stored in evidence artifacts.
