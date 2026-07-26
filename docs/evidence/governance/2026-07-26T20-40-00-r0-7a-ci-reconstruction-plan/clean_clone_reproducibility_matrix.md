# Clean-clone reproducibility matrix

Classification vocabulary enforced. Directory existence ≠ reproducibility.

See `clean_clone_reproducibility_matrix.json` for machine-readable rows.

Summary:

| Class | Count (approx) | Examples |
|-------|----------------|----------|
| TRACKED_BUT_BROKEN | 1 | frozen pnpm install |
| BLOCKED_BY_INSTALL | 2+ | lint/typecheck/test/build |
| BLOCKED_BY_SERVICE | 1 | pgvector create exit 125 |
| REFERENCES_UNTRACKED_PATH | many | database package, e2e, Dockerfiles, Next apps |
| REFERENCES_MISSING_SCRIPT | 1 | scripts/a11y |
| LEGACY_ONLY | 2 | backend pytest; a11y FastAPI compose |
| GENERATED_INPUT_REQUIRED | 1 | frontend-app npm ci without tracked lock |
| REPRODUCIBLE_TRACKED | 1 | deploy-backend fail-closed gate |
