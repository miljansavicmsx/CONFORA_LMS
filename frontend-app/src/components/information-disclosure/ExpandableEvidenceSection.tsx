import type { ReactNode } from "react";

import { DisclosureSection } from "./DisclosureSection";

export function ExpandableEvidenceSection({
  children,
  defaultOpen = false,
}: {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
}): ReactNode {
  return (
    <DisclosureSection level="EVIDENCE" defaultOpen={defaultOpen}>
      {children}
    </DisclosureSection>
  );
}
