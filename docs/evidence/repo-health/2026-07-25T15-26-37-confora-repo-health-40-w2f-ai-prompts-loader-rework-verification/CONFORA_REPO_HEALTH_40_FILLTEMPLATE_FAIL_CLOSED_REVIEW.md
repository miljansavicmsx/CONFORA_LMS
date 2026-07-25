# CONFORA REPO HEALTH 40 — fillTemplate Fail-Closed Review

## Checks 19–26

| # | Check | Result |
|---|-------|--------|
| 19 | Rejects triple braces `{{{` | **PASS** — `TRIPLE_BRACE_RE`; error mentions SafeString-style |
| 20 | Rejects placeholders not in `allowedPlaceholders` when provided | **PASS** |
| 21 | Rejects missing required placeholder values | **PASS** |
| 22 | Rejects leftover `{{...}}` after replacement | **PASS** — `LEFTOVER_RE` |
| 23 | Extra vars ignored safely | **PASS** — only template placeholders interpolated |
| 24 | Values string/number/boolean only; deterministic `String(...)` | **PASS** — `toPlainString`; objects rejected |
| 25 | No SafeString / raw HTML / raw object passthrough | **PASS** |
| 26 | Per-prompt placeholder map explicit | **PASS** — `AI_PROMPT_PLACEHOLDERS_V1` |

### Per-prompt placeholders

| Prompt ID | Allowed placeholders |
|-----------|----------------------|
| `chat.educational` | `context`, `user_message` |
| `chat.support` | `user_message` |
| `question.generate` | `blueprint`, `constraints` |
| `risk.suggest` | `audit_events_last_30d`, `complaints_by_subject`, `instruction` |
| `default` | `user_message` |

`fillPromptUserTemplateV1` loads the bundle and fills with that prompt’s allowlist.

## Test coverage (relevant)

- replaces allowlisted placeholders  
- rejects missing required variables  
- rejects triple braces  
- rejects unknown placeholder vs explicit allowlist  
- ignores extra vars  
- `fillPromptUserTemplateV1` allowlist + missing `context`

## Verdict

**fill_template_fail_closed_pass:** true  
**leftover_placeholder_rejected / unknown_placeholder_rejected / missing_placeholder_rejected:** true
