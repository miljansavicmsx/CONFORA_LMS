# Accessibility tool analysis

| Tool / path | Tracked dep | Browser | Status |
|-------------|-------------|---------|--------|
| tsx + tools/a11y contrast | tsx in root; script UNTRACKED | no | BROKEN on CI |
| Playwright axe under tests/e2e | tests/e2e UNTRACKED | yes | UNAVAILABLE |
| Lighthouse script | lighthouse in root; script UNTRACKED | yes | UNAVAILABLE |
| packages/ui tokens | TRACKED | no | AVAILABLE as data |

## Distinctions

- axe browser checks ≠ WCAG conformity
- Playwright heuristics ≠ full AT validation
- Token contrast ≠ rendered-page contrast
- Manual review remains required for legal claims

Do not add a new accessibility product in R0-7D1.
