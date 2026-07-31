# Local boot validation

## Broken command (current workflow semantics)

```text
docker create ... --health-cmd pg_isready -U confora -d confora IMAGE
```

**Result:** `unknown shorthand flag: 'U' in -U` — exit **125**

## Quoted command (R0-7C2 repair)

```text
docker create ... --health-cmd "pg_isready -U confora -d confora" ... IMAGE
```

**Result:** create exit **0**; start OK; health status **healthy**; `pg_isready -U confora -d confora` exit **0**

## Cleanup

Temporary containers `r07c2-broken-test` / `r07c2-fixed-test` removed.

## Classification

| Finding | Class |
|---------|-------|
| Exit 125 with unquoted `-U` | reproduced Docker behavior |
| Healthy after quoting | reproduced Docker behavior |
| Image retained | owner decision |
| No CREATE EXTENSION run | owner decision / deferred R0-7C3 |
