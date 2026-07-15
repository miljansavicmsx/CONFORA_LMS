# TD-085-S17-R1 Residual Risks

1. **Transient infra on admin-gov / f4-9** — TD-085 is `GO_WITH_TRANSIENT_INFRA_NOTE`; not blocking privacy baseline restore but not a clean 6/6 PASS.

2. **Port :3001 app identity** — Future TD-085/S17 runs must start **frontend-app**, not `apps/admin`.

3. **MFA password-grant vs smoke smokes** — Enrolled external-ready staff correctly block password-only login; ops harnesses must stay MFA-aware (as f5-3 now is) or use dedicated local MFA fixtures.

4. **ops:public-ux-1r3 / cert-ops-1r** — Still FAIL inside S17 nested bundle (same as historical GO runs); do not treat as PII leak when API privacy is clean.

5. **Governance claims** — External pilot / security delegate / DPO / real PII / staging / production remain unsigned / not approved.
