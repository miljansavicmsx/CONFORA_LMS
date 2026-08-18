import type { JSX } from "react";

export type PublicTrustMessagingProps = {
  readonly variant: "verification";
};

/** Public read-only boundary disclosure. This component makes no trust decision. */
export function PublicTrustMessaging({ variant }: PublicTrustMessagingProps): JSX.Element {
  if (variant !== "verification") {
    return <></>;
  }

  return (
    <aside className="rounded-lg border border-border/50 bg-surface-secondary/30 p-3 text-sm text-text-secondary" aria-label="Public verification information">
      <p className="font-medium text-text-primary">Public verification is read-only.</p>
      <p className="mt-1">
        A result is displayed only when the existing verification service returns it. This page cannot issue, change, suspend, or approve a certificate.
      </p>
    </aside>
  );
}
