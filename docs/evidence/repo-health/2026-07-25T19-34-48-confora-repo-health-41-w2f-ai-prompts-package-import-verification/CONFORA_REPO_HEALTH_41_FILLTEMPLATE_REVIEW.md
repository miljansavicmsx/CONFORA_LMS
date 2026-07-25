# CONFORA REPO HEALTH 41 — fillTemplate Review

## Behavior verified in imported source + tests

| Check | Result |
|-------|--------|
| Rejects triple braces `{{{` | **PASS** |
| Rejects unknown placeholders when `allowedPlaceholders` provided | **PASS** |
| Rejects missing required placeholder values | **PASS** |
| Rejects leftover `{{...}}` after replacement | **PASS** |
| Ignores extra vars safely | **PASS** |
| Values: string/number/boolean only (`toPlainString`) | **PASS** |
| No SafeString / raw HTML / raw object passthrough | **PASS** |

## Per-prompt placeholder map (`AI_PROMPT_PLACEHOLDERS_V1`)

| Prompt ID | Placeholders |
|-----------|--------------|
| `chat.educational` | `context`, `user_message` |
| `chat.support` | `user_message` |
| `question.generate` | `blueprint`, `constraints` |
| `risk.suggest` | `audit_events_last_30d`, `complaints_by_subject`, `instruction` |
| `default` | `user_message` |

Map is explicit, closed, and used by `fillPromptUserTemplateV1`.

**fill_template_fail_closed_pass:** true
