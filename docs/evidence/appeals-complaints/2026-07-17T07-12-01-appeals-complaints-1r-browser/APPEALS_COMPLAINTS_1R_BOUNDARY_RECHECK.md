# Boundary recheck

| Boundary | Result |
|----------|--------|
| žalba ≠ prigovor | **PRESERVED** (separate tabs/dialogs + notices) |
| appeal ≠ complaint | **PRESERVED** |
| contact ≠ appeal/complaint | **PRESERVED** (`/dashboard/support`) |
| exam result / pass ≠ certified | **unchanged** (no exam/cert mutation in flow) |
| exam ≠ certification decision | **unchanged** |
| certification decision ≠ certificate issuance | **unchanged** |
| certificate lifecycle | **unchanged** |
| public verification | **unchanged** |
| reports/export | **unchanged** |
| RBAC / tenant / privacy / audit | **not weakened** |

Appeal submit requiring a decision UUID was not completed (fixture absent); dialog UX and labels were confirmed without mutating certification state.
