import type { DigitalTwinHealth, ReadinessStatus, ResilienceSeverity } from "./twin-types";

function readinessToPoints(s: ReadinessStatus): number {
  if (s === "ready") return 90;
  if (s === "warning") return 58;
  return 28;
}

function severityToPoints(s: ResilienceSeverity): number {
  if (s === "info") return 82;
  if (s === "warning") return 52;
  return 24;
}

export function computeDigitalTwinHealth(
  accreditationAggregate: ReadinessStatus,
  resilienceAgg: ResilienceSeverity,
  maturityScore: number,
): DigitalTwinHealth {
  const a = readinessToPoints(accreditationAggregate);
  const r = severityToPoints(resilienceAgg);
  const m = Math.max(0, Math.min(100, maturityScore));
  const score = Math.round(a * 0.38 + r * 0.28 + m * 0.34);
  let band: DigitalTwinHealth["band"];
  if (score >= 86) band = "excellent";
  else if (score >= 68) band = "healthy";
  else if (score >= 48) band = "watch";
  else band = "critical";

  const summary =
    band === "excellent"
      ? "Model tijela je stabilan u odnosu na agregirane governance signale — održavati kontinuitet."
      : band === "healthy"
        ? "Digital twin signalizira rutinske pritiske; pratiti odbor i CAPA zatvaranje."
        : band === "watch"
          ? "Topologija je pod stresom — koristite odborski kapacitet i evidence mostove."
          : "Zbunjujuće ili visoko rizično stanje — prioritet eskalacija i CAPA/MR lanca.";

  return { band, score, summary };
}
