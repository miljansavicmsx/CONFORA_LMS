# Identities

| Ref | SHA | Role |
|-----|-----|------|
| `origin/fix/ca-h01-frontend-f4-cutover` | `4090be85a0f8e423d199610f82e3949c899cc90b` | Integration / analysis base |
| `feature/028d-2ar-candidate-complaint-filing` | `4090be85…` (no commits above base) | Stopped pre-flight |
| `ci/r0-7d2-accessibility-baseline` | `13cdd75280206ec00587e5455b7c76bf7d75e269` | Rejected — preferred inspect tip |
| `ci/r0-7d2s2-manifest-locked-public-slice` | `fda8d363ceccabd16403f20f4caf5ffc3e530832` | Rejected — incomplete vs D2 for several complaint deps |

## Checks performed

- Stopped branch tip equals integration tip (no implementation commits).
- Neither rejected tip is an ancestor of the analysis branch.
- TD-006 present and open in `docs/TECHNICAL_DEBT_REGISTER.md` (not modified by this task).
