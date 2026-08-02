/** Hard stop phrases for product copy review (Serbian/English mix). */
export const AI_COPY_PROHIBITED_PHRASES: readonly string[] = [
  "automatska odluka",
  "automatic decision",
  "sistem je odlučio",
  "without human review",
  "AI je odobrio",
  "garancija usklađenosti",
];

export function aiCopyContainsProhibitedPhrase(text: string): string | null {
  const t = text.toLowerCase();
  for (const p of AI_COPY_PROHIBITED_PHRASES) {
    if (t.includes(p.toLowerCase())) return p;
  }
  return null;
}
