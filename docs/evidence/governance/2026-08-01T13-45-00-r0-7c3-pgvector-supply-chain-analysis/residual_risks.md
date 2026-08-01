# Residual risks

| Risk | Severity | Mitigation path |
|------|----------|-----------------|
| Mutable `pg16` retarget without notice | HIGH (supply chain) | Owner-approved digest pin (R0-7C4) |
| Local image ID confused with registry digest | HIGH if mis-pinned | Taxonomy in this package; forbid `{LOCAL_ID}` |
| Extension available but never enabled in CI | MEDIUM | Explicit validation step |
| Attestations present but unverified | MEDIUM | Later signed-image policy |
| Upstream moves to newer vector (e.g. 0.8.6) while CI stays on 0.8.2 pin | LOW/MEDIUM | Deliberate pin updates |
