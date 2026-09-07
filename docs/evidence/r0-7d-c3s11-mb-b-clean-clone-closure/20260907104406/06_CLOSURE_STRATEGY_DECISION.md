# Closure Strategy Decision

C3S11_GENERATED_ARTIFACT_POLICY = GENERATED_DIST_MUST_REMAIN_GITIGNORED_AND_REGENERATED_VIA_PACKAGE_BUILD

Authority:

1. .gitignore packages/\*\*/dist/
2. ENGINEERING_CONSTITUTION regenerate-through-owning-tool rule
3. turbo build outputs treat dist as generated cache outputs
4. No committed rule requiring checked-in packages dist

TRACK_GENERATED_OUTPUTS_GOVERNANCE_PROVEN = false
TRACK_GENERATED_OUTPUTS = REJECTED

SOURCE_EXPORT_RESOLUTION = REJECTED_FOR_MD17
Reason: styles.css export is minified Tailwind output, not raw src/styles.css.

C3S11_CLOSURE_STRATEGY = GENERATE_BEFORE_CONSUME

Implementation mechanism:

1. Fix packages/ui build to call tailwindcss directly and force tsc rebuild
2. Force i18n tsc rebuild and contract tests
3. frontend-app prelint:all/prebuild ensure:confora-packages builds UI then i18n before consume
4. Widen createConforaI18n lng option typing to string to avoid revealed TS2322 noise when dist types become available

STRATEGY_GOVERNANCE_COMPATIBLE = true
