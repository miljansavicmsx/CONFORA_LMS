# Planning Risk Register

| ID | Risk | Severity | Control and owner gate | Status |
|---|---|---|---|---|
| R07E-R1 | Green lanes hide missing packages | High | Explicit allowlist, missing-authority lane, OD-R07E-2 | Open |
| R07E-R2 | Policy check represented as ISO conformity | Critical | Separate names/claims, negative tests, OD-R07E-5 | Open |
| R07E-R3 | Rejected R0-7D history promoted wholesale | High | Forward-only closure, OD-R07E-4 | Open |
| R07E-R4 | Local database files become authority | Critical | Prohibit promotion; OD-R07E-3 | Open |
| R07E-R5 | Operational frontend omitted from quality | High | Transitional lane and deterministic prerequisite | Open |
| R07E-R6 | Incomplete API reported healthy | High | Package allowlist and explicit incomplete status | Open |
| R07E-R7 | Mutable actions or tools introduce drift | Medium | Immutable SHA/checksum, OD-R07E-8 | Open |
| R07E-R8 | Missing debt register breaks validation | High | Separate restoration or explicit blocker | Open |
| R07E-R9 | F4 expands R0-7E silently | Medium | Separate prerequisite, OD-R07E-6 | Open |
| R07E-R10 | CI work uses production deployment/secrets | Critical | Containment, zero-deploy gate, stop condition | Open |
