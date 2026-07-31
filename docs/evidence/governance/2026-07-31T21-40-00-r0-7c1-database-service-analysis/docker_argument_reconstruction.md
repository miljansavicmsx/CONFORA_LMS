# Docker argument reconstruction

## GitHub Actions serialization

Folded block scalar `>-` joins lines with spaces. Effective options string:

```text
--health-cmd pg_isready -U confora -d confora --health-interval 10s --health-timeout 5s --health-retries 10
```

## How Docker receives it

`docker create` argv (conceptually):

```text
docker create ... --health-cmd pg_isready -U confora -d confora ... IMAGE
```

Docker CLI parses `-U` as **create** option shorthand → error.

## Exact observed error

```text
unknown shorthand flag: 'U' in -U
Exit code 125
```

## Correct form

```text
--health-cmd "pg_isready -U confora -d confora"
```

or equivalent JSON/CMD array form if ever supported by GHA options.

YAML quoting recommendation for R0-7C2:

```yaml
options: >-
  --health-cmd "pg_isready -U confora -d confora"
  --health-interval 10s
  --health-timeout 5s
  --health-retries 10
```

Shell expansion of workflow values is not required for this failure; the defect
is **tokenization / missing quotes**, not secret interpolation.
