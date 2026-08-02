/** Disclosure strings that must accompany AI guidance surfaces. */
export const AI_DISCLOSURE_STANDARD_HR =
  "CONFORA AI navigacija je human-in-the-loop: prijedlozi ne zamjenjuju formalne odluke odbora ni politike kvaliteta.";

export const AI_DISCLOSURE_SHORT_HR = "HITL — prijedlog, ne odluka.";

export function requiresAiDisclosure(surface: "panel" | "badge" | "inline"): boolean {
  return surface !== "badge";
}
