import type { ReactNode } from "react";

import { DisclosureSection } from "./DisclosureSection";

export function DetailDrilldownPanel({
  children,
  defaultOpen = false,
}: {
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
}): ReactNode {
  return (
    <DisclosureSection level="DETAIL" defaultOpen={defaultOpen}>
      {children}
    </DisclosureSection>
  );
}
