import type { JSX } from "react";

export function CertificationLexiconBanner({ variant }: { readonly variant: "compact" }): JSX.Element {
  return <aside className="rounded-lg border border-border/50 p-3 text-sm text-text-secondary" data-testid="certification-lexicon-banner"><strong className="text-text-primary">Certifikacija:</strong> potvrda o ispitu, certifikat osobe i odluka nadležnog tijela nisu isto. Status prikazuje samo autoritativni zapis.</aside>;
}
