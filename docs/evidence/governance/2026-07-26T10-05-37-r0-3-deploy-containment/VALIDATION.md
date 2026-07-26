# Validation commands and results

## YAML syntax

```text
python -c "import yaml; yaml.safe_load(open(r'.github/workflows/deploy-backend.yml',encoding='utf-8')); print('YAML_OK')"
→ YAML_OK
```

`actionlint` was not installed in this environment; PyYAML parse used as syntax validation.

## Trigger analysis

```text
on_keys= ['workflow_dispatch']
has_push= False
has_dispatch= True
environment= {'name': 'production', 'url': 'https://api.confora.io'}
```

## Tracked-path gate simulation

```text
tracked_backend_files=0
GATE_WOULD_FAIL_CLOSED=true (expected today)
```

## Scope verification

```text
Changed workflows (git diff --name-only -- .github/workflows):
  .github/workflows/deploy-backend.yml

Application / schema / migration / runtime config:
  not modified (R0-3 allowlist)
```

## Git status (scope)

See `git_status_scope.txt` and `git_status_after_tracked.txt`.

Expected: modification to `deploy-backend.yml` plus untracked evidence folder files under this path.
