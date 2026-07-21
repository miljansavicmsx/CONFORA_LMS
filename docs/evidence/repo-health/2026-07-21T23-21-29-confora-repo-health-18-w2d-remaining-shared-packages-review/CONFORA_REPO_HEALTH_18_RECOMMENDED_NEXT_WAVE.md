# CONFORA-REPO-HEALTH-18 — Recommended next wave

## Decision

**Option A — `W2D-1_UI_PACKAGE_SOURCE_REVIEW`**

## Why Option A (not B or C)

| Option | Verdict | Why |
|--------|---------|-----|
| **A — UI package source review** | **Recommended** | Smallest real source set (6 files); low secret risk; natural after W2C; still needs explicit review (browser components, AI disclosure) before tracking |
| B — notification templates review | Later | Higher PII/template-placeholder surface; event catalog spans certification/MFA/contact — better after UI |
| C — defer shared packages → W3 API core | Premature | Leaves deferred but importable UI/templates behind; API core is larger and higher risk |

## W2D first commit candidate (this task)

**None.** Import is not authorized until W2D-1 review completes.

### Provisional path list for a *future* W2D-1 import task (not to execute now)

```
packages/ui/src/ai-disclosure.tsx
packages/ui/src/button.tsx
packages/ui/src/index.ts
packages/ui/src/skip-to-main-link.tsx
packages/ui/src/styles.css
packages/ui/tokens.ts
```

## Sequencing after Option A

1. W2D-1 UI source review → controlled import if GO  
2. W2D-2 notification-templates review  
3. Separate database / AI package waves  
4. Then W3 API core planning
