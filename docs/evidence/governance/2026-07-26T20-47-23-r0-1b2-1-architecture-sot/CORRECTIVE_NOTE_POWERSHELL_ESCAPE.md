# Corrective note — PowerShell escape corruption

Initial normative commit `d9f97959` was authored via PowerShell here-strings that:
- stripped Markdown backticks;
- interpreted `\a` / `\f` escapes (corrupting `apps/` and `frontend-app`).

Corrective commit(s) rewrite the seven normative files using a Python file writer (no PowerShell string escaping). Independent review should treat the tip after corrective commits as the review target.
