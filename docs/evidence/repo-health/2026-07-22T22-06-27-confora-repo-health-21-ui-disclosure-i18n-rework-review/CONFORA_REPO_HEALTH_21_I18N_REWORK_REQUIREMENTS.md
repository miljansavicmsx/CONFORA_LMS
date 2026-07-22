# CONFORA-REPO-HEALTH-21 — i18n Rework Requirements

Applies to `packages/ui/src/ai-disclosure.tsx` before any future import.

## Mandatory

1. **No hardcoded product English as mandatory UI text.**  
   Current defaults (`AI-assisted`, banner paragraph) must not ship as the only path.

2. **All visible text via props and/or translation keys.**  
   Prefer the same pattern as `SkipToMainLink`:
   - required or strongly encouraged `children` / `label` / `message` props, **or**
   - `tKey` + consumer-owned i18n resolver (prefer props in shared UI package to avoid locking to one i18n library).

3. **Safe defaults only if clearly non-product.**  
   Allowed examples:
   - empty string + require prop (fail closed in TypeScript: `message: string` required),
   - demo/storybook-only defaults behind explicit `demo` flag not used in product,
   - no English product sentence as silent default.

4. **Decorative “AI” mark**  
   Either:
   - keep `aria-hidden` and ensure the translated message carries the disclosure meaning, or
   - make the mark part of the translated string / optional prop (`mark?: string`) so locales can omit or adapt.

5. **Variant behavior**  
   `pill` vs `banner` may remain layout variants, but each must still receive locale-specific copy (separate props or one `message` used by both).

## Recommended prop shape (illustrative — not implemented)

```ts
export type AiDisclosureProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'pill' | 'banner';
  /** Required visible disclosure text from product i18n */
  message: string;
  /** Optional decorative mark; default omitted or aria-hidden empty */
  mark?: string;
};
```

Product apps supply translated `message` from locale files. Package does not own English product strings.

## Out of scope for UI package

- Embedding next-intl / react-i18n / message catalogs inside `@confora/ui`.
- Calling backend or loading translations at runtime.

## Acceptance criteria for future W2D-1R import

- [ ] No English product string literals in JSX text nodes for disclosure body.
- [ ] TypeScript forces consumers to pass visible text (or documented demo-only path).
- [ ] Evidence re-review (RH follow-up) confirms i18n + AI governance wording.
- [ ] Barrel policy updated (exclude or split) before `@confora/ui` root export of disclosure.
