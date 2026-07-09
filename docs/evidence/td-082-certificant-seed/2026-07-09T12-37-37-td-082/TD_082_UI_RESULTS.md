# TD-082 UI Results

## Expected behavior (after seed + login as `pilot.learner2@confora.test`)

| Check | Expected |
|-------|----------|
| `/dashboard/my-recertifications` loads selector without `?certificateId=` | PASS — auto-select when single eligible cert |
| Seeded certificate visible | `CON-PILOT-000082` / scheme title in select |
| User can select certificate | Select control + summary panel |
| CPD hours input | Visible when recert case OPEN; patch via Nest API |
| Empty state preserved | `pilot.learner` (no cert seed) → empty selector |
| Fallback hint | Only when `?certificateId=` used |

## Automated UI tests

```
vitest: certificate-selector.test.ts + certificate-selector.test.tsx → 8 passed
```

## Browser verification

Not executed in CI sandbox (no running stack). Manual check: run seed chain, `npm run dev:api:pilot`, login as certificant, open recertifications page.

## Fallback status

Primary path = API list. `?certificateId=CON-PILOT-000082` remains dev fallback only.
