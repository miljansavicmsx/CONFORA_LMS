# 12_MUTATION_AND_TOPOLOGY

## Base and source

- Base SHA: `32ac270e256720b447450913d7e301c1d905ab47`
- Source commit SHA: `2b1399a6018843768404479fbff93abc93b7bbce`
- Source parent: `32ac270e256720b447450913d7e301c1d905ab47`
- Source message: `fix(frontend-app): restore Vite/Vitest validation bootstrap (CSP + setup)`
- Source changed path count: 6
- Evidence paths in source commit: 0

## Post-source immutability

- Non-evidence paths frozen after source commit
- No amend; no rebase; no third fix commit

## Topology (intended)

```
32ac270e (base)
  -> 2b1399a (source, 6 paths)
    -> <evidence-commit> (15 evidence paths)
```

Evidence commit SHA is recorded in `14_EVIDENCE_MANIFEST.md` after the evidence commit exists. This file does not invent that SHA before commit.

## Forbidden operations

- No force push
- No direct push to integration
- No PR creation
- No merge
