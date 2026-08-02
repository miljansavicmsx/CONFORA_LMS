# Architecture decision (implementation)

## Chosen path

`OPTION_C_DIRECT_SUBMIT_LEARNER_COMPLAINT` on branch rooted at planning tip `dd43c8b1830b3d96243d69b639a167bc80af4498`.

## Promotion method

Per-file `git checkout 13cdd752… -- <path>` for the non-RBAC complaint support set, then:

1. Slim `auth-token-provider.ts` to `auth-storage` only.
2. Slim `auth-refresh.ts` to legacy Bearer refresh only (exclude `nest-auth-pilot` / `auth-client`).
3. Rewire `FormalComplaintDialog` → `submitLearnerComplaint`.
4. Rewire learner page list → `listLearnerComplaints`; defer appeal CTA.

## Why HTTP stack modules were promoted

Tracked `complaints-client.ts` already depends on `getHttpClient` / `api-provider` / `api-error`. Owner Option C forbids inventing a **second** stack; path-checkout of the existing D2 modules is the authorized closure. §2.3 “rejected generic” prohibition is interpreted as: do not invent parallel infrastructure and do not pull RBAC/pilot fan-out — not as a ban on the single existing stack the tracked client already requires.

## Explicitly not promoted

- `api-grievances.ts`
- `authStore.ts` / `jwt-payload.ts` / `content-editor-access.ts` and the 18 RBAC access modules
- `auth-client.ts` (pilot path)
- `inactive-feature-visibility.ts`
- `types/lms-stores.ts`
