/** Heuristički tekstovi iz dashboard payload brojeva — ne mijenjaju backend. */

export function trainingCompletionTrendLabel(completed: number, active: number): string {
  const denom = completed + active;
  if (denom <= 0) return "Nema kombiniranih aktivnih/završenih upisa u ovom KPI presjeku.";
  const pct = Math.round((completed / denom) * 100);
  return `Omjer završenih prema svim praćenim upisima: ${pct}% (${completed} završeno / ${denom} ukupno u nazivniku).`;
}

export function severityForCount(n: number, warnThreshold = 1): "success" | "warning" | "danger" {
  if (n <= 0) return "success";
  if (n >= warnThreshold) return "danger";
  return "warning";
}
