# Link validation

## Independent final-tip validation

- Normative tip: `16ccdac0d8ff953c5fca3c06638b955bd3d14277`
- Relative Markdown `[]()` links checked: **28**
- Broken links: **0**
- No normative link depends on an untracked ADR
- No link resolves only because of a local untracked file
- ADR identifiers in normative text remain plain-text references pending R0-1B2.2

Validation method: independent Python scan of the seven normative architecture
files at tip `16ccdac0`, resolving relative targets against `git ls-files`.

## Historical note (pre-repair evidence)

Earlier evidence in this package recorded `Markdown []() links: 0` against the
initial corrupted normative state. That figure is obsolete. The authoritative
result is the independent final-tip validation above.
