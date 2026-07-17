# APPEALS-COMPLAINTS-FINAL — Residual Risks

## Deferred product / governance work

1. **Full B14/B15 resolution UI** — admissibility, evidence pack, triage, investigation, formal decision, remedy/action with domain linkages. Staff screen documents this as deferred.
2. **Segregation-of-duties depth for formal decisions** — when full pipeline UI ships, SoD between appeal handling and certification decision must remain enforced.
3. **Staff MFA accounts for browser** — director/manager Nest login may require MFA locally; 2R used `pilot.sysadmin@confora.test` for password-only Nest login. MFA-ready staff browser coverage is a residual ops concern, not a module NO-GO for this rollup.
4. **Appeal submit fixture dependency** — 1R appeal submit requires a related decision UUID when exercising full submit path; complaint submit was confirmed in browser without that fixture.

## Explicit non-claims (do not treat as approved)

| Claim | Status |
|-------|--------|
| External pilot approved | **false / not claimed** |
| Security delegate signed | **false / not claimed** |
| DPO / legal signed | **false / not claimed** |
| Production ready | **not claimed** |
| Staging ready | **not claimed** |

## Operational residuals

- Local stack / Playwright env required to re-run browser ops (`PLAYWRIGHT_PILOT_PASSWORD`, optional `PLAYWRIGHT_STAFF_EMAIL`).
- Superseded failed evidence folders must not be cited as GO.
- Contact/support RBAC for some staff roles may differ from appeals staff allow-list; contact remains a separate module.

## Risk to boundaries

No residual evidence in the GO chain indicates a merge of appeal/complaint, conversion of contact into grievance, or certification/exam/certificate mutation by this module.
